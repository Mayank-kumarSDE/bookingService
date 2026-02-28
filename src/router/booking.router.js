import express from 'express'
import {  validateRequestBody } from '../validators/index.js';
import { createBookingSchema , confirmBookingSchema} from '../validators/booking.validator.js'
import {createBookingController,handleConfirmBooking} from '../controller/booking.controller.js';

const bookingRouter = express.Router();

bookingRouter.post('/', validateRequestBody(createBookingSchema) ,createBookingController);
bookingRouter.post('/confirm',validateRequestBody(confirmBookingSchema),handleConfirmBooking)


export default bookingRouter;