import { NextResponse } from 'next/server';
import { getSheetData, appendSheetData } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, role, name } = body;

    const data = await getSheetData('Master_Users!A:E');
    const users = data.slice(1); // skip header

    if (action === 'login') {
      const user = users.find((row) => row[1] === email && row[2] === password && row[3] === role);
      if (user) {
        return NextResponse.json({ success: true, user: { id: user[0], email: user[1], role: user[3], name: user[4] } });
      }
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } 
    
    if (action === 'signup') {
      const existingUser = users.find((row) => row[1] === email);
      if (existingUser) {
        return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 400 });
      }

      const id = Date.now().toString();
      await appendSheetData('Master_Users!A:E', [[id, email, password, role, name]]);
      
      return NextResponse.json({ success: true, user: { id, email, role, name } });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
