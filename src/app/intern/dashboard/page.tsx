"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function InternDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [resumeLink, setResumeLink] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async (internId: string) => {
    try {
      const [appRes, userRes, docRes] = await Promise.all([
        fetch(`/api/applications?internId=${internId}`),
        fetch('/api/users'),
        fetch(`/api/documents?internId=${internId}`)
      ]);
      
      const appData = await appRes.json();
      const userData = await userRes.json();
      const docData = await docRes.json();
      
      if (appData.success) {
        setApplications(appData.applications || []);
      }
      
      if (userData.success) {
        const companyUsers = userData.users.filter((u: any) => u.role === 'company');
        setCompanies(companyUsers);
      }

      if (docData.success && docData.document) {
        setResumeLink(docData.document.link);
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

  const handleApply = async (companyId: string, companyName: string, companyEmail: string) => {
    if (!user) return;
    if (!resumeLink) {
      alert('먼저 이력서를 업로드해주세요!');
      return;
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internId: user.id,
          internName: user.name,
          companyId,
          companyName,
          companyEmail
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('지원 완료되었습니다! (기업으로 이력서가 자동 발송되었습니다)');
        fetchData(user.id); // 새로고침
      } else {
        alert(data.message || '지원 실패');
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('internId', user.id);
    formData.append('internName', user.name);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        alert('이력서 업로드가 완료되었습니다!');
        setResumeLink(data.link);
      } else {
        alert('업로드 실패: ' + data.message);
      }
    } catch (err) {
      alert('업로드 중 서버 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const appliedCount = applications.length;
  const interviewCount = applications.filter(a => a.status === '면접요청').length;
  const passedCount = applications.filter(a => a.status === '서류통과').length;
  const finalCount = applications.filter(a => a.status === '최종합격').length;

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>청년(Intern) 대시보드 - {user?.name}님 환영합니다</h2>
        <button className="btn btn-glass" onClick={handleLogout}>로그아웃</button>
      </header>

      {/* 이력서 관리 섹션 */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: !resumeLink ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)' }}>
        <h3>필수! 이력서 관리</h3>
        <p style={{ color: 'var(--text-secondary)' }}>기업에 지원하기 위해서는 반드시 먼저 이력서를 작성하고 업로드해야 합니다.</p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a 
            href="https://drive.google.com/file/d/1E3PzsovD4jjd_DPcvUihZk4qyHTdDZJS/view?usp=drive_link" 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-glass" 
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            이력서 양식 다운로드
          </a>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.hwp"
          />
          <button 
            className="btn btn-primary" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '업로드 중...' : '내 이력서 업로드'}
          </button>

          {resumeLink && (
            <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>
              ✓ 이력서 등록 완료 (<a href={resumeLink} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>내 이력서 보기</a>)
            </span>
          )}
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>내 지원 현황</h3>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>지원 완료</h4>
            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>{appliedCount}</p>
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
          <div>
            <h3 style={{ margin: 0 }}>인턴십 참여 기업 목록</h3>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>희망하는 기업에 무제한으로 지원할 수 있습니다.</p>
          </div>
          <button className="btn btn-primary" onClick={() => user && fetchData(user.id)}>새로고침</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {companies.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              아직 가입한 기업이 없습니다.
            </div>
          ) : (
            companies.map((company) => {
              const hasApplied = applications.some(a => a.companyId === company.id);
              const status = hasApplied ? '지원완료' : '지원가능';
              const canApply = !!resumeLink; // 이력서가 있어야 지원 가능

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
                  <p style={{ margin: 0, marginBottom: '1.5rem', fontSize: '0.9rem' }}>이메일: {company.email}</p>
                  <button 
                    onClick={() => handleApply(company.id, company.name, company.email)}
                    className={`btn ${!hasApplied && canApply ? 'btn-primary' : 'btn-glass'}`} 
                    style={{ width: '100%', opacity: (!hasApplied && !canApply) ? 0.5 : 1 }}
                    disabled={hasApplied || !canApply}
                    title={!canApply ? '이력서를 먼저 업로드해주세요' : ''}
                  >
                    {hasApplied ? '지원완료' : (!canApply ? '이력서 등록 필요' : '지원하기')}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
