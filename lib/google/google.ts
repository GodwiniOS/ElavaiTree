import { google } from 'googleapis';
import { getSession } from '../auth';

export async function getGoogleAuthClient() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: No active session');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  return oauth2Client;
}

export async function getSheetsClient() {
  const auth = await getGoogleAuthClient();
  return google.sheets({ version: 'v4', auth });
}

export async function getDocsClient() {
  const auth = await getGoogleAuthClient();
  return google.docs({ version: 'v1', auth });
}

export async function getDriveClient() {
  const auth = await getGoogleAuthClient();
  return google.drive({ version: 'v3', auth });
}
