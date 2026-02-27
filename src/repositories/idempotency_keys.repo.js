import {IdempotencyKey} from '../db/models/index.js';
import logger from '../config/logger.config.js';
export async function createIdempotencyKey(data){
    const idempotencyKeyResponse = await IdempotencyKey.create({
        key:data,
        is_processed: false
    })
    return idempotencyKeyResponse;
}

// confirmation phase 
/*
 Find idempotency key by UUID
 */
export async function findIdempotencyKeyByKey(key) {
  const idempotencyKey = await IdempotencyKey.findOne({
    where: { key }
  });
  return idempotencyKey;
}

/*
 Update idempotency key to processed
 */
// WIHTOUT CONCURRENCY TAKEN CARE
/*
export async function markIdempotencyKeyAsProcessed(id) {
  const [updatedCount] = await IdempotencyKey.update(
    { is_processed: true },
    { where: { id } }
  );
  return updatedCount;
}
*/


// WITH CONCURRENCY TAKEN CARE
export async function markIdempotencyKeyAsProcessed(id) {
    // OPTIMISTIC LOCKING: Only update if is_processed is STILL false
    const [updatedCount] = await IdempotencyKey.update(
        { is_processed: true },
        { 
            where: { 
                id: id,
                is_processed: false // <--- ADD THIS LINE
            } 
        }
    );
    return updatedCount; // <--- RETURN THIS
}