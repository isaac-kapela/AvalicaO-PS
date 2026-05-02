import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AvaliadorList() {
  const router = useRouter();
  const [avaliadores, setAvaliadores] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/edicao-ativa?tipo=ps')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAvaliadores(json.data.avaliadores || []);
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="card">
      <div className="card-logo-wrap">
        <img src="/logo.png" alt="Logo" className="card-logo" />
      </div>
      <h1 className="card-title">Lista de Avaliadores</h1>
      <p className="card-sub">Clique no seu nome para iniciar</p>

      {carregando ? (
        <p style={{ color: 'var(--gray-3)', textAlign: 'center', padding: '24px 0' }}>Carregando...</p>
      ) : (
        <div className="list-grid">
          {avaliadores.map((nome) => (
            <button
              key={nome}
              className="btn-primary"
              onClick={() => router.push('/grupos?avaliador=' + encodeURIComponent(nome))}
            >
              {nome}
            </button>
          ))}
        </div>
      )}

      <div className="divider" />

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--gray-4)', marginBottom: 12, fontWeight: 600 }}>
          PROCESSO TRAINEE
        </p>
        <a href="/trainee" className="btn-dark" style={{ display: 'inline-block' }}>
          Avaliar Processo Trainee
        </a>
      </div>

      <div className="export-bar">
        <a href="/api/exportar" className="btn-dark">Exportar Excel</a>
        <a href="/dashboard" className="btn-dark">Dashboard PS</a>
        <a href="/dashboard-trainee" className="btn-dark">Dashboard Trainee</a>
        <a href="/admin" className="btn-dark">Admin</a>
      </div>
    </div>
  );
}
