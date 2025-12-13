import users from "../data/users.json";

type OtpEntry = {
  otpHash: string;
  salt: string;
  expiresAt: number;
  tries: number;
  lastRequested: number;
};

type RequestOtpInput = { aadhaar: string; phone: string };
type VerifyOtpInput = { aadhaar: string; phone: string; otp: string };

const otpStore = new Map<string, OtpEntry>();
const OTP_TTL_MS = 5 * 60 * 1000;
const RATE_LIMIT_MS = 30 * 1000;
const MAX_TRIES = 5;

const keyFor = (aadhaar: string, phone: string) => `${aadhaar}-${phone}`;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateSalt = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const hashOtp = async (otp: string, salt: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${otp}:${salt}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const requestOtp = async ({ aadhaar, phone }: RequestOtpInput) => {
  const userExists = (users as { aadhaar: string; phone: string }[]).some(
    (u) => u.aadhaar === aadhaar && u.phone === phone
  );
  if (!userExists) {
    throw new Error("Aadhaar and phone combination not found.");
  }
  const key = keyFor(aadhaar, phone);
  const existing = otpStore.get(key);
  const now = Date.now();
  if (existing && now - existing.lastRequested < RATE_LIMIT_MS) {
    throw new Error("Please wait before requesting another OTP.");
  }
  const otp = generateOtp();
  const salt = generateSalt();
  const otpHash = await hashOtp(otp, salt);
  otpStore.set(key, {
    otpHash,
    salt,
    expiresAt: now + OTP_TTL_MS,
    tries: 0,
    lastRequested: now
  });
  // In real world, send SMS. For now log.
  console.log(`[OTP] Aadhaar ${aadhaar} Phone ${phone} OTP: ${otp}`);
  return otp;
};

export const verifyOtp = async ({ aadhaar, phone, otp }: VerifyOtpInput) => {
  const key = keyFor(aadhaar, phone);
  const entry = otpStore.get(key);
  if (!entry) {
    throw new Error("No OTP request found. Please request a new OTP.");
  }
  const now = Date.now();
  if (now > entry.expiresAt) {
    otpStore.delete(key);
    throw new Error("OTP expired. Please request a new one.");
  }
  if (entry.tries >= MAX_TRIES) {
    otpStore.delete(key);
    throw new Error("Maximum attempts reached. Request a new OTP.");
  }
  const computedHash = await hashOtp(otp, entry.salt);
  const isValid = computedHash === entry.otpHash;
  entry.tries += 1;
  if (!isValid) {
    otpStore.set(key, entry);
    throw new Error("Invalid OTP. Please try again.");
  }
  otpStore.delete(key);
  const token = `mock-jwt-${crypto.randomUUID()}`;
  return token;
};

