import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function AdminLogin() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem('admin_pin', pin);
        router.push('/admin/painel');
      } else {
        setErro('PIN incorreto. Tente novamente.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Layout title="Admin">
      <div className="card" style={{ maxWidth: 360, margin: '0 auto' }}>
        <div className="card-logo-wrap">
          <img src="/logo.png" alt="Logo" className="card-logo" />
        </div>
        <h1 className="card-title">Painel Admin</h1>
        <p className="card-sub">Digite o PIN para acessar</p>

        {erro && <div className="alert alert-err">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              maxLength={20}
            />
          </div>
          <button type="submit" className="btn-submit" disabled={carregando || !pin}>
            {carregando ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button className="btn-back" onClick={() => router.push('/')}>← Voltar ao início</button>
        </div>
      </div>
    </Layout>
  );
}
