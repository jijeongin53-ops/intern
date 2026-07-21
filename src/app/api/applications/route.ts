import { NextResponse } from 'next/server';
import { getSheetData, appendSheetData, updateSheetData } from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const internId = searchParams.get('internId');
    const companyId = searchParams.get('companyId');

    const data = await getSheetData('Project_Status!A:G');
    const applications = data.slice(1).map((row) => ({
      id: row[0],
      internId: row[1],
      internName: row[2],
      companyId: row[3],
      companyName: row[4],
      status: row[5],
      date: row[6],
    }));

    let filtered = applications;
    if (internId) {
      filtered = filtered.filter(app => app.internId === internId);
    }
    if (companyId) {
      filtered = filtered.filter(app => app.companyId === companyId);
    }

    return NextResponse.json({ success: true, applications: filtered });
  } catch (error: any) {
    console.error('Applications API GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { internId, internName, companyId, companyName } = body;

    const id = Date.now().toString();
    const date = new Date().toISOString().split('T')[0];
    const status = '지원완료';

    await appendSheetData('Project_Status!A:G', [[id, internId, internName, companyId, companyName, status, date]]);

    return NextResponse.json({ success: true, application: { id, internId, internName, companyId, companyName, status, date } });
  } catch (error: any) {
    console.error('Applications API POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, newStatus } = body;

    const data = await getSheetData('Project_Status!A:G');
    const rowIndex = data.findIndex((row) => row[0] === applicationId);

    if (rowIndex === -1) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    }

    // Update just the status column (Column F) for the specific row
    // Sheet rows are 1-indexed, and we have headers on row 1
    const sheetRowNumber = rowIndex + 1;
    await updateSheetData(`Project_Status!F${sheetRowNumber}`, [[newStatus]]);

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error: any) {
    console.error('Applications API PATCH Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
