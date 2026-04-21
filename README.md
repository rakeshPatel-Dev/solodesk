# Solodesk

Solodesk is a full-stack project management and client operations platform with:

- Authenticated dashboard experience
- Client management
- Payment tracking and analytics
- Project/task modules scaffolded in backend and integrated in frontend pages

This repository is organized as a monorepo-style workspace with separate frontend and backend applications.

## Monorepo Structure

```text
solodesk/
├─ client/   # React + TypeScript + Vite frontend
└─ server/   # Node.js + Express + MongoDB backend API
```

## Tech Stack

### Frontend (client)

- React 19 + TypeScript
- Vite 8
- React Router 7
- Redux Toolkit + React Redux
- Axios
- Tailwind CSS v4
- Radix/shadcn-style UI components
- Framer Motion

### Backend (server)

- Node.js (ESM)
- Express 5
- MongoDB + Mongoose
- JWT auth (cookie + Bearer token support)
- bcryptjs for password hashing
- cookie-parser and CORS middleware

## Features

### Implemented and active

- Authentication: register, login, logout, get current user
- Account security flows: forgot/reset password, change password
- Account lifecycle: deactivate account, delete account (with related-data cascade)
- Client management (CRUD + stats + search + bulk delete + status updates)
- Payment management (CRUD + stats + overdue + filters + bulk delete)
- Protected frontend app shell with route guarding and auth persistence

### Present in codebase but not currently mounted in app

- Project routes/controller/model
- Task routes/controller/model

The frontend includes pages for projects/tasks, but backend route mounting currently includes:

- /api/auth
- /api/clients
- /api/payments

## Prerequisites

- Node.js 20+
- pnpm 10+
- MongoDB instance (local or cloud)

## Quick Start

Open two terminals from repository root and run backend + frontend separately.

### 1. Install dependencies

```bash
cd server
pnpm install

cd ../client
pnpm install
```

### 2. Configure environment variables

Create a .env file in server/:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/solodesk

# Auth
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7d

# CORS / Frontend origin
CLIENT_URL=http://localhost:5173
# Optional: comma-separated list for multiple origins
# CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173

# Used in forgot-password reset URL generation
FRONTEND_URL=http://localhost:5173
```

Create a .env file in client/:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Run development servers

Backend:

```bash
cd server
pnpm dev
```

Frontend:

```bash
cd client
pnpm dev
```

### 4. Open app

- Frontend: http://localhost:5173
- Backend health/root response: http://localhost:3000

## Scripts

### client/package.json

- pnpm dev: Start Vite dev server
- pnpm build: Type-check and production build
- pnpm lint: Run ESLint
- pnpm preview: Preview production build

### server/package.json

- pnpm dev: Start API with nodemon
- pnpm start: Start API with node
- pnpm test: Run Node test runner

## Architecture Overview

### Frontend flow

- Axios instance uses VITE_API_URL and sends credentials by default.
- On app load, frontend calls GET /api/auth/me to validate cookie/session.
- Auth state is stored in Redux and persisted to localStorage key solodesk-auth.
- Unauthenticated users are redirected to /auth/login.

### Backend flow

- server.js loads env and connects to MongoDB before starting Express.
- app.js configures JSON parser, CORS (with credentials), cookie-parser.
- Auth middleware accepts JWT from either:
  - cookie: token
  - Authorization header: Bearer <token>
- Error responses are normalized through utility helpers.

## API Reference

Base URL: http://localhost:3000/api

Most endpoints return JSON with a success boolean.

### Auth routes (/api/auth)

Public:

- POST /register
- POST /login
- POST /forgot-password
- POST /reset-password/:resetToken

Protected:

- GET /me
- POST /logout
- PUT /change-password
- PUT /deactivate-account
- DELETE /delete-account

Notes:

- Login/register set an httpOnly cookie named token.
- In non-production, forgot-password returns resetToken/resetURL in response.

### Client routes (/api/clients) [Protected]

- GET /stats
- GET /search
- DELETE /bulk
- POST /
- GET /
- GET /:id
- PUT /:id
- DELETE /:id
- PATCH /:id/status

Typical query params on GET /:

- page, limit
- search
- status
- sortBy, sortOrder

### Payment routes (/api/payments) [Protected]

- GET /stats
- GET /overdue
- DELETE /bulk
- GET /project/:projectId
- POST /:id/add-payment
- POST /
- GET /
- GET /:id
- PUT /:id
- DELETE /:id

Typical query params on GET /:

- page, limit
- status
- projectId, clientId
- minAmount, maxAmount
- fromDate, toDate
- search
- sortBy, sortOrder

## Frontend Routes

### Auth routes

- /auth/login
- /auth/signup

### App routes (authenticated)

- /dashboard
- /clients, /clients/new
- /projects, /projects/new, /projects/:id
- /payments, /payments/new
- /tasks, /tasks/new
- /settings
- /account
- /notifications
- /reports

## Data Models (High Level)

- User: identity, credentials, role, activation state, reset token metadata
- Client: customer profile tied to authenticated user
- Payment: project-linked billing with auto-calculated due amount/status
- Project and Task models exist in codebase for future/full mounting

## Security Notes

- Passwords are hashed with bcryptjs before persistence.
- JWT is required for protected routes.
- Cookies are httpOnly and set with secure + sameSite policy based on NODE_ENV.
- CORS allows configured frontend origin(s) and credentials.

## Testing

Current automated tests are minimal and run through Node test runner:

```bash
cd server
pnpm test
```

Existing tests include regex escaping utility validation.

## Known Gaps / Current Status

- Project/task backend routes are present but not mounted in app.js yet.
- Email sending service file exists but is currently empty.
- Some utility placeholders exist (for example sendMessage.js).

These are good next areas to complete for production readiness.

## Troubleshooting

### "MONGODB_URI is not defined"

- Ensure server/.env exists and includes MONGODB_URI.

### CORS errors in browser

- Ensure CLIENT_URL or CLIENT_URLS includes your frontend origin exactly.
- Verify frontend and backend ports match your env setup.

### 401 Unauthorized on protected routes

- Re-login to refresh token cookie.
- Check JWT_SECRET is set and consistent for running server process.
- Confirm requests are sent with credentials from frontend.

### Payments cannot be created for new projects

- Payment creation validates project ownership.
- If project routes are not mounted, create project records directly in DB or mount project routes first.

## Production Hardening Checklist

- Implement email service for password reset and notifications
- Mount and validate project/task route modules
- Add request validation middleware (schema-level, centralized)
- Add API integration tests for auth, clients, and payments
- Add rate limiting + helmet + logging strategy
- Configure secure cookie/domain settings for your deployment topology
- Add CI pipeline (lint, test, build)

## License

No license file is currently defined in this repository. Add one before distribution.
