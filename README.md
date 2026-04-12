# PawMigos

PawMigos is a two-sided, trust-first pet services marketplace Phase 1 Next.js application. It supports Pet Parents, Hosts/Providers, and Admin roles. 

## Features
- Validated Dual Onboarding (Pet Parents & Service Providers)
- Complex Pet Profile & Health configurations
- Real-time Deterministic Compatibility Engine
- Robust Booking capabilities with slot management and concurrency checks
- Phone OTP based Authentication (Mocked SMS in Local)
- Signzy Abstraction (Mocked ID Verification in Local)

## Tech Stack
- **Framework:** Next.js 15 (App Router), React 19
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** Custom OTP Abstraction JWT

## Setup Instructions

### 1. Requirements
Ensure you have Node.js 20+ installed.

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Ensure `.env` matches the required structure:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/pawmigos_db"
JWT_SECRET="pawmigos-dev-jwt-secret-change-in-production"
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RATE_LIMIT_MINUTES=1
SMS_PROVIDER=dev
SIGNZY_MODE=dev
```

### 4. Database Setup & Seeding
This pushes the Prisma schema directly to your local database and seeds it with structured test profiles.

```bash
npm run db:push
npm run db:seed
```

**Seed Accounts available:**
- Consumer: `9876543210` (Priya - has 2 pets)
- Provider: `9876543220` (Rahul - Boarding provider)
*(Dev OTP is any 6 digits e.g. `123456`)*

### 5. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`

### 6. Running Tests
To run the automated API and Domain tests (Auth, Compatibility, Validations, Booking conflicts):
```bash
npm run test
```
