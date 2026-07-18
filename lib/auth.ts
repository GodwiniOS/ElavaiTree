import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'elavai_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret_must_be_at_least_32_chars_long';
const key = new TextEncoder().encode(SESSION_SECRET);

export interface UserSession {
  accessToken: string;
  refreshToken?: string;
  expiry: number;
  user: {
    name: string;
    email: string;
    picture: string;
  };
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (e) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionValue) return null;

  const session = await decrypt(sessionValue);
  if (!session) return null;

  // If token is expired or close to expiring (within 5 minutes), try refreshing it
  const now = Date.now();
  if (session.expiry && now >= session.expiry - 300000 && session.refreshToken) {
    try {
      const refreshed = await refreshGoogleToken(session.refreshToken);
      if (refreshed && refreshed.access_token) {
        const updatedSession: UserSession = {
          ...session,
          accessToken: refreshed.access_token,
          expiry: Date.now() + (refreshed.expires_in || 3600) * 1000,
        };
        await saveSession(updatedSession);
        return updatedSession;
      }
    } catch (err) {
      console.error('Failed to refresh google access token', err);
    }
  }

  return session as UserSession;
}

export async function saveSession(sessionData: UserSession) {
  const cookieStore = await cookies();
  const encryptedSession = await encrypt(sessionData);
  
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: encryptedSession,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

async function refreshGoogleToken(refreshToken: string) {
  const url = 'https://oauth2.googleapis.com/token';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  return await response.json();
}
