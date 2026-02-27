import express from 'express'
//import {  validateRequestBody } from '../../validators';
//import { createBookingSchema } from '../../validators/booking.validator';
import {createBookingController,handleConfirmBooking} from '../controller/booking.controller.js';

const bookingRouter = express.Router();

bookingRouter.post('/', createBookingController);
bookingRouter.post('/confirm',handleConfirmBooking)


export default bookingRouter;