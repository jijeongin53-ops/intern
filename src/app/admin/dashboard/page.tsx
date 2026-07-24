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
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowInternPopup(true)}>
            <h4>가입한 청년</h4>
            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>{stats.internCount} 명</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowDocumentPopup(true)}>
            <h4>이력서 제출 현황</h4>
            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>{stats.documentCount} 건</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowCompanyPopup(true)}>
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
            <button onClick={() => setShowInternPopup(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>가입 청년 현황</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {interns.map((intern, i) => (
                <li key={i} style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{intern.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{intern.email}</div>
                </li>
              ))}
              {interns.length === 0 && <li style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>가입한 청년이 없습니다.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Company Popup */}
      {showCompanyPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px' }}>
            <button onClick={() => setShowCompanyPopup(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>가입 기업 현황</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {companies.map((company, i) => (
                <li key={i} style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{company.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{company.email}</div>
                </li>
              ))}
              {companies.length === 0 && <li style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>가입한 기업이 없습니다.</li>}
            </ul>
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
