import { mailerQueue } from '../queues/mailer.queue.js'; // Only import the queue

// Define the job name constant
export const MAIL_JOB_NAME = 'send-email-job';

/**
 * Adds an email job to the queue.
 * @param {Object} payload - The email data (to, subject, body, etc.)
 */
export const addEmailToQueue = async (payload) => { // <-- Accept payload as an argument
  await mailerQueue.add(MAIL_JOB_NAME, payload);
  console.log(`Email added to queue: ${JSON.stringify(payload)}`);
};