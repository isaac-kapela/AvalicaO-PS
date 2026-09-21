import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function GrupoList({ avaliador }) {
  const router = useRouter();
  const [grupos, setGrupos] = useState({});
  const [edicao, setEdicao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/edicao-ativa?tipo=ps')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setEdicao(json.data);
          setGrupos(json.data.grupos || {});
        } else {
          setEdicao(null);
          setGrupos({});
        }
      })
      .catch(() => {
        setEdicao(null);
        setGrupos({});
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="card">
      <button className="btn-back" onClick={() => router.push('/')}>
        ← Voltar
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 className="card-title">Escolha o Grupo</h1>
        <p className="card-sub">
          Avaliador: <strong>{avaliador}</strong> {edicao && `· ${edicao.codigo}`}
        </p>
      </div>

      {carregando ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
          Carregando grupos...
        </p>
      ) : !edicao ? (
        <div className="alert alert-err" style={{ textAlign: 'center' }}>
          O Processo Seletivo foi desativado. Nenhuma edição está ativa no momento.
        </div>
      ) : Object.keys(grupos).length === 0 ? (
        <div className="alert alert-err" style={{ textAlign: 'center' }}>
          Nenhum grupo cadastrado para a edição ativa ({edicao.codigo}).
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(grupos)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([num, membros]) => (
              <div key={num} className="group-card">
                <div className="group-header">
                  <span className="group-label">
                    <span className="group-number">G{num}</span>
                    Grupo {num}
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
                      ({membros.length} {membros.length === 1 ? 'candidato' : 'candidatos'})
                    </span>
                  </span>
                  <button
                    className="btn-sm"
                    onClick={() =>
                      router.push(
                        '/avaliar?avaliador=' +
                          encodeURIComponent(avaliador) +
                          '&grupo=' +
                          num
                      )
                    }
                  >
                    Avaliar Grupo →
                  </button>
                </div>

                <div className="members-chips">
                  {membros.map((m) => (
                    <span key={m} className="member-chip">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
