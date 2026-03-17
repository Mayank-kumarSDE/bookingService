// src/utils/queue/notification.queue.js
import { Queue } from 'bullmq';
import {redisClient}  from '../config/redis.config.js';

export const MAILER_QUEUE = 'queue-mailer';

// Initialize the Queue connected to Redis
export const mailerQueue = new Queue(MAILER_QUEUE, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 1000, // Wait 1s, then 2s, then 4s before retrying
    },
  },
});
