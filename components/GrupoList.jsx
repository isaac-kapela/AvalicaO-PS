import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GrupoList({ avaliador }) {
  const router = useRouter();
  const [grupos, setGrupos] = useState({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/edicao-ativa?tipo=ps')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setGrupos(json.data.grupos || {});
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="card">
      <button className="btn-back" onClick={() => router.push('/')}>← Voltar</button>
      <h1 className="card-title">Escolha o Grupo</h1>
      <p className="card-sub">Avaliador: <strong>{avaliador}</strong></p>

      {carregando ? (
        <p style={{ color: 'var(--gray-3)', textAlign: 'center', padding: '24px 0' }}>Carregando grupos...</p>
      ) : Object.keys(grupos).length === 0 ? (
        <p style={{ color: 'var(--gray-3)', textAlign: 'center', padding: '24px 0' }}>Nenhum grupo cadastrado.</p>
      ) : (
        Object.entries(grupos)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([num, membros]) => (
            <div key={num} className="group-card">
              <div className="group-header">
                <span className="group-label">
                  <span className="group-number">G{num}</span>
                  Grupo {num}
                </span>
                <button
                  className="btn-sm"
                  onClick={() => router.push('/avaliar?avaliador=' + encodeURIComponent(avaliador) + '&grupo=' + num)}
                >
                  Avaliar
                </button>
              </div>
              <ul className="members-list">
                {membros.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </div>
          ))
      )}
    </div>
  );
}
