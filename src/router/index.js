import bookingRouter from "./booking.router.js";
import express from 'express'
const Router = express.Router()

Router.use('/booking',bookingRouter);
export default Router;