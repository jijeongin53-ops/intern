"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CompanyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (companyName: string) => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.success) {
        // 기업명으로 필터링 (간단한 예시)
        const myApplicants = data.applications.filter((app: any) => app.companyName === companyName);
        setApplicants(myApplicants);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if(parsedUser.role !== 'company') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    fetchData(parsedUser.name);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${newStatus} 처리 완료`);
        fetchData(user.name);
      } else {
        alert('처리 실패: ' + data.message);
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  const newCount = applicants.filter(a => a.status === '지원완료').length;
  const interviewCount = applicants.filter(a => a.status === '면접요청').length;
  const reviewCount = applicants.filter(a => a.status === '서류통과').length;
  const finalCount = applicants.filter(a => a.status === '최종합격').length;

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>기업(Company) 대시보드 - {user?.name}</h2>
        <button className="btn btn-glass" onClick={handleLogout}>로그아웃</button>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>자사 지원 현황</h3>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>신규 지원자</h4>
            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>{newCount}</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>면접 요청</h4>
            <p style={{ fontSize: '2rem', color: 'var(--accent-color)', margin: 0, fontWeight: 'bold' }}>{interviewCount}</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>서류 통과</h4>
            <p style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>{reviewCount}</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>최종 합격</h4>
            <p style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>{finalCount}</p>
          </div>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h3>지원자 목록</h3>
        <p>지원자 이력서를 열람하고 합격 여부를 처리할 수 있습니다.</p>
        
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          {applicants.length === 0 ? (
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              아직 지원자가 없습니다.
            </div>
          ) : (
            applicants.map((applicant) => (
              <div key={applicant.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', margin: 0, marginBottom: '0.5rem' }}>{applicant.internName}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>지원일: {applicant.date} | 상태: <span style={{ color: applicant.status === '서류통과' || applicant.status === '최종합격' ? 'var(--success-color)' : 'var(--text-secondary)' }}>{applicant.status}</span></p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-glass">이력서 열람</button>
                  {applicant.status === '지원완료' && (
                    <>
                      <button className="btn btn-glass" onClick={() => handleStatusUpdate(applicant.id, '면접요청')} style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>면접 희망</button>
                      <button className="btn btn-primary" onClick={() => handleStatusUpdate(applicant.id, '서류통과')}>서류 합격</button>
                      <button className="btn btn-glass" onClick={() => handleStatusUpdate(applicant.id, '불합격')} style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>불합격</button>
                    </>
                  )}
                  {(applicant.status === '서류통과' || applicant.status === '면접요청') && (
                    <>
                      <button className="btn btn-primary" onClick={() => handleStatusUpdate(applicant.id, '최종합격')}>최종 합격</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
