import { NextRequest, NextResponse } from 'next/server';
import { appendSheetData } from '@/lib/googleSheets';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const internId = formData.get('internId') as string;
    
    if (!file || !internId) {
      return NextResponse.json({ success: false, message: 'Missing file or internId' }, { status: 400 });
    }

    const gasUrl = process.env.GAS_UPLOAD_URL || process.env.NEXT_PUBLIC_GAS_URL;
    if (!gasUrl) {
      return NextResponse.json({ success: false, message: 'Server is missing GAS_UPLOAD_URL' }, { status: 500 });
    }

    // 파일 데이터를 Base64로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');

    // Google Apps Script(Web App)로 POST 요청 전송
    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: `Resume_${internId}_${file.name}`,
        mimeType: file.type,
        base64: base64Data
      })
    });

    const gasData = await gasResponse.json();

    if (!gasData.success) {
      throw new Error(gasData.error || 'Failed to upload via GAS');
    }

    const webViewLink = gasData.url;

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
