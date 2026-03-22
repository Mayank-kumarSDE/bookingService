import express from 'express'
import {serverConfig} from './src/config/index.js'
import pingRouter from './src/router/pingRouter.js'
import genricError from './src/middleware/error.middleware.js';
import logger from './src/config/logger.config.js';
import { attachCorrelationIdMiddleware} from './src/middleware/corelation.middleware.js'
import  sequelize from './src/db/models/index.js'; 
import Router from './src/router/index.js';
import cron from 'node-cron';
import { cancelExpiredBookings } from './src/jobs/cleanup.job.js';
import { serverAdapter } from './src/config/bull-board.config.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachCorrelationIdMiddleware)

// Mount the Bull-Board Dashboard
app.use('/admin/queues', serverAdapter.getRouter());

app.use(pingRouter)
app.use(Router);
app.use(genricError);


app.listen(serverConfig.port, async() => {
  logger.info(`Example app listening on localhost ${serverConfig.port} `);
  await sequelize.authenticate;
  logger.info('Connection has been established successfully.');

  // Run every 5 minutes — cancels pending bookings whose expires_at has passed
  cron.schedule('*/5 * * * *', cancelExpiredBookings);
  logger.info('Cleanup cron job scheduled (every 5 minutes)');
})



/*
{
  "user_id": 67,
  "hotel_id": 12,
  "start_date": "2026-04-01T00:00:00.000Z",
  "end_date": "2026-04-05T00:00:00.000Z",
  "total_guests": 2,
  "booking_amount": 76420.00
}
  */