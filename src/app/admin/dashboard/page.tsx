export default function AdminDashboard() {
  const applications = [
    { id: 1, intern: '김청년', company: 'A 기업', status: '서류접수', date: '2026-07-20' },
    { id: 2, intern: '이청년', company: 'B 기업', status: '서류통과', date: '2026-07-19' },
  ];

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>관리자(Admin) 대시보드</h2>
        <button className="btn btn-glass">로그아웃</button>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>전체 인턴십 지원 종합 현황</h3>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>총 지원 건수</h4>
            <p style={{ fontSize: '2rem', color: 'var(--accent-color)', margin: 0, fontWeight: 'bold' }}>2</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>서류 통과</h4>
            <p style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>1</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <h4>최종 합격</h4>
            <p style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>0</p>
          </div>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>전체 지원 내역 (구글 시트 연동)</h3>
          <button className="btn btn-primary">데이터 동기화</button>
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
                <th style={{ padding: '1rem' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{app.id}</td>
                  <td style={{ padding: '1rem' }}>{app.intern}</td>
                  <td style={{ padding: '1rem' }}>{app.company}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      backgroundColor: app.status === '서류통과' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: app.status === '서류통과' ? 'var(--success-color)' : 'inherit'
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{app.date}</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>상세보기</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
