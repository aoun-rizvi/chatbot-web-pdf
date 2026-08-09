const COOKIE_NAME = "medi_milo_auth";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const TOKEN_VERSION = "v1";

export { COOKIE_NAME, SESSION_DURATION_SECONDS };

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not configured.");
  }

  if (secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters long.");
  }

  return secret;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;

  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return difference === 0;
}

async function hmac(message: string): Promise<string> {
  const secret = getAuthSecret();

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return bytesToHex(new Uint8Array(signature));
}

/**
 * Creates a signed authentication token.
 *
 * Format:
 *   v1.<expiry unix timestamp>.<HMAC signature>
 */
export async function createAuthToken(): Promise<string> {
  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;

  const payload = `${TOKEN_VERSION}.${expiresAt}`;
  const signature = await hmac(payload);

  return `${payload}.${signature}`;
}

/**
 * Verifies:
 * - token structure
 * - version
 * - expiration
 * - HMAC signature
 */
export async function verifyAuthToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [version, expiresAtRaw, suppliedSignature] = parts;

  if (version !== TOKEN_VERSION) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);

  if (!Number.isSafeInteger(expiresAt)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  if (expiresAt <= now) {
    return false;
  }

  // Do not allow a forged token claiming an unreasonable lifetime.
  const maximumAllowedExpiry =
    now + SESSION_DURATION_SECONDS + 60;

  if (expiresAt > maximumAllowedExpiry) {
    return false;
  }

  const payload = `${version}.${expiresAt}`;
  const expectedSignature = await hmac(payload);

  return constantTimeEqual(
    suppliedSignature,
    expectedSignature
  );
}

/**
 * Constant-time-ish password comparison.
 *
 * Both strings are first SHA-256 hashed so differing password lengths
 * aren't directly compared.
 */
export async function verifyPassword(
  suppliedPassword: string
): Promise<boolean> {
  const expectedPassword = process.env.APP_PASSWORD;

  if (!expectedPassword) {
    throw new Error(
      "APP_PASSWORD environment variable is not configured."
    );
  }

  if (
    typeof suppliedPassword !== "string" ||
    suppliedPassword.length === 0 ||
    suppliedPassword.length > 512
  ) {
    return false;
  }

  const encoder = new TextEncoder();

  const [suppliedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest(
      "SHA-256",
      encoder.encode(suppliedPassword)
    ),
    crypto.subtle.digest(
      "SHA-256",
      encoder.encode(expectedPassword)
    ),
  ]);

  return constantTimeEqual(
    bytesToHex(new Uint8Array(suppliedHash)),
    bytesToHex(new Uint8Array(expectedHash))
  );
}