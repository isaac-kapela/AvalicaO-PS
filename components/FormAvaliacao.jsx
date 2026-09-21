import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CRITERIOS } from '../lib/data';

const NOTAS = [0, 1, 2, 3, 4];
const NOTA_LABELS = {
  0: '0 - Insuficiente',
  1: '1 - Abaixo',
  2: '2 - Regular',
  3: '3 - Bom',
  4: '4 - Excelente'
};

function initNotas(membros) {
  const obj = {};
  membros.forEach((nome) => {
    const campos = {};
    CRITERIOS.forEach(({ id }) => { campos[id] = ''; });
    obj[nome] = campos;
  });
  return obj;
}

function initObservacoes(membros) {
  const obj = {};
  membros.forEach((nome) => { obj[nome] = ''; });
  return obj;
}

function storageKey(avaliador, grupo) {
  return `rascunho_${avaliador}_grupo${grupo}`;
}

export default function FormAvaliacao({ avaliador, grupo, membros }) {
  const router = useRouter();
  const key = storageKey(avaliador, grupo);

  const [notas, setNotas] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.notas) return parsed.notas;
        }
      } catch {}
    }
    return initNotas(membros);
  });

  const [observacoes, setObservacoes] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.observacoes) return parsed.observacoes;
        }
      } catch {}
    }
    return initObservacoes(membros);
  });

  const [obsGeral, setObsGeral] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.obsGeral) return parsed.obsGeral;
        }
      } catch {}
    }
    return '';
  });

  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [erros, setErros] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify({ notas, observacoes, obsGeral }));
    } catch {}
  }, [notas, observacoes, obsGeral, key]);

  function setNota(nome, campo, valor) {
    setNotas((prev) => ({
      ...prev,
      [nome]: { ...prev[nome], [campo]: valor },
    }));
    // Remove erro ao preencher
    if (erros[nome + '-' + campo]) {
      setErros((prev) => {
        const updated = { ...prev };
        delete updated[nome + '-' + campo];
        return updated;
      });
    }
  }

  function setObs(nome, valor) {
    setObservacoes((prev) => ({ ...prev, [nome]: valor }));
  }

  function validar() {
    const e = {};
    membros.forEach((nome) => {
      CRITERIOS.forEach(({ id, label }) => {
        if (notas[nome]?.[id] === '' || notas[nome]?.[id] === undefined) {
          e[nome + '-' + id] = 'Selecione ' + label;
        }
      });
    });
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errosVal = validar();
    if (Object.keys(errosVal).length > 0) {
      setErros(errosVal);
      // Rola até o primeiro erro
      const firstKey = Object.keys(errosVal)[0];
      const el = document.getElementById(firstKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErros({});
    setEnviando(true);
    setMensagem(null);

    const avaliacoes = membros.map((nome) => {
      const entry = { nome };
      CRITERIOS.forEach(({ id }) => { entry[id] = Number(notas[nome][id]); });
      entry.observacao = observacoes[nome] || '';
      return entry;
    });

    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avaliador, grupo: Number(grupo), avaliacoes, observacao: obsGeral }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem({ tipo: 'sucesso', texto: '✅ Avaliação enviada com sucesso ao banco!' });
        setNotas(initNotas(membros));
        setObservacoes(initObservacoes(membros));
        setObsGeral('');
        try { localStorage.removeItem(key); } catch {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMensagem({ tipo: 'erro', texto: '❌ ' + (data.error || 'Erro ao enviar avaliação.') });
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: '❌ Erro de conexão com o servidor.' });
    } finally {
      setEnviando(false);
    }
  }

  // Progresso total preenchido
  const totalCampos = membros.length * CRITERIOS.length;
  let camposPreenchidos = 0;
  membros.forEach((nome) => {
    CRITERIOS.forEach(({ id }) => {
      if (notas[nome]?.[id] !== '' && notas[nome]?.[id] !== undefined) camposPreenchidos++;
    });
  });
  const percentual = totalCampos > 0 ? Math.round((camposPreenchidos / totalCampos) * 100) : 0;

  return (
    <div className="card">
      <button
        className="btn-back"
        onClick={() => router.push('/grupos?avaliador=' + encodeURIComponent(avaliador))}
      >
        ← Voltar aos grupos
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 className="card-title">Avaliação · Grupo {grupo}</h1>
          <p className="card-sub" style={{ marginBottom: 0 }}>
            Avaliador: <strong>{avaliador}</strong>
          </p>
        </div>

        {/* Barra de Progresso Compacta */}
        {membros.length > 0 && (
          <div style={{
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: 160
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
              <span>PROGRESSO</span>
              <span>{percentual}%</span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percentual}%`,
                  background: 'var(--primary-gradient)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {membros.length === 0 && (
        <div className="alert alert-err">Nenhum membro encontrado para este grupo.</div>
      )}

      {mensagem && (
        <div className={'alert ' + (mensagem.tipo === 'sucesso' ? 'alert-ok' : 'alert-err')}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {membros.map((nome, idx) => (
          <div key={nome} className="pessoa-card">
            <div className="pessoa-nome">
              <div className="pessoa-badge-wrap">
                <span className="pessoa-index">{idx + 1}</span>
                <span>{nome}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Candidato #{idx + 1}
              </span>
            </div>

            <div className="criterios-grid">
              {CRITERIOS.map(({ id, label }) => {
                const errKey = nome + '-' + id;
                const valorAtual = notas[nome]?.[id];

                return (
                  <div key={id} id={errKey} className="criterio-item">
                    <div className="criterio-label">
                      <span>{label}</span>
                      {valorAtual !== '' && valorAtual !== undefined && (
                        <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                          Nota: {valorAtual}
                        </span>
                      )}
                    </div>

                    <div className={`score-picker ${erros[errKey] ? 'has-error' : ''}`}>
                      {NOTAS.map((n) => {
                        const selecionado = valorAtual === n || valorAtual === String(n);
                        return (
                          <button
                            key={n}
                            type="button"
                            title={NOTA_LABELS[n]}
                            className={`score-btn ${selecionado ? `active-${n}` : ''}`}
                            onClick={() => setNota(nome, id, n)}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>

                    {erros[errKey] && (
                      <span className="err-msg">{erros[errKey]}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <label>Observações individuais sobre {nome.split(' ')[0]}</label>
              <textarea
                value={observacoes[nome] || ''}
                onChange={(e) => setObs(nome, e.target.value)}
                placeholder={`Comentários, pontos fortes ou de atenção sobre ${nome.split(' ')[0]}...`}
                rows={2}
              />
            </div>
          </div>
        ))}

        {membros.length > 0 && (
          <>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Observação Geral da Dinâmica / Grupo</label>
              <textarea
                value={obsGeral}
                onChange={(e) => setObsGeral(e.target.value)}
                placeholder="Observações complementares sobre a dinâmica, sinergia ou comportamento geral do grupo..."
              />
            </div>

            <button type="submit" className="btn-submit" disabled={enviando}>
              {enviando ? 'Enviando avaliação...' : 'Salvar Avaliação do Grupo'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
