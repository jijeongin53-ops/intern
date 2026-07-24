import { NextRequest, NextResponse } from 'next/server';
import { getSheetData } from '@/lib/googleSheets';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const internId = searchParams.get('internId');

    const data = await getSheetData('Documents_Log!A:F');
    // Headers: ['Log ID', 'User ID', 'User Name', 'Document Name', 'File Link', 'Upload Date']
    let documents = data.slice(1).map(row => {
      const isNewFormat = row.length >= 6;
      return {
        id: row[0],
        internId: row[1],
        internName: isNewFormat ? row[2] : '이름 없음',
        name: isNewFormat ? row[3] : row[2],
        link: isNewFormat ? row[4] : row[3],
        date: isNewFormat ? row[5] : row[4]
      };
    });

    if (internId) {
      documents = documents.filter(doc => doc.internId === internId);
      // Get the most recent document for the intern
      const latestDoc = documents.length > 0 ? documents[documents.length - 1] : null;
      return NextResponse.json({ success: true, document: latestDoc });
    }

    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    console.error('Documents API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
