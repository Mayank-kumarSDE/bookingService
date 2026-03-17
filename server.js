import express from 'express'
import {serverConfig} from './src/config/index.js'
import pingRouter from './src/router/pingRouter.js'
import genricError from './src/middleware/error.middleware.js';
import logger from './src/config/logger.config.js';
import { attachCorrelationIdMiddleware} from './src/middleware/corelation.middleware.js'
import  sequelize from './src/db/models/index.js'; 
import Router from './src/router/index.js';
import { addEmailToQueue } from './src/producers/mailer.producer.js'; 
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachCorrelationIdMiddleware)
app.use(pingRouter)
app.use(Router);
app.use(genricError);


// For notication Testing 
/*
const testPayload = {
  to: "psanjeevkumar334@gmail.com", // Put your real email here to test
  subject: "Booking Confirmation Test",
  templateId: "welcome",
  templateData: {
    userName: "Mayank Kumar",
    bookingId: "BK98765",
    hotelName: "Grand Plaza",
    checkInDate: "2026-04-01",
    checkOutDate: "2026-04-05"
  }
};
// Call the producer function with the test payload
addEmailToQueue(testPayload)
  .then(() => console.log("✅ Test job added to queue successfully!"))
  .catch(err => console.error("❌ Failed to add test job:", err));
  */

app.listen(serverConfig.port, async() => {
  logger.info(`Example app listening on localhost ${serverConfig.port} `)
  await sequelize.authenticate;
  logger.info('Connection has been established successfully.');
})
