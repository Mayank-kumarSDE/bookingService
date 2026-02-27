import { sequelize, Booking, IdempotencyKey } from './src/db/models/index.js';

async function test() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    console.log('Booking model:', typeof Booking);
    console.log('IdempotencyKey model:', typeof IdempotencyKey);
    
    console.log('✅ Models loaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1); 
  }
}

test();


// validation part bacha hai 
// cancellation wala part bacha hai


/*
{ 
        "user_id": 5,
        "hotel_id": 899,
        "total_guests": 2,
        "booking_amount": "3420.00"
}
*/
 