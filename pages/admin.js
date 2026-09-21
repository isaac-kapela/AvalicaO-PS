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
    <Layout title="Admin" subtitle="Acesso Restrito">
      <div className="card" style={{ maxWidth: 400, margin: '20px auto' }}>
        <div className="card-logo-wrap">
          <div className="card-logo-circle">
            <img src="/logo.png" alt="Logo Microraptor" className="card-logo" />
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 className="card-title">Painel Administrativo</h1>
          <p className="card-sub">Informe o PIN de acesso para gerenciar edições e candidatos</p>
        </div>

        {erro && <div className="alert alert-err">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 18 }}>
            <label>PIN de Administrador</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Digite o PIN..."
              autoFocus
              maxLength={30}
              style={{ textAlign: 'center', fontSize: 18, letterSpacing: 3 }}
            />
          </div>
          <button type="submit" className="btn-submit" disabled={carregando || !pin}>
            {carregando ? 'Validando...' : 'Entrar no Painel →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="btn-back" onClick={() => router.push('/')}>
            ← Voltar ao início
          </button>
        </div>
      </div>
    </Layout>
  );
}
