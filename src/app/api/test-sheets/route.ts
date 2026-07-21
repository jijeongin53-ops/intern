import { NextResponse } from 'next/server';
import { getSheetData, appendSheetData } from '@/lib/googleSheets';

export async function GET() {
  try {
    // Try to read from Master_Users sheet (A1:C1) to verify connection
    const data = await getSheetData('Master_Users!A1:C1');
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Sheet API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
