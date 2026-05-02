import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CRITERIOS } from '../lib/data';

const NOTAS = [0, 1, 2, 3, 4];

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
  }

  function validar() {
    const e = {};
    CRITERIOS.forEach(({ id, label }) => {
      if (notas[id] === '') {
        e[id] = 'Selecione ' + label;
      }
    });
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errosVal = validar();
    if (Object.keys(errosVal).length > 0) { setErros(errosVal); return; }
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
        setMensagem({ tipo: 'sucesso', texto: 'Avaliação enviada com sucesso!' });
        setNotas(initNotas());
        setObservacao('');
        try { localStorage.removeItem(key); } catch {}
      } else {
        setMensagem({ tipo: 'erro', texto: data.error || 'Erro ao enviar.' });
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão.' });
    } finally {
      setEnviando(false);
    }
  }

  const primeiroNome = trainee.split(' ')[0];

  return (
    <div className="card">
      <button
        className="btn-back"
        onClick={() => router.push('/candidatos?avaliador=' + encodeURIComponent(avaliador))}
      >
        ← Voltar
      </button>

      <h1 className="card-title">{trainee}</h1>
      <p className="card-sub">
        Avaliador: <strong>{avaliador}</strong> &nbsp;·&nbsp; Processo Trainee
      </p>

      {mensagem && (
        <div className={'alert ' + (mensagem.tipo === 'sucesso' ? 'alert-ok' : 'alert-err')}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="pessoa-card">
          <h3 className="pessoa-nome">
            <span className="pessoa-index">T</span>
            {trainee}
          </h3>

          <div className="criterios-grid">
            {CRITERIOS.map(({ id, label }) => (
              <div key={id} className="field">
                <label>{label}</label>
                <select
                  className={erros[id] ? 'err' : ''}
                  value={notas[id] ?? ''}
                  onChange={(e) => setNota(id, e.target.value)}
                >
                  <option value="">--</option>
                  {NOTAS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {erros[id] && <span className="err-msg">{erros[id]}</span>}
              </div>
            ))}
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Observação sobre {primeiroNome}</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Comentários sobre este candidato (opcional)"
              rows={3}
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Salvar Avaliação'}
        </button>
      </form>
    </div>
  );
}
