export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface SessionPayload {
  user: SessionUser;
  expiresAt: number; // Unix timestamp in ms
}

const COOKIE_NAME = 'duitku_session';
const SESSION_MAX_AGE_DAYS = 7;
const SECRET_KEY = process.env.SESSION_SECRET || 'duitku-expense-tracker-secret-key-2025';

// Helper to convert string to BufferSource
function stringToBufferSource(str: string): BufferSource {
  return new TextEncoder().encode(str) as unknown as BufferSource;
}

// Get CryptoKey for HMAC
async function getSigningKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    stringToBufferSource(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Sign payload to create session token: base64(payload).signature
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload: SessionPayload = {
    user,
    expiresAt: Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  };

  const json = JSON.stringify(payload);
  const base64Data = btoa(json);

  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToBufferSource(base64Data)
  );

  return `${base64Data}.${bufferToHex(signature)}`;
}

/**
 * Verify session token and return user if valid
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [base64Data, signatureHex] = parts;
    const key = await getSigningKey();

    // Recompute signature
    const expectedSigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      stringToBufferSource(base64Data)
    );
    const expectedSigHex = bufferToHex(expectedSigBuffer);

    if (signatureHex !== expectedSigHex) {
      return null;
    }

    const json = atob(base64Data);
    const payload: SessionPayload = JSON.parse(json);

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload.user;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
};
