// test-uuid.js
import crypto from 'crypto';

export function generateIdempotencyKey() {
  return crypto.randomUUID();
}