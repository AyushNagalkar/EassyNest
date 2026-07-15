# Setup Guide — EassyNest

Follow these instructions to configure and run EassyNest locally on your machine.

---

## 📋 Prerequisites
Ensure you have the following installed before starting:
- **Node.js** (v20 or higher recommended)
- **npm** (v10 or higher)
- **PostgreSQL** instance (you can spin up a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech))
- **Redis** server (or a free cloud Redis instance on [Upstash](https://upstash.com) for BullMQ queues)

---

## 🛠️ Step-by-Step Installation

### 1. Clone & Organize
Clone the repository to your local directory:
```bash
git clone https://github.com/AyushNagalkar/EassyNest.git
cd EassyNest
```

---

### 2. Backend Configuration & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install NestJS backend dependencies:
   ```bash
   npm install
   ```
3. Create your local environment configuration file:
   ```bash
   cp .env.example .env
   ```
4. Open the newly created `.env` file and fill in the required variables (see **Environment Variables** section below).
5. Run the Prisma database migrations to create the tables in your PostgreSQL database:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Seed the database with sample seed data (sets up 1 Admin, 2 Owners, 3 Tenants, 5 Properties, 3 Seeker Profiles):
   ```bash
   npx prisma db seed
   ```
7. Start the backend NestJS development server:
   ```bash
   npm run start:dev
   ```
   *The backend REST API will be running at `http://localhost:4000/api/v1` and WebSockets will listen on port `4000`.*

---

### 3. Frontend Configuration & Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Next.js frontend dependencies:
   ```bash
   npm install
   ```
3. Create your local environment configuration file:
   ```bash
   cp .env.example .env.local
   ```
4. Open `.env.local` and specify the API base URLs:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
   NEXT_PUBLIC_WS_URL=http://localhost:4000
   ```
5. Start the frontend Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be running at `http://localhost:3000`.*

---

## 🔑 Environment Variables Reference

### Backend `.env` Template
```env
PORT=4000
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
DIRECT_URL="postgresql://username:password@host:port/database?schema=public"

# Auth Secret
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Upstash Redis / Local Redis Config (for BullMQ)
REDIS_URL="redis://default:token@host:port"

# Gemini AI API Key
GEMINI_API_KEY="AIzaSy..."

# Resend / Brevo Email API Key
EMAIL_API_KEY="re_..."
EMAIL_FROM="EassyNest <noreply@eassynest.com>"

# Frontend Origin URL (CORS verification)
FRONTEND_URL="http://localhost:3000"
```

### Frontend `.env.local` Template
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_WS_URL="http://localhost:4000"
```

---

## 👥 Demo User Accounts
The seed script populates the database with these credentials:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@eassynest.com` | `AdminPassword123!` |
| **Owner** | `owner1@eassynest.com` | `OwnerPassword123!` |
| **Tenant** | `tenant1@eassynest.com` | `TenantPassword123!` |

You can log in directly with these credentials to test the compatibility scoring, interest flows, and messaging functionality.
