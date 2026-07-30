"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showInternPopup, setShowInternPopup] = useState(false);
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [showDocumentPopup, setShowDocumentPopup] = useState(false);
  const [stats, setStats] = useState({ internCount: 0, companyCount: 0, documentCount: 0 });
  const [loading, setLoading] = useState(true);

  // Email States
  const [emailMode, setEmailMode] = useState(false);
  const [emailTargetType, setEmailTargetType] = useState<'individual' | 'all'>('all');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [emailText, setEmailText] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const resetEmailState = () => {
    setEmailMode(false);
    setEmailTargetType('all');
    setSelectedEmails(new Set());
    setEmailText('');
  };

  const closeInternPopup = () => {
    setShowInternPopup(false);
    resetEmailState();
  };

  const closeCompanyPopup = () => {
    setShowCompanyPopup(false);
    resetEmailState();
  };

  const handleEmailSend = async (targetList: any[]) => {
    const to = emailTargetType === 'all' ? targetList.map(t => t.email) : Array.from(selectedEmails);
    if (to.length === 0) {
      alert('발송 대상을 선택해주세요.');
      return;
    }
    if (emailText.trim().length === 0) {
      alert('메일 내용을 입력해주세요.');
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject: '운영 사무국 안내 메일', text: emailText })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || '메일 발송에 성공했습니다.');
        resetEmailState();
      } else {
        alert('발송 실패: ' + data.message);
      }
    } catch(err) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const toggleEmailSelection = (email: string) => {
    const newSet = new Set(selectedEmails);
    if (newSet.has(email)) newSet.delete(email);
    else newSet.add(email);
    setSelectedEmails(newSet);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appRes, userRes, docRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/users'),
        fetch('/api/documents')
      ]);
      
      const appData = await appRes.json();
      const userData = await userRes.json();
      const docData = await docRes.json();

      if (appData.success) {
        setApplications(appData.applications || []);
      }
      if (userData.success) {
        setInterns(userData.users?.filter((u: any) => u.role === 'intern') || []);
        setCompanies(userData.users?.filter((u: any) => u.role === 'company') || []);
        setStats(prev => ({
          ...prev,
          internCount: userData.internCount || 0,
          companyCount: userData.companyCount || 0
        }));
      }
      if (docData.success) {
        setDocuments(docData.documents || []);
        setStats(prev => ({
          ...prev,
          documentCount: docData.documents?.length || 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(user);
    if(parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const totalCount = applications.length;
  const interviewCount = applications.filter(app => app.status === '면접요청').length;
  const passedCount = applications.filter(app => app.status === '서류통과').length;
  const finalCount = applications.filter(app => app.status === '최종합격').length;

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>관리자(Admin) 대시보드</h2>
        <button className="btn btn-glass" onClick={handleLogout}>로그아웃</button>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>전체 가입자 현황</h3>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => { setShowInternPopup(true); resetEmailState(); }}>
            <h4>가입한 청년</h4>
            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>{stats.internCount} 명</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowDocumentPopup(true)}>
            <h4>이력서 제출 현황</h4>
            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>{stats.documentCount} 건</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => { setShowCompanyPopup(true); resetEmailState(); }}>
            <h4>가입한 기업</h4>
            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>{stats.companyCount} 개</p>
          </div>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>전체 인턴십 지원 종합 현황</h3>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>총 지원 건수</h4>
            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>{totalCount}</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>면접 요청</h4>
            <p style={{ fontSize: '2rem', color: 'var(--accent-color)', margin: 0, fontWeight: 'bold' }}>{interviewCount}</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>서류 통과</h4>
            <p style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>{passedCount}</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>최종 합격</h4>
            <p style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>{finalCount}</p>
          </div>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>전체 지원 내역 (구글 시트 연동)</h3>
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            {loading ? '동기화 중...' : '데이터 동기화'}
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>청년 이름</th>
                <th style={{ padding: '1rem' }}>지원 기업</th>
                <th style={{ padding: '1rem' }}>상태</th>
                <th style={{ padding: '1rem' }}>지원일</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    지원 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{app.id}</td>
                    <td style={{ padding: '1rem' }}>{app.internName}</td>
                    <td style={{ padding: '1rem' }}>{app.companyName}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        backgroundColor: app.status === '서류통과' || app.status === '최종합격' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: app.status === '서류통과' || app.status === '최종합격' ? 'var(--success-color)' : 'inherit'
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{app.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Intern Popup */}
      {showInternPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px' }}>
            <button onClick={closeInternPopup} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>가입 청년 현황</h3>
              {!emailMode ? (
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => setEmailMode(true)}>메일 발송</button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={`btn ${emailTargetType === 'all' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => setEmailTargetType('all')}>전체 발송</button>
                  <button className={`btn ${emailTargetType === 'individual' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => setEmailTargetType('individual')}>개별 발송</button>
                  <button className="btn btn-glass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={resetEmailState}>취소</button>
                </div>
              )}
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {interns.map((intern, i) => (
                <li key={i} style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {emailMode && emailTargetType === 'individual' && (
                    <input type="checkbox" style={{ transform: 'scale(1.5)', cursor: 'pointer' }} checked={selectedEmails.has(intern.email)} onChange={() => toggleEmailSelection(intern.email)} />
                  )}
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{intern.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{intern.email}</div>
                  </div>
                </li>
              ))}
              {interns.length === 0 && <li style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>가입한 청년이 없습니다.</li>}
            </ul>

            {emailMode && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>메일 내용 작성</h4>
                <textarea 
                  style={{ width: '100%', height: '120px', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', resize: 'none', marginBottom: '0.5rem' }} 
                  placeholder="보낼 메일 내용을 500자 이내로 입력하세요." 
                  maxLength={500} 
                  value={emailText}
                  onChange={e => setEmailText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emailText.length} / 500자</span>
                  <button className="btn btn-primary" onClick={() => handleEmailSend(interns)} disabled={isSendingEmail}>
                    {isSendingEmail ? '발송 중...' : '발송하기'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company Popup */}
      {showCompanyPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px' }}>
            <button onClick={closeCompanyPopup} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>가입 기업 현황</h3>
              {!emailMode ? (
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => setEmailMode(true)}>메일 발송</button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={`btn ${emailTargetType === 'all' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => setEmailTargetType('all')}>전체 발송</button>
                  <button className={`btn ${emailTargetType === 'individual' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => setEmailTargetType('individual')}>개별 발송</button>
                  <button className="btn btn-glass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={resetEmailState}>취소</button>
                </div>
              )}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {companies.map((company, i) => (
                <li key={i} style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {emailMode && emailTargetType === 'individual' && (
                    <input type="checkbox" style={{ transform: 'scale(1.5)', cursor: 'pointer' }} checked={selectedEmails.has(company.email)} onChange={() => toggleEmailSelection(company.email)} />
                  )}
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{company.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{company.email}</div>
                  </div>
                </li>
              ))}
              {companies.length === 0 && <li style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>가입한 기업이 없습니다.</li>}
            </ul>

            {emailMode && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>메일 내용 작성</h4>
                <textarea 
                  style={{ width: '100%', height: '120px', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', resize: 'none', marginBottom: '0.5rem' }} 
                  placeholder="보낼 메일 내용을 500자 이내로 입력하세요." 
                  maxLength={500} 
                  value={emailText}
                  onChange={e => setEmailText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emailText.length} / 500자</span>
                  <button className="btn btn-primary" onClick={() => handleEmailSend(companies)} disabled={isSendingEmail}>
                    {isSendingEmail ? '발송 중...' : '발송하기'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Popup */}
      {showDocumentPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px' }}>
            <button onClick={() => setShowDocumentPopup(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>제출 이력서 현황</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {documents.map((doc, i) => (
                <li key={i} style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{doc.internName}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>업로드일: {doc.date}</div>
                  <a href={doc.link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>이력서 보기</a>
                </li>
              ))}
              {documents.length === 0 && <li style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>제출된 이력서가 없습니다.</li>}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
