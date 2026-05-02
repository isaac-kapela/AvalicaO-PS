import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CandidatoList({ avaliador }) {
  const router = useRouter();
  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/edicao-ativa?tipo=trainee')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCandidatos(json.data.candidatos || []);
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="card">
      <button className="btn-back" onClick={() => router.push('/trainee')}>← Voltar</button>
      <h1 className="card-title">Escolha o Candidato</h1>
      <p className="card-sub">Avaliador: <strong>{avaliador}</strong></p>

      {carregando ? (
        <p style={{ color: 'var(--gray-3)', textAlign: 'center', padding: '24px 0' }}>Carregando...</p>
      ) : candidatos.length === 0 ? (
        <p style={{ color: 'var(--gray-3)', textAlign: 'center', padding: '24px 0' }}>Nenhum candidato cadastrado.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {candidatos.map((nome) => (
            <button
              key={nome}
              className="btn-primary"
              style={{ textAlign: 'left' }}
              onClick={() =>
                router.push(
                  '/avaliar-trainee?avaliador=' +
                    encodeURIComponent(avaliador) +
                    '&trainee=' +
                    encodeURIComponent(nome)
                )
              }
            >
              {nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
