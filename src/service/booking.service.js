import { createBooking, updateIdempotencyKeyId } from "../repositories/booking.repositories.js";
import { generateIdempotencyKey } from "../utils/helper/getuuid.js";
import { createIdempotencyKey } from "../repositories/idempotency_keys.repo.js";
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/errors/app.error.js';
import logger from '../config/logger.config.js';
import { serverConfig } from "../config/index.js";
import {redlock} from "../config/redis.config.js"
import { Op } from 'sequelize';
import { Booking } from '../db/models/index.js'; // Import Booking model
import { sequelize } from '../db/models/index.js'; // Import the sequelize instance
import { addBookingConfirmationToQueue } from "../producers/mailer.producer.js";

export async function createBookingHelper(data) {
  const { hotel_id, start_date, end_date, user_id, total_guests, booking_amount } = data;
  const ttl = serverConfig.lock_ttl;
  const bookingResources = `hotel:${hotel_id}`;
  let lock = null;
  let t;

  try {
    // 1. ACQUIRE REDIS LOCK FIRST
    lock = await redlock.acquire([bookingResources], ttl);
    logger.info(`Lock acquired for hotelId: ${bookingResources}`);

    // 2. CHECK OVERLAPS OUTSIDE TRANSACTION (but inside Redis lock)
    //    - confirmed bookings always block
    //    - pending bookings only block if they haven't expired yet
    const overlappingBooking = await Booking.findOne({
      where: {
        hotel_id: hotel_id,
        [Op.or]: [
          { status: 'confirmed' },
          {
            status: 'pending',
            expires_at: { [Op.gt]: new Date() }  // only live pending blocks
          }
        ],
        start_date: { [Op.lt]: new Date(end_date) },
        end_date: { [Op.gt]: new Date(start_date) }
      }
      // NO transaction needed here since Redis lock protects us
    });

    if (overlappingBooking) {
      throw new BadRequestError('These dates are unavailable.');
    }

    // 3. ONLY START TRANSACTION IF OVERLAP CHECK PASSES
    t = await sequelize.transaction();

    // 4. CREATE BOOKING (Inside Transaction)
  // Set expires_at = LOCK_TTL + 5 min buffer (gives user time to confirm while lock is held)
  const expiresAt = new Date(Date.now() + ttl + 5 * 60 * 1000);

  const bookingResponse = await createBooking({
    user_id,
    hotel_id,
    start_date,
    end_date,
    total_guests,
    booking_amount,
    expires_at: expiresAt
  }, { transaction: t });

    // 5. CREATE IDEMPOTENCY KEY (Inside Transaction)
    const idempotencyKey = generateIdempotencyKey();
    const idempotencyKeyResponse = await createIdempotencyKey(
      { key: idempotencyKey }, 
      { transaction: t }
    );

    // 6. LINK THEM (Inside Transaction)
    await updateIdempotencyKeyId(
            bookingResponse.id,
            idempotencyKeyResponse.id,
            { transaction: t }
    );

    // 7. COMMIT
    await t.commit();
    logger.info(`Transaction committed for booking ${bookingResponse.id}`);

    return {
      success: true,
      bookingId: bookingResponse.id,
      idempotencyKey: idempotencyKeyResponse.key,
      message: "Reservation created. Please confirm."
    };

  } catch (err) {
    if (t) {
      await t.rollback();
      logger.warn(`Transaction rolled back for hotel ${hotel_id}`);
    }
    
    logger.error(`Booking process failed:`, err);
    if (err instanceof BadRequestError) throw err;
    throw new InternalServerError('Failed to create booking');
    
  } finally {
    if (lock) {
      await lock.release().catch((e) => logger.error("Lock release failed", e));
    }
  }
}

// confirmation phase 

import { findIdempotencyKeyByKey, markIdempotencyKeyAsProcessed } from "../repositories/idempotency_keys.repo.js";
import { findBookingByIdempotencyKeyId, confirmBooking } from "../repositories/booking.repositories.js";

