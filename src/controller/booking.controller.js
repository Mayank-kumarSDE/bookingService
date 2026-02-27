import { createBookingHelper,confirmBookingHelper  } from "../service/booking.service.js";
import logger from "../config/logger.config.js";


export async function createBookingController (req,res){
    const response = await createBookingHelper(req.body)
    res.status(201).json({
        bookingId: response.bookingId,
        idempotencyKey: response.idempotencyKey
    });
}


// second phase
export async function handleConfirmBooking(req, res) {
    try{
        const result = await confirmBookingHelper(req.body.idempotencyKey);
        return res.status(result.alreadyProcessed ? 200 : 200).json(result);

    }
    catch (error) {
    logger.error('Controller error:', error);  
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to confirm booking',
      status: 'error'
    });
  }
}