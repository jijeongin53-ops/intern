import Link from 'next/link';

export default function Home() {
  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          인턴십 매칭 솔루션
        </h1>
        <p style={{ fontSize: '1.125rem', marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
          청년과 기업을 연결하는 빠르고 세련된 매칭 플랫폼
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/intern/dashboard" className="btn btn-primary" style={{ minWidth: '160px' }}>
            청년 로그인
          </Link>
          <Link href="/company/dashboard" className="btn btn-glass" style={{ minWidth: '160px' }}>
            기업 로그인
          </Link>
          <Link href="/admin/dashboard" className="btn btn-glass" style={{ minWidth: '160px' }}>
            관리자 로그인
          </Link>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '800px', marginTop: '3rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>무제한 지원</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>희망하는 기업에 제한 없이 자유롭게 지원할 수 있습니다.</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>실시간 연동</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>모든 데이터는 실시간으로 처리되어 결과를 빠르게 확인할 수 있습니다.</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>간편한 관리</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>지원서 열람부터 합격 처리까지 원스톱으로 제공합니다.</p>
        </div>
      </div>
    </main>
  );
}
