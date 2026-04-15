import { useRouter } from 'next/router';
import { AVALIADORES } from '../lib/data';

export default function AvaliadorList() {
  const router = useRouter();

  return (
    <div className="card">
      <h1 className="card-title">Selecione o avaliador</h1>
      <p className="card-sub">Clique no seu nome para iniciar</p>

      <div className="list-grid">
        {AVALIADORES.map((nome) => (
          <button
            key={nome}
            className="btn-primary"
            onClick={() => router.push('/grupos?avaliador=' + encodeURIComponent(nome))}
          >
            {nome}
          </button>
        ))}
      </div>

      <div className="export-bar">
        <a href="/api/exportar" className="btn-dark">Exportar Excel</a>
      </div>
    </div>
  );
}
