import * as dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

async function setupBackoffice() {
  console.log('Starting Google Sheets Backoffice Setup...');
  
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

  // 1. Get existing sheets
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
  
  const requiredSheets = [
    {
      title: 'Master_Users',
      headers: ['ID', 'Email', 'Password', 'Role', 'Name']
    },
    {
      title: 'Project_Status',
      headers: ['Application ID', 'Intern ID', 'Intern Name', 'Company ID', 'Company Name', 'Status', 'Date']
    },
    {
      title: 'Documents_Log',
      headers: ['Log ID', 'User ID', 'Document Name', 'File Link', 'Upload Date']
    },
    {
      title: 'Application_Status',
      headers: ['Approval ID', 'User ID', 'Name', 'Role', 'Approval Status', 'Date']
    }
  ];

  const requests = [];

  // 2. Add missing sheets
  for (const reqSheet of requiredSheets) {
    if (!existingSheets.includes(reqSheet.title)) {
      console.log(`Creating sheet: ${reqSheet.title}`);
      requests.push({
        addSheet: {
          properties: {
            title: reqSheet.title,
            gridProperties: {
              frozenRowCount: 1 // Freeze header row
            }
          }
        }
      });
    }
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    console.log('Created missing sheets successfully.');
  }

  // 3. Set Headers & Formatting
  console.log('Applying headers and formatting...');
  
  // Refetch to get updated sheetIds
  const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  
  for (const reqSheet of requiredSheets) {
    const sheetInfo = updatedSpreadsheet.data.sheets.find(s => s.properties.title === reqSheet.title);
    const sheetId = sheetInfo.properties.sheetId;

    // Set Header Values
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${reqSheet.title}!A1:Z1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [reqSheet.headers]
      }
    });

    // Format Header Row (Bold, Background Color)
    const formatRequest = {
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: reqSheet.headers.length
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 }, // Dark background
            textFormat: { 
              foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, // White text
              bold: true,
              fontSize: 11
            },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    };

    // Auto-resize columns
    const autoResizeRequest = {
      autoResizeDimensions: {
        dimensions: {
          sheetId: sheetId,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: reqSheet.headers.length
        }
      }
    };

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [formatRequest, autoResizeRequest]
      }
    });
  }

  console.log('✅ Google Sheets Backoffice Setup Complete!');
}

setupBackoffice().catch(console.error);
