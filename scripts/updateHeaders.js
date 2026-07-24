require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function getGoogleSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!email || !privateKey) {
    throw new Error('Google Service Account credentials are not set in environment variables.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  return sheets;
}

async function updateHeaders() {
  try {
    const sheets = await getGoogleSheetsClient();
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

    const values = [[
      '청년 근무 지역', 
      '청년 급여 조건', 
      '청년 담당 업무', 
      '우대 조건', 
      '담당자 이름', 
      '담당자 연락처'
    ]];

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Master_Users!F1:K1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('Headers updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating headers:', error);
  }
}

updateHeaders();