export async function confirmBookingHelper(idempotencyKey) {
    const keyRecord = await findIdempotencyKeyByKey(idempotencyKey);
    if (!keyRecord) {
        throw new NotFoundError('key is not Present in Database');
    }
    logger.info(`Idempotency key ${idempotencyKey} id found`);

    if (keyRecord.is_processed === true) {
      logger.info(`Idempotency key ${idempotencyKey} already processed - returning existing booking`);
      
      const existingBooking = await findBookingByIdempotencyKeyId(keyRecord.id);
      return {
        success: true,
        booking: existingBooking,
        alreadyProcessed: true,
        message: 'Booking was already confirmed'
      };
    }

    // i used optimistc locking here for reason read README file 

    // --- OPTIMISTIC LOCKING LOGIC STARTS HERE ---

    // 1. Attempt to confirm booking atomically
    const booking = await findBookingByIdempotencyKeyId(keyRecord.id);
    
    if (!booking) {
      throw new NotFoundError('bookingID is not Present in Database');
    }

    if (booking.status !== 'pending') {
      const error = new Error(`Booking is already ${booking.status}`);
      error.statusCode = 400;
      throw error;
    }
    const bookingUpdatedCount = await confirmBooking(booking.id);

    // 2. If 0 rows updated, someone else won the race
    if (bookingUpdatedCount === 0) {
        logger.info(`Race condition detected for booking ${booking.id}. Another request confirmed it.`);
        
        // Ensure key is marked processed so next click hits the FAST PATH
        await markIdempotencyKeyAsProcessed(keyRecord.id);
        const markResult = await markIdempotencyKeyAsProcessed(keyRecord.id);
    
        if (markResult === 0) {
          logger.debug(`Key ${keyRecord.id} was already marked processed by the winner.`);
        }
        
        const existingBooking = await findBookingByIdempotencyKeyId(keyRecord.id);
        return {
            success: true,
            booking: existingBooking,
            alreadyProcessed: true,
            message: 'Booking operation completed successfully' 
        };
    }

    // 3. If we get here, WE won the race. Mark the key as processed.
    // --- I WON THE RACE ---
    // Now, atomically mark the key as processed.
    const markResult = await markIdempotencyKeyAsProcessed(keyRecord.id);
    if (markResult === 0) {
      // This is an unexpected state. We won the booking update but failed to mark the key.
      // It could mean the key was somehow modified between our checks. Log it for investigation.
       logger.error(`Critical: Won booking race for ${booking.id} but failed to mark key ${keyRecord.id} as processed.`);
    }
    const updatedBooking = await findBookingByIdempotencyKeyId(keyRecord.id);
    logger.info(`Booking ${booking.id} confirmed successfully`);

        // NOTIFICATON  BLOCK START
    try {
      const notificationData = {
        booking_id: updatedBooking.id,
        // HARDCODED FOR TESTING
        user_email: "321mayankkumar@gmail.com", 
        user_name: "Mayank Kumar",
        hotel_name: "Grand Plaza Hotel", 
        start_date: updatedBooking.start_date,
        end_date: updatedBooking.end_date,
      };

      // Fire and forget
      addBookingConfirmationToQueue(notificationData)
        .catch(err => {
          logger.error(`[Metrics] CRITICAL: Failed to queue booking confirmation email for booking ${updatedBooking.id}`);
          logger.error(`[Metrics] Reason: ${err.message}`);
        });
      
      logger.info(`Notification queued for booking ${updatedBooking.id}`);
    } catch (error) {
      logger.error('Error preparing booking confirmation notification:', error);
    }
    // NOTIFCATION BLOCK END

    return {
      success: true,
      booking: updatedBooking,
      alreadyProcessed: false, // We performed the action
      message: 'Booking operation completed successfully'
    };
}