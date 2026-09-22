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

function initNotas() {
  const obj = {};
  CRITERIOS.forEach(({ id }) => { obj[id] = ''; });
  return obj;
}

function storageKey(avaliador, trainee) {
  return `trainee_rascunho_${avaliador}_${trainee}`;
}

export default function FormAvaliacaoTrainee({ avaliador, trainee }) {
  const router = useRouter();
  const key = storageKey(avaliador, trainee);

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
    return initNotas();
  });

  const [observacao, setObservacao] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.observacao !== undefined) return parsed.observacao;
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
      localStorage.setItem(key, JSON.stringify({ notas, observacao }));
    } catch {}
  }, [notas, observacao, key]);

  function setNota(campo, valor) {
    setNotas((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) {
      setErros((prev) => {
        const updated = { ...prev };
        delete updated[campo];
        return updated;
      });
    }
  }

  function validar() {
    const e = {};
    CRITERIOS.forEach(({ id, label }) => {
      if (notas[id] === '' || notas[id] === undefined) {
        e[id] = 'Selecione ' + label;
      }
    });
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errosVal = validar();
    if (Object.keys(errosVal).length > 0) {
      setErros(errosVal);
      return;
    }
    setErros({});
    setEnviando(true);
    setMensagem(null);

    const payload = { avaliador, trainee, observacao };
    CRITERIOS.forEach(({ id }) => { payload[id] = Number(notas[id]); });

    try {
      const res = await fetch('/api/avaliacoes-trainee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem({ tipo: 'sucesso', texto: '✅ Avaliação do trainee enviada com sucesso!' });
        setNotas(initNotas());
        setObservacao('');
        try { localStorage.removeItem(key); } catch {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMensagem({ tipo: 'erro', texto: '❌ ' + (data.error || 'Erro ao enviar.') });
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: '❌ Erro de conexão com o servidor.' });
    } finally {
      setEnviando(false);
    }
  }

  const preenchidos = Object.values(notas).filter((v) => v !== '' && v !== undefined).length;
  const percentual = Math.round((preenchidos / CRITERIOS.length) * 100);

  return (
    <div className="card">
      <button
        className="btn-back"
        onClick={() => router.push('/candidatos?avaliador=' + encodeURIComponent(avaliador))}
      >
        ← Voltar aos trainees
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 className="card-title">{trainee}</h1>
          <p className="card-sub" style={{ marginBottom: 0 }}>
            Avaliador: <strong>{avaliador}</strong> · Trainee
          </p>
        </div>

        {/* Barra de Progresso Compacta */}
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
            <span>CRITÉRIOS</span>
            <span>{preenchidos} / {CRITERIOS.length}</span>
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
      </div>

      {mensagem && (
        <div className={'alert ' + (mensagem.tipo === 'sucesso' ? 'alert-ok' : 'alert-err')}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="pessoa-card">
          <div className="pessoa-nome">
            <span>Critérios de Avaliação</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Notas de 0 a 4
            </span>
          </div>

          <div className="criterios-grid">
            {CRITERIOS.map(({ id, label }) => {
              const valorAtual = notas[id];

              return (
                <div key={id} className="criterio-item">
                  <div className="criterio-label">
                    <span>{label}</span>
                    {valorAtual !== '' && valorAtual !== undefined && (
                      <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 11 }}>
                        {NOTA_LABELS[valorAtual]}
                      </span>
                    )}
                  </div>

                  <div className={`score-picker ${erros[id] ? 'has-error' : ''}`}>
                    {NOTAS.map((n) => {
                      const selecionado = valorAtual === n || valorAtual === String(n);
                      return (
                        <button
                          key={n}
                          type="button"
                          title={NOTA_LABELS[n]}
                          className={`score-btn ${selecionado ? `active-${n}` : ''}`}
                          onClick={() => setNota(id, n)}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>

                  {erros[id] && (
                    <span className="err-msg">{erros[id]}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="field" style={{ marginTop: 18 }}>
            <label>Observação Geral sobre o Trainee</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Descreva pontos fortes, comportamentos observados, entregas técnicas ou sugestões de desenvolvimento..."
              rows={3}
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={enviando}>
          {enviando ? 'Enviando avaliação...' : 'Salvar Avaliação do Trainee'}
        </button>
      </form>
    </div>
  );
}
