import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import argon2 from "argon2";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config();

const {
  NODE_ENV = "development",
  PORT = 4000,
  SYSTEM_API_KEY,
  CORS_ORIGIN = "http://localhost:5173",
  OTP_LENGTH = "6",
  OTP_TTL_SEC = "300",
  OTP_REQUEST_COOLDOWN_SEC = "30",
  MAX_OTP_ATTEMPTS = "5",
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = "no-reply@example.com",
  TWILIO_SID,
  TWILIO_TOKEN,
  TWILIO_FROM
} = process.env;

const app = express();

const isProduction = NODE_ENV === "production";
const otpLength = Number(OTP_LENGTH) || 6;
const otpTtlMs = (Number(OTP_TTL_SEC) || 300) * 1000;
const otpCooldownMs = (Number(OTP_REQUEST_COOLDOWN_SEC) || 30) * 1000;
const maxOtpAttempts = Number(MAX_OTP_ATTEMPTS) || 5;

const otpStore = new Map(); // key -> { hash, expiresAt, attempts, lastRequested }

// Middleware
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(helmet());
app.use(express.json());

// Global IP rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Per-route limiters
const requestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many OTP requests. Please slow down." }
});

const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many OTP verifications. Please slow down." }
});

// Helpers
const requireApiKey = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.substring(7) : "";
  if (!SYSTEM_API_KEY || token !== SYSTEM_API_KEY) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  return next();
};

const validateIdentifier = (identifier) => {
  if (typeof identifier !== "string") return false;
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const phoneRegex = /^[0-9]{8,15}$/;
  return emailRegex.test(identifier) || phoneRegex.test(identifier);
};

const generateOtp = (length) => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

const setOtp = async (identifier, otp) => {
  const hash = await argon2.hash(otp);
  const now = Date.now();
  otpStore.set(identifier, {
    hash,
    expiresAt: now + otpTtlMs,
    attempts: 0,
    lastRequested: now
  });
};

const sendOtp = async ({ identifier, otp }) => {
  // SMTP email
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transporter.sendMail({
      from: SMTP_FROM,
      to: identifier,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in ${OTP_TTL_SEC} seconds.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in ${OTP_TTL_SEC} seconds.</p>`
    });
    return "email";
  }

  // Twilio SMS
  if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
    const client = twilio(TWILIO_SID, TWILIO_TOKEN);
    await client.messages.create({
      to: identifier,
      from: TWILIO_FROM,
      body: `Your OTP is ${otp}. It expires in ${OTP_TTL_SEC} seconds.`
    });
    return "sms";
  }

  // Dev fallback
  if (!isProduction) {
    return otp;
  }

  throw new Error("No delivery provider configured");
};

// Routes
app.post("/request-otp", requestLimiter, requireApiKey, async (req, res) => {
  try {
    const { identifier } = req.body || {};
    if (!validateIdentifier(identifier)) {
      return res.status(400).json({ status: "error", message: "Invalid identifier" });
    }

    const existing = otpStore.get(identifier);
    const now = Date.now();
    if (existing && now - existing.lastRequested < otpCooldownMs) {
      return res.status(429).json({ status: "error", message: "Please wait before requesting another OTP." });
    }

    const otp = generateOtp(otpLength);
    await setOtp(identifier, otp);
    const channel = await sendOtp({ identifier, otp });

    // Never return OTP in production
    const devPayload =
      !isProduction && channel === otp
        ? { devOtp: otp, note: "OTP returned only in non-production for testing" }
        : {};

    return res.json({ status: "ok", message: "OTP sent", ...devPayload });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message || "Failed to send OTP" });
  }
});

app.post("/verify-otp", verifyLimiter, requireApiKey, async (req, res) => {
  try {
    const { identifier, otp } = req.body || {};
    if (!validateIdentifier(identifier) || typeof otp !== "string" || otp.length !== otpLength) {
      return res.status(400).json({ status: "error", message: "Invalid payload" });
    }
    const entry = otpStore.get(identifier);
    if (!entry) {
      return res.status(400).json({ status: "error", message: "No OTP found. Request a new one." });
    }
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({ status: "error", message: "OTP expired. Request a new one." });
    }
    if (entry.attempts >= maxOtpAttempts) {
      otpStore.delete(identifier);
      return res.status(429).json({ status: "error", message: "Too many attempts. Request a new OTP." });
    }

    entry.attempts += 1;
    const isValid = await argon2.verify(entry.hash, otp);
    if (!isValid) {
      otpStore.set(identifier, entry);
      return res.status(400).json({ status: "error", message: "Invalid OTP" });
    }

    otpStore.delete(identifier);
    const token = `mock-jwt-${crypto.randomUUID()}`;
    return res.json({ status: "ok", token });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message || "Verification failed" });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`OTP service running on port ${PORT}`);
});

