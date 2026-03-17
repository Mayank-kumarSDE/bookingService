import { mailerQueue } from '../queues/mailer.queue.js';

export const MAIL_JOB_NAME = 'send-email-job';

/**
 * Adds a booking confirmation email job to the queue
 */
export const addBookingConfirmationToQueue = async (bookingData) => {
  const payload = {
    type: 'booking-confirmed',
    to: bookingData.user_email,
    subject: `Booking Confirmed - ${bookingData.hotel_name}`,
    templateId: 'welcome', // Matches your welcome.hbs file
    templateData: {
      userName: bookingData.user_name,
      bookingId: bookingData.booking_id,
      hotelName: bookingData.hotel_name,
      checkInDate: new Date(bookingData.start_date).toLocaleDateString(),
      checkOutDate: new Date(bookingData.end_date).toLocaleDateString(),
    },
  };

  await mailerQueue.add(MAIL_JOB_NAME, payload);
  console.log(`✅ Booking confirmation queued for ${payload.to}`);
};