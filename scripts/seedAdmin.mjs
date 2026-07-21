import * as dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

async function seedAdmin() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !spreadsheetId) {
    console.error('Missing required environment variables in .env.local');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Append Admin user (ID, Email/ID, Password, Role, Name)
  const id = Date.now().toString();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Master_Users!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[id, 'thehuelab', '102412', 'admin', '휴랩 관리자']],
    },
  });

  console.log('✅ Admin user thehuelab successfully seeded!');
}

seedAdmin().catch(console.error);
