import { NextRequest, NextResponse } from 'next/server';
import { getSheetData } from '@/lib/googleSheets';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const internId = searchParams.get('internId');
    
    if (!internId) {
      return NextResponse.json({ success: false, message: 'internId required' }, { status: 400 });
    }

    const data = await getSheetData('Documents_Log!A:F');
    // Headers: ['Log ID', 'User ID', 'User Name', 'Document Name', 'File Link', 'Upload Date']
    const documents = data.slice(1).map(row => {
      const isNewFormat = row.length >= 6;
      return {
        id: row[0],
        internId: row[1],
        internName: isNewFormat ? row[2] : '이름 없음',
        name: isNewFormat ? row[3] : row[2],
        link: isNewFormat ? row[4] : row[3],
        date: isNewFormat ? row[5] : row[4]
      };
    }).filter(doc => doc.internId === internId);

    // Get the most recent document
    const latestDoc = documents.length > 0 ? documents[documents.length - 1] : null;

    return NextResponse.json({ success: true, document: latestDoc });
  } catch (error: any) {
    console.error('Documents API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
