import { createBooking, updateIdempotenyKeyId } from "../repositories/booking.repositories.js";
import { generateIdempotencyKey } from "../utils/helper/getuuid.js";
import { createIdempotencyKey } from "../repositories/idempotency_keys.repo.js";
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/errors/app.error.js';
import logger from '../config/logger.config.js';
export async function createBookingHelper(data){
    const bookingResponse = await createBooking(data);
    logger.info(`Booking created: ${bookingResponse.id}`);
    const idempotencyKey = generateIdempotencyKey();
    logger.info(`idempotency key generated : ${idempotencyKey}`);
    const idempotencyKeyResponse = await createIdempotencyKey(idempotencyKey);
    logger.info(`idempotency key created: ${idempotencyKeyResponse.id}`);
    await updateIdempotenyKeyId(bookingResponse.id, idempotencyKeyResponse.id);
    logger.info(`Linked booking ${bookingResponse.id} to key ${idempotencyKey}`);
    return {
      success: true,
      bookingId: bookingResponse.id,
      idempotencyKey: idempotencyKeyResponse.key,
      message: "Reservation created. Please confirm to complete booking."
    };

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

    // Normal idempodent without concurrency taken care

    
    /*
    const booking = await findBookingByIdempotencyKeyId(keyRecord.id);
    
    if (!booking) {
      throw new NotFoundError('bookingID is not Present in Database');
    }

    if (booking.status !== 'pending') {
      const error = new Error(`Booking is already ${booking.status}`);
      error.statusCode = 400;
      throw error;
    }

    await confirmBooking(booking.id);
    logger.info(`Booking ${booking.id} status changed from 'pending' to 'confirmed'`);
    await markIdempotencyKeyAsProcessed(keyRecord.id);
    logger.info(`Idempotency key ${keyRecord.id} marked as processed`);
    const updatedBooking = await findBookingByIdempotencyKeyId(keyRecord.id);
    logger.info(`Booking ${booking.id} confirmed successfully`);

    return {
      success: true,
      booking: updatedBooking,
      alreadyProcessed: false,
      message: 'Booking confirmed successfully'
    };
    */




    // i used optimistc locking here for reason read readmme file 

    // --- OPTIMISTIC LOCKING LOGIC STARTS HERE ---

    // 1. Attempt to confirm booking atomically
    const bookingUpdatedCount = await confirmBooking(booking.id);

    // 2. If 0 rows updated, someone else won the race
    if (bookingUpdatedCount === 0) {
        logger.info(`Race condition detected for booking ${booking.id}. Another request confirmed it.`);
        
        // Ensure key is marked processed so next click hits the FAST PATH
        await markIdempotencyKeyAsProcessed(keyRecord.id);
        
        const existingBooking = await findBookingByIdempotencyKeyId(keyRecord.id);
        return {
            success: true,
            booking: existingBooking,
            alreadyProcessed: true,
            message: 'Booking was already confirmed'
        };
    }

    // 3. If we get here, WE won the race. Mark the key as processed.
    await markIdempotencyKeyAsProcessed(keyRecord.id);
    logger.info(`Idempotency key ${keyRecord.id} marked as processed`);

    const updatedBooking = await findBookingByIdempotencyKeyId(keyRecord.id);
    logger.info(`Booking ${booking.id} confirmed successfully`);

    return {
        success: true,
        booking: updatedBooking,
        alreadyProcessed: false,
        message: 'Booking confirmed successfully'
    };
}