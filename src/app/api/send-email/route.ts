import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, text } = await req.json();

    if (!to || to.length === 0) {
      return NextResponse.json({ success: false, message: '수신자가 없습니다.' }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      // 이메일 설정이 안 되어있을 경우 성공인 척 하지만 실제 발송은 안 함 (UI 테스트용)
      console.warn('EMAIL_USER or EMAIL_PASS not set in environment variables.');
      return NextResponse.json({ 
        success: true, 
        message: '이메일 설정이 없어 가상으로 발송 성공 처리했습니다. (환경변수를 확인하세요)' 
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to.join(', '), // 다중 수신자 콤마로 연결
      subject: subject || '운영 사무국 안내 메일',
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
