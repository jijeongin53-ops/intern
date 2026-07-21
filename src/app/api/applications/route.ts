import { NextResponse, NextRequest } from 'next/server';
import { getSheetData, appendSheetData, updateSheetData } from '@/lib/googleSheets';
import nodemailer from 'nodemailer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const internId = searchParams.get('internId');
    const companyId = searchParams.get('companyId');

    const docData = await getSheetData('Documents_Log!A:F');
    const resumeMap: Record<string, string> = {};
    docData.slice(1).forEach(row => {
      const isNewFormat = row.length >= 6;
      const id = row[1];
      const link = isNewFormat ? row[4] : row[3];
      if (link) resumeMap[id] = link;
    });

    const data = await getSheetData('Project_Status!A:G');
    const applications = data.slice(1).map((row) => ({
      id: row[0],
      internId: row[1],
      internName: row[2],
      companyId: row[3],
      companyName: row[4],
      status: row[5],
      date: row[6],
      resumeLink: resumeMap[row[1]] || null
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { internId, internName, companyId, companyName, companyEmail } = body;

    if (!internId || !companyId) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    // 1. 이력서 링크 조회
    let resumeLink = '이력서 미첨부';
    const docData = await getSheetData('Documents_Log!A:F');
    const userDocs = docData.slice(1).filter(row => row[1] === internId);
    if (userDocs.length > 0) {
      const row = userDocs[userDocs.length - 1];
      const isNewFormat = row.length >= 6;
      resumeLink = isNewFormat ? row[4] : row[3];
    }

    const appId = Date.now().toString();
    const date = new Date().toISOString().split('T')[0];
    
    // 2. 구글 시트 데이터 추가
    await appendSheetData('Project_Status!A:G', [
      [appId, internId, internName, companyId, companyName, '지원완료', date]
    ]);

    // 3. 기업 담당자에게 이메일 발송
    if (companyEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"인턴십 매칭 플랫폼" <${process.env.EMAIL_USER}>`,
        to: companyEmail,
        subject: `[새로운 인턴 지원] ${internName}님이 ${companyName}에 지원했습니다.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>새로운 인턴 지원자가 있습니다!</h2>
            <p><strong>지원자 이름:</strong> ${internName}</p>
            <p><strong>지원일:</strong> ${date}</p>
            <br/>
            <p><strong>이력서 열람하기:</strong></p>
            <a href="${resumeLink}" target="_blank" style="display:inline-block; padding:10px 20px; background-color:#3b82f6; color:white; text-decoration:none; border-radius:5px;">
              이력서 보기
            </a>
            <br/><br/>
            <p>자세한 사항은 기업 대시보드에서 확인하시고 합격 여부를 처리해 주세요.</p>
          </div>
        `,
      };
      
      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ success: true, appId });
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
