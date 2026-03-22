# 🏨 Booking-Service
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Problems Solved](#-problems-solved)
- [Booking Flow](#-booking-flow)
- [Booking Confirmation Flow](#-booking-confirmation-flow)
- [API Endpoints](#-api-endpoints)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Folder Structure](#-folder-structure)

---

## ✨ Problems Solved

### Problem 1: Double-Click on Confirm Button

**Issue:** A user accidentally clicks "Confirm Booking" twice, resulting in:
- Double charging
- Duplicate bookings
- Data inconsistency

**Solution:** Idempotency Pattern with Optimistic Locking

---

### Problem 2: Race Condition During Booking Creation

**Issue:** Two users try to book the same hotel at the exact same time.

```
Time 0ms:  User A checks availability → Hotel 8 available ✅
Time 1ms:  User B checks availability → Hotel 8 available ✅
Time 2ms:  User A creates booking     → Success ✅
Time 3ms:  User B creates booking     → Success ✅ (OVERBOOKING! ❌)
```

**Solution:** [Redlock](https://redis.io/docs/manual/patterns/distributed-locks/) (Distributed Locking)

---

### Problem 3: Ghost Bookings (Inventory Blocking)

**Issue:** A user starts a booking (acquiring a lock) but never completes the payment/confirmation. The hotel remains stuck in a `pending` state forever, blocking other users.

**Solution:** Time-to-Live (TTL) `expires_at` Column + Node-Cron Cleanup Job.
Pending bookings automatically expire after 15 minutes, instantly freeing up the dates in overlap queries, and a background cron job periodically sweeps them to `cancelled`.

---

## 🔒 Booking Flow

### Phase 1: Create Booking

```
Time 0ms:   User 7 sends POST /booking
            ↓
            redlock.acquire(['hotel:8'], 300000)
            ↓
            🔒 LOCK ACQUIRED (TTL: 5 minutes)
            ↓
            createBooking(data)
            ↓
            Create idempotency key
            ↓
            Return { success: true, bookingId: 10 }
            ↓
            🔒 Lock STILL HELD (auto-expires in ~5 min, or on cancel)

Time 20ms:  User 7 receives response ✅
```

### Concurrent Request — Same Hotel

```
Time 20ms:  User 90 sends POST /booking (same hotel:8)
            ↓
            redlock.acquire(['hotel:8'], 300000)
            ↓
            ❌ FAILED — lock held by User 7
            ↓
            Retry 1: wait 100ms... still locked ❌
            ↓
            throw InternalServerError('This hotel is held by another user')
```

### After Lock Expiry

```
Time +5min: 🔒 REDLOCK AUTO-EXPIRES
            ↓
            Lock released automatically
            ↓
            ✅ Hotel 8 is available again

            User 90 retries → lock acquired → booking created ✅
```

### Redlock Configuration

| Setting     | Value    |
|-------------|----------|
| retryCount  | 1        |
| retryDelay  | 100ms    |
| Total wait  | ~100ms   |
| Lock TTL    | 300,000ms (5 minutes) |

---

## ✅ Booking Confirmation Flow

Handles duplicate confirm requests (e.g. double-click) using optimistic locking on the `status` column.

```
User clicks "Confirm" twice (10ms apart)

Request A:                              Request B:
1. GET idempotency key                  1. GET idempotency key
2. Check is_processed = false ✅        2. Check is_processed = false ✅
3. UPDATE booking                       3. UPDATE booking
   WHERE status = 'pending'                WHERE status = 'pending'
4. Result: 1 row updated ✅             4. Result: 0 rows updated ❌
5. Mark key as processed                5. Detect 0 rows → already processed
6. Return: "Confirmed" ✅               6. Return: "Already confirmed" ✅

Result: Only ONE booking confirmed ✅
```

---

## 📬 Asynchronous Notifications

To prevent the Booking Service from hanging while sending emails, we decoupled notifications using a **Redis-backed Message Queue (BullMQ)**.

1. User confirms booking ✅
2. Booking status updates to `confirmed` ✅
3. **Fire-and-forget** job is pushed to `queue-mailer` 📥
4. Notification Service (Consumer) picks up the job and sends the email 📧

**Monitoring:** We use `@bull-board` integrated into the Express app to visually monitor queue latency, throughput, and failed jobs in real-time.

---

## 🚦 Load Testing & Race Condition Validation (K6)

We ran aggressive load tests using **K6** to mathematically prove the Redlock mechanism prevents overbooking.

**The Test:** 50 concurrent virtual users attempting to book the *exact same hotel* at the *exact same millisecond*.

**The Results (from K6 Output):**

```text
checks_total.......: 482
✓ is created (201).................: 1 / 240   (Exactly 1 success)
✓ is locked/rejected (400/500).....: 240 / 1   (Exactly 240 rejected)
```

**Conclusion:** The backend successfully survived an extreme race condition. The distributed lock flawlessly allowed exactly *one* person through and perfectly defended the hotel dates from the other 240 attempts, completely solving the overbooking problem.

---

## 🧪 API Endpoints

### POST `/booking` — Create Booking (Phase 1)

**Request:**
```json
{
  "user_id": 7,
  "hotel_id": 8,
  "total_guests": 2,
  "booking_amount": "76420.00"
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "bookingId": 10,
  "idempotencyKey": "9d0e7ea4-da7a-45de-829e-60b71243bee3",
  "message": "Reservation created. Please confirm to complete booking."
}
```

**Response — 400 Bad Request (hotel locked):**
```json
{
  "status": "error",
  "message": "this hotel is held by another user"
}
```

---

### POST `/booking/confirm` — Confirm Booking (Phase 2)

**Request:**
```json
{
  "idempotencyKey": "9d0e7ea4-da7a-45de-829e-60b71243bee3"
}
```

**Response — 200 OK (first confirmation):**
```json
{
  "success": true,
  "booking": {
    "id": 10,
    "status": "confirmed"
  },
  "alreadyProcessed": false,
  "message": "Booking confirmed successfully"
}
```

**Response — 200 OK (duplicate confirmation):**
```json
{
  "success": true,
  "booking": {
    "id": 10,
    "status": "confirmed"
  },
  "alreadyProcessed": true,
  "message": "Booking was already confirmed"
}
```

---

## 🛠 Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Redis (required for Redlock distributed locking)
- PostgreSQL or MySQL (for booking data)

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/Mayank-kumarSDE/bookingService.git
cd bookingService

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 4. Run database migrations
npx sequelize-cli db:migrate

# 5. Start the development server
npm run server
```

---

## 🔧 Environment Variables

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=booking_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
REDIS_URL=redis://localhost:6379
LOCK_TTL = 600000
```

---

## 📁 Folder Structure

```
bookingService/
├── src/
│   ├── config/         # App, DB, Redis, and Bull-Board configuration
│   ├── controller/     # Request endpoints (booking, confirmation)
│   ├── db/             # Sequelize models, migrations, and seeders
│   ├── jobs/           # Node-Cron jobs (stale booking cleanup)
│   ├── middleware/     # Global error handling, correlation ID
│   ├── producers/      # Email job publishers (addBookingConfirmationToQueue)
│   ├── queues/         # BullMQ setup and QueueEvents listeners
│   ├── repositories/   # Direct DB queries (Booking, Idempotency)
│   ├── router/         # Express API route mapping
│   ├── service/        # Core business logic (Redlock, overlap checks)
│   ├── utils/          # Helpers (UUID gen, redlock init, logger)
│   └── validators/     # Request schema validations
├── server.js           # Server entry point
├── k6-test.js          # Load testing script (Race condition validation)
├── .sequelizerc
├── package.json
└── README.md
```
