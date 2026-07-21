"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InternDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 가상의 기업 목록 (실제로는 기업 유저 목록 API를 통해 가져와야 함)
  const [companies, setCompanies] = useState([
    { id: 'c1', name: 'A 기업', industry: 'IT' },
    { id: 'c2', name: 'B 기업', industry: '마케팅' },
    { id: 'c3', name: 'C 기업', industry: '디자인' },
  ]);

  const fetchData = async (internId: string) => {
    try {
      const res = await fetch(`/api/applications?internId=${internId}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
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
    if(parsedUser.role !== 'intern') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    fetchData(parsedUser.id);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleApply = async (companyId: string, companyName: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internId: user.id,
          internName: user.name,
          companyId,
          companyName
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('지원 완료되었습니다!');
        fetchData(user.id); // 새로고침
      } else {
        alert(data.message || '지원 실패');
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  const appliedCount = applications.length;
  const passedCount = applications.filter(a => a.status === '서류통과').length;
  const finalCount = applications.filter(a => a.status === '최종합격').length;

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>청년(Intern) 대시보드 - {user?.name}님 환영합니다</h2>
        <button className="btn btn-glass" onClick={handleLogout}>로그아웃</button>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>내 지원 현황</h3>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>지원 완료</h4>
            <p style={{ fontSize: '2rem', color: 'var(--accent-color)', margin: 0, fontWeight: 'bold' }}>{appliedCount}</p>
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
        <h3>인턴십 참여 기업 목록</h3>
        <p>희망하는 기업에 무제한으로 지원할 수 있습니다.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {companies.map((company) => {
            const hasApplied = applications.some(a => a.companyId === company.id);
            const status = hasApplied ? '지원완료' : '지원가능';

            return (
              <div key={company.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.25rem', margin: 0 }}>{company.name}</h4>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem',
                    backgroundColor: hasApplied ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)'
                  }}>
                    {status}
                  </span>
                </div>
                <p style={{ margin: 0, marginBottom: '1.5rem', fontSize: '0.9rem' }}>분야: {company.industry}</p>
                <button 
                  onClick={() => handleApply(company.id, company.name)}
                  className={`btn ${!hasApplied ? 'btn-primary' : 'btn-glass'}`} 
                  style={{ width: '100%' }}
                  disabled={hasApplied}
                >
                  {hasApplied ? '지원완료' : '지원하기'}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
