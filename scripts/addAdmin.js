require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function getGoogleSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;
  if (!email || !privateKey) throw new Error('Creds not set');
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth: await auth.getClient() });
}

async function run() {
  try {
    const sheets = await getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Master_Users!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          Date.now().toString(),
          'thehuelab',
          '102412',
          'admin',
          '휴랩 관리자'
        ]]
      }
    });
    console.log('Admin user added successfully.');
  } catch (err) {
    console.error('Failed to add admin user:', err);
  }
}

run();
