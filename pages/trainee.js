import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function TraineePage() {
  const router = useRouter();
  const [avaliadores, setAvaliadores] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/edicao-ativa?tipo=trainee')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAvaliadores(json.data.avaliadores || []);
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <Layout title="Processo Trainee" subtitle="Avaliação Individual">
      <div className="card">
        <button className="btn-back" onClick={() => router.push('/')}>← Voltar</button>
        <h1 className="card-title">Processo Trainee</h1>
        <p className="card-sub">Clique no seu nome para começar a avaliar</p>

        {carregando ? (
          <p style={{ color: 'var(--gray-3)', textAlign: 'center', padding: '24px 0' }}>Carregando...</p>
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
                {nome}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
