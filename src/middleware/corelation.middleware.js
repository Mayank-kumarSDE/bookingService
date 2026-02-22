
import { v4 as uuidV4 } from 'uuid'
import logger from '../config/logger.config.js';
import { asyncLocalStorage } from '../utils/helper/requests.helper.js';
export const attachCorrelationIdMiddleware = (req, res, next) => {
  // Generate a unique correlation ID
  const correlationId = uuidV4();
  logger.info("attaching correlationID")
   req.headers['X-Correlation-ID'] = correlationId;
   asyncLocalStorage.run({ correlationId }, () => {
    logger.info('Request received', {correlationId,});
    next();
   })
}