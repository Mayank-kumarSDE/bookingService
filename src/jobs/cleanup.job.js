import { Op } from 'sequelize';
import { Booking } from '../db/models/index.js';
import logger from '../config/logger.config.js';

/**
 * Cancels all pending bookings whose expires_at has passed.
 * This frees up those dates for new bookings.
 */
export async function cancelExpiredBookings() {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const [updatedCount] = await Booking.update(
      { status: 'cancelled' },
      {
        where: {
          status: 'pending',
          [Op.or]: [
            { expires_at: { [Op.lt]: new Date() } },         // expires_at is set and past
            {
              expires_at: null,                               // old rows before migration
              created_at: { [Op.lt]: fifteenMinutesAgo }     // older than 15 min
            }
          ]
        }
      }
    );

    if (updatedCount > 0) {
      logger.info(`[Cleanup] Cancelled ${updatedCount} expired pending booking(s). Dates are now available.`);
    }
  } catch (err) {
    logger.error('[Cleanup] Failed to cancel expired bookings:', err);
  }
}
