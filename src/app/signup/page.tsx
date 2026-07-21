"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('intern');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', name, email, password, role }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert('회원가입 성공!');
        router.push('/login');
      } else {
        setError(data.message || '가입에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>회원가입</h2>
        
        {error && <p style={{ color: 'var(--danger-color)', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="name">이름 (기업은 기업명)</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="form-input" placeholder="홍길동" required />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="email">아이디 (이메일)</label>
            <input type="text" id="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="아이디 또는 이메일" required />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="password">비밀번호</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="role">가입 유형</label>
            <select id="role" value={role} onChange={e => setRole(e.target.value)} className="form-input" style={{ WebkitAppearance: 'none', appearance: 'none' }} required>
              <option value="intern">청년 (Intern)</option>
              <option value="company">기업 (Company)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          이미 계정이 있으신가요? <Link href="/login" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>로그인</Link>
        </p>
      </div>
    </main>
  );
}
