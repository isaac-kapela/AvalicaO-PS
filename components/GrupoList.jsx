import { useRouter } from 'next/router';
import { GRUPOS } from '../lib/data';

export default function GrupoList({ avaliador }) {
  const router = useRouter();

  return (
    <div className="card">
      <button className="btn-back" onClick={() => router.push('/')}>← Voltar</button>
      <h1 className="card-title">Escolha o Grupo</h1>
      <p className="card-sub">Avaliador: <strong>{avaliador}</strong></p>

      {Object.entries(GRUPOS).map(([num, membros]) => (
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
      ))}
    </div>
  );
}
