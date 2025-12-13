# OTP Microservice (Node.js + Express)

A secure, minimal OTP-generation and verification microservice for the Blood Bank system.

## Features
- `POST /request-otp` and `POST /verify-otp` with Bearer API key auth.
- Rate limiting (IP + per-identifier cooldown).
- Argon2 hashing, 5-minute TTL, max attempts (configurable).
- Optional SMTP or Twilio delivery; dev fallback returns OTP only in non-prod.
- Helmet + CORS (restricted origin).
- In-memory store for demo; swap with Redis for production/high availability.

## Setup
1) Install dependencies
```bash
cd otp-service
npm install
```
2) Configure env
- Copy `env.example` to `.env` and fill values. **Do not commit `.env`.**
- Set `SYSTEM_API_KEY` (use the provided key or rotate).
- Set `CORS_ORIGIN` to your frontend origin.
- Optionally set SMTP or Twilio vars for delivery.

3) Run
```bash
npm run dev   # or npm start
```

## Endpoints
All requests require header: `Authorization: Bearer <SYSTEM_API_KEY>`

### POST /request-otp
Body:
```json
{ "identifier": "user@example.com" }
```
Behavior: rate-limit per IP + identifier cooldown, generate OTP, hash+store with TTL, send via SMTP/Twilio if configured; otherwise returns OTP only when `NODE_ENV` is not `production`.
Response:
```json
{ "status": "ok", "message": "OTP sent" }
```

### POST /verify-otp
Body:
```json
{ "identifier": "user@example.com", "otp": "123456" }
```
Behavior: verify hash, TTL, attempt count; invalidate on success.
Response:
```json
{ "status": "ok", "token": "mock-jwt-..." }
```

## Sample curl
Replace `API_KEY` with your `SYSTEM_API_KEY`.
```bash
# Request OTP
curl -X POST http://localhost:4000/request-otp \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@example.com"}'

# Verify OTP
curl -X POST http://localhost:4000/verify-otp \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@example.com","otp":"123456"}'
```

## Security notes
- Rotate `SYSTEM_API_KEY` regularly; store secrets only in env vars or a secrets manager.
- In production, configure SMTP/Twilio; never rely on dev OTP responses.
- Replace the in-memory Map with Redis for multi-instance deployments. Store: key = identifier, value = {hash, expiresAt, attempts, lastRequested}.
- Keep CORS locked to trusted origins.

