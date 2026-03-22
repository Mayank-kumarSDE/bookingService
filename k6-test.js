import http from 'k6/http';
import { check, sleep } from 'k6';

// K6 Configuration Options
export const options = {
  // Simulate 50 concurrent users aggressively hitting the endpoint at the exact same moment
  vus: 50,
  duration: '5s',
  
  // Optional thresholds to fail the test if conditions aren't met
  thresholds: {
    // Only expect a tiny fraction of requests to actually succeed (since it's the same hotel)
    'http_req_failed': ['rate>0.90'], 
  },
};

export default function () {
  const url = 'http://localhost:3000/booking';
  
  const payload = JSON.stringify({
    user_id: Math.floor(Math.random() * 1000) + 1, // Random user IDs
    hotel_id: 888,                                 // EVERYONE TARGETS THE SAME HOTEL!
    start_date: "2026-12-25T00:00:00.000Z",
    end_date: "2026-12-30T00:00:00.000Z",
    total_guests: 2,
    booking_amount: 15000.00
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 1. Send the POST request
  const res = http.post(url, payload, params);

  // 2. Add checks to see the results
  check(res, {
    'is created (201)': (r) => r.status === 201,
    'is locked/rejected (400/500)': (r) => r.status === 400 || r.status === 500,
  });

  // Short sleep to prevent completely crashing the local Node process
  sleep(1);
}
