import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/googleSheets';

export async function GET() {
  try {
    const data = await getSheetData('Master_Users!A:K');
    const users = data.slice(1).map(row => ({
      id: row[0],
      email: row[1],
      role: row[3],
      name: row[4],
      youthLocation: row[5] || '',
      youthSalary: row[6] || '',
      youthTasks: row[7] || '',
      preferredQualifications: row[8] || '',
      managerName: row[9] || '',
      managerContact: row[10] || ''
    }));

    const interns = users.filter(u => u.role === 'intern');
    const companies = users.filter(u => u.role === 'company');

    return NextResponse.json({ 
      success: true, 
      internCount: interns.length,
      companyCount: companies.length,
      users: users // Can be used later if needed
    });
  } catch (error: any) {
    console.error('Users API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
