import { Booking } from '../db/models/index.js';
import logger from '../config/logger.config.js';


export async function createBooking(data){
    const bookingResponse = await Booking.create({
        user_id:data.user_id,
        hotel_id:data.hotel_id,
        total_guests:data.total_guests,
        booking_amount: data.booking_amount

    })
    return bookingResponse;
}


export async function updateIdempotenyKeyId(bookingId, idempotencyKeyId) { 
  const [updatedCount] = await Booking.update(
    { idempotencyKeyId: idempotencyKeyId },    
    { where: { id: bookingId } }               
  );
  return updatedCount;
}
//confirmation phase 

/**
 * Find booking by idempotencyKeyId (via foreign key link)
 */
export async function findBookingByIdempotencyKeyId(idempotencyKeyId) {
  const booking = await Booking.findOne({
    where: { idempotencyKeyId }
  });
  return booking;
}

/**
 * Confirm booking (update status)
 */
/*

// WITHOUT CONCURRENCY TAKEN CARE


export async function confirmBooking(bookingId) {
  const [updatedCount] = await Booking.update(
    { status: 'confirmed' },
    { where: { id: bookingId } }
  );
  
  logger.info(`Booking ${bookingId} confirmed`);
  return updatedCount;
}
*/


// CONCURRENCY TAKEN CARE BY OPTIMISTIC LOCKING

export async function confirmBooking(bookingId) {
    // OPTIMISTIC LOCKING: Only update if status is STILL 'pending'
    const [updatedCount] = await Booking.update(
        { status: 'confirmed' },
        { 
            where: { 
                id: bookingId, 
                status: 'pending'  // <--- ADD THIS LINE
            } 
        }
    );
    
    logger.info(`Booking ${bookingId} confirm attempted, ${updatedCount} rows updated`);
    return updatedCount; // <--- RETURN THIS
}