export default function InternDashboard() {
  const companies = [
    { id: 1, name: 'A 기업', industry: 'IT', status: '지원가능' },
    { id: 2, name: 'B 기업', industry: '마케팅', status: '지원가능' },
    { id: 3, name: 'C 기업', industry: '디자인', status: '지원완료' },
  ];

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>청년(Intern) 대시보드</h2>
        <button className="btn btn-glass">로그아웃</button>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>내 지원 현황</h3>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>지원 완료</h4>
            <p style={{ fontSize: '2rem', color: 'var(--accent-color)', margin: 0, fontWeight: 'bold' }}>1</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>서류 통과</h4>
            <p style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>0</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>최종 합격</h4>
            <p style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>0</p>
          </div>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h3>인턴십 참여 기업 목록</h3>
        <p>희망하는 기업에 무제한으로 지원할 수 있습니다.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {companies.map((company) => (
            <div key={company.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.25rem', margin: 0 }}>{company.name}</h4>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem',
                  backgroundColor: company.status === '지원완료' ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)'
                }}>
                  {company.status}
                </span>
              </div>
              <p style={{ margin: 0, marginBottom: '1.5rem', fontSize: '0.9rem' }}>분야: {company.industry}</p>
              <button 
                className={`btn ${company.status === '지원가능' ? 'btn-primary' : 'btn-glass'}`} 
                style={{ width: '100%' }}
                disabled={company.status === '지원완료'}
              >
                {company.status === '지원가능' ? '지원하기' : '지원완료'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
