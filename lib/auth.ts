import { cookies } from 'next/headers';
import { createUser, getUserByEmail, getUserById, User } from './users';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  SessionUser,
  verifySessionToken,
} from './session';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: SessionUser;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Register a new user (SRS-01)
 */
export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const { name, email, password } = formData;

  if (!name || name.trim().length === 0) {
    return { success: false, error: 'Nama wajib diisi' };
  }

  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'Format email tidak valid' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Kata sandi minimal 6 karakter' };
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
  }

  const user = await createUser({
    name,
    email,
    password,
  });

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  // Set session cookie
  const token = await createSessionToken(sessionUser);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  return { success: true, user: sessionUser };
}

/**
 * Login user (SRS-02)
 */
export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const { email, password } = credentials;

  if (!email || !email.trim()) {
    return { success: false, error: 'Email wajib diisi' };
  }

  if (!password) {
    return { success: false, error: 'Kata sandi wajib diisi' };
  }

  const user = await getUserByEmail(email);
  if (!user || user.password !== password) {
    return { success: false, error: 'Email atau kata sandi tidak valid' };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  // Set session cookie (SRS-06)
  const token = await createSessionToken(sessionUser);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  return { success: true, user: sessionUser };
}

/**
 * Logout current user (SRS-06)
 */
export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
}

/**
 * Get currently authenticated session user
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return await verifySessionToken(token);
}
