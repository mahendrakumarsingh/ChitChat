# Server (API)

This folder contains a minimal Node.js + Express + Mongoose API used by the chat app.

Endpoints
- POST `/api/auth/register` — register a new user
- POST `/api/auth/login` — login, returns JWT
- GET `/api/messages` — list messages (optional `?room=`)
- POST `/api/messages` — create message (requires `Authorization: Bearer <token>`)

Setup
1. cd server
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`
3. npm install
4. npm run dev

Security
- Do not commit `.env` or secrets. Keep the MongoDB URI password-protected and URL-encoded if it contains special characters.
- Use HTTPS in production and rotate `JWT_SECRET` regularly.
