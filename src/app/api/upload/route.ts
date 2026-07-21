import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { appendSheetData } from '@/lib/googleSheets';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const internId = formData.get('internId') as string;
    
    if (!file || !internId) {
      return NextResponse.json({ success: false, message: 'Missing file or internId' }, { status: 400 });
    }

    // Google Auth
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: email, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // File content
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // Upload to Google Drive (User specified folder ID)
    const folderId = '1pkDdUL1bcptPu892OTEFmLrxgfxK3TCQ';
    
    const driveRes = await drive.files.create({
      requestBody: {
        name: `Resume_${internId}_${file.name}`,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    const fileId = driveRes.data.id;
    const webViewLink = driveRes.data.webViewLink;

    if (!fileId || !webViewLink) {
      throw new Error('Failed to get Drive link after upload');
    }

    // Make the file public to anyone with link (so companies can view it)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      }
    });

    // Save to Documents_Log Sheet
    // Headers: ['Log ID', 'User ID', 'Document Name', 'File Link', 'Upload Date']
    const logId = Date.now().toString();
    const uploadDate = new Date().toISOString().split('T')[0];
    
    await appendSheetData('Documents_Log!A:E', [
      [logId, internId, file.name, webViewLink, uploadDate]
    ]);

    return NextResponse.json({ success: true, link: webViewLink });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
