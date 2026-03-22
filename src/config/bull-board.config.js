import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { mailerQueue } from '../queues/mailer.queue.js';

// Setup Express Adapter
export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// Setup Bull-Board
export const bullBoard = createBullBoard({
  queues: [new BullMQAdapter(mailerQueue)],
  serverAdapter: serverAdapter,
});
