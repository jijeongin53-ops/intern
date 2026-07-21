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
      
    </main>
  );
}
