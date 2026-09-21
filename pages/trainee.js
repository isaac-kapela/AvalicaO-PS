import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

function getInitials(name) {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TraineePage() {
  const router = useRouter();
  const [avaliadores, setAvaliadores] = useState([]);
  const [edicao, setEdicao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/edicao-ativa?tipo=trainee')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setEdicao(json.data);
          setAvaliadores(json.data.avaliadores || []);
        } else {
          setEdicao(null);
          setAvaliadores([]);
        }
      })
      .catch(() => {
        setEdicao(null);
        setAvaliadores([]);
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <Layout title="Processo Trainee" subtitle="Avaliação Individual">
      <div className="card">
        <button className="btn-back" onClick={() => router.push('/')}>
          ← Início
        </button>

        <div style={{ marginBottom: 24 }}>
          <h1 className="card-title">
            Processo Trainee {edicao ? `· ${edicao.codigo}` : ''}
          </h1>
          <p className="card-sub">
            {edicao
              ? 'Selecione seu nome de avaliador para começar a avaliação de desempenho individual'
              : 'Nenhum Processo Trainee ativo no momento'}
          </p>
        </div>

        {carregando ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
            Carregando avaliadores...
          </p>
        ) : !edicao ? (
          <div style={{
            background: 'var(--surface-subtle)',
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '28px 20px',
            textAlign: 'center',
            marginBottom: 20
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
              Processo Trainee Desativado
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto 16px' }}>
              Nenhuma edição de Trainee está ativa no momento. Ative uma edição no Painel Admin para liberar as avaliações.
            </p>
            <Link href="/admin" className="btn-sm" style={{ display: 'inline-flex' }}>
              Painel Admin →
            </Link>
          </div>
        ) : avaliadores.length === 0 ? (
          <div className="alert alert-err" style={{ textAlign: 'center' }}>
            Nenhum avaliador cadastrado na edição Trainee ({edicao.codigo}). Configure no Painel Admin.
          </div>
        ) : (
          <div className="list-grid">
            {avaliadores.map((nome) => (
              <button
                key={nome}
                className="btn-primary"
                onClick={() =>
                  router.push('/candidatos?avaliador=' + encodeURIComponent(nome))
                }
              >
                <div className="avatar-initials" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                  {getInitials(nome)}
                </div>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {nome}
                </span>
                <span style={{ color: 'var(--text-light)', fontSize: 13 }}>→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
