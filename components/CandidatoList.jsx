import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function getInitials(name) {
  if (!name) return 'T';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function CandidatoList({ avaliador }) {
  const router = useRouter();
  const [candidatos, setCandidatos] = useState([]);
  const [edicao, setEdicao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/edicao-ativa?tipo=trainee')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setEdicao(json.data);
          setCandidatos(json.data.candidatos || []);
        } else {
          setEdicao(null);
          setCandidatos([]);
        }
      })
      .catch(() => {
        setEdicao(null);
        setCandidatos([]);
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="card">
      <button className="btn-back" onClick={() => router.push('/trainee')}>
        ← Voltar
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 className="card-title">Selecione o Trainee</h1>
        <p className="card-sub">
          Avaliador: <strong>{avaliador}</strong> {edicao && `· ${edicao.codigo}`}
        </p>
      </div>

      {carregando ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
          Carregando lista de trainees...
        </p>
      ) : !edicao ? (
        <div className="alert alert-err" style={{ textAlign: 'center' }}>
          O Processo Trainee está desativado.
        </div>
      ) : candidatos.length === 0 ? (
        <div className="alert alert-err" style={{ textAlign: 'center' }}>
          Nenhum trainee cadastrado na edição ativa ({edicao.codigo}).
        </div>
      ) : (
        <div className="list-grid">
          {candidatos.map((nome) => (
            <button
              key={nome}
              className="btn-primary"
              onClick={() =>
                router.push(
                  '/avaliar-trainee?avaliador=' +
                    encodeURIComponent(avaliador) +
                    '&trainee=' +
                    encodeURIComponent(nome)
                )
              }
            >
              <div className="avatar-initials" style={{ background: '#e0e7ff', color: '#4338ca' }}>
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
  );
}
