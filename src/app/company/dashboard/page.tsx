export default function CompanyDashboard() {
  const applicants = [
    { id: 1, name: '김청년', status: '서류접수', date: '2026-07-20' },
    { id: 2, name: '이청년', status: '서류통과', date: '2026-07-19' },
  ];

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>기업(Company) 대시보드</h2>
        <button className="btn btn-glass">로그아웃</button>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>자사 지원 현황</h3>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>신규 지원자</h4>
            <p style={{ fontSize: '2rem', color: 'var(--accent-color)', margin: 0, fontWeight: 'bold' }}>1</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>서류 심사중</h4>
            <p style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>1</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>최종 합격</h4>
            <p style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>0</p>
          </div>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h3>지원자 목록</h3>
        <p>지원자 이력서를 열람하고 합격 여부를 처리할 수 있습니다.</p>
        
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          {applicants.map((applicant) => (
            <div key={applicant.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.25rem', margin: 0, marginBottom: '0.5rem' }}>{applicant.name}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>지원일: {applicant.date} | 상태: <span style={{ color: applicant.status === '서류통과' ? 'var(--success-color)' : 'var(--text-secondary)' }}>{applicant.status}</span></p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-glass">이력서 열람</button>
                {applicant.status === '서류접수' && (
                  <>
                    <button className="btn btn-primary">서류 합격</button>
                    <button className="btn btn-glass" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>불합격</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
