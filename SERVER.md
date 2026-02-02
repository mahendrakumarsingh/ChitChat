# Server API (added)

A minimal Node/Express + Mongoose API has been added in `server/`. It provides endpoints for authentication and messages:

- POST `/api/auth/register` — register (bcrypt hash)
- POST `/api/auth/login` — login (returns JWT)
- GET `/api/messages` — list messages (optional `?room=`)
- POST `/api/messages` — post message (requires `Authorization: Bearer <token>`)

Setup
1. cd server
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`
3. npm install
4. npm run dev

Security
- Do NOT commit `.env` or secrets to version control. Keep your MongoDB password URL-encoded if it contains special characters.
- Use HTTPS in production and rotate `JWT_SECRET` regularly.
