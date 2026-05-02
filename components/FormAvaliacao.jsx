import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CRITERIOS } from '../lib/data';

const NOTAS = [0,1,2,3,4];

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
  }

  function setObs(nome, valor) {
    setObservacoes((prev) => ({ ...prev, [nome]: valor }));
  }

  function validar() {
    const e = {};
    membros.forEach((nome) => {
      CRITERIOS.forEach(({ id, label }) => {
        if (notas[nome]?.[id] === '') {
          e[nome + '-' + id] = 'Selecione ' + label;
        } else if (Number(notas[nome]?.[id]) > 4) {
          e[nome + '-' + id] = 'Máximo 4';
        }
      });
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
        setMensagem({ tipo: 'sucesso', texto: 'Avaliação enviada com sucesso!' });
        setNotas(initNotas(membros));
        setObservacoes(initObservacoes(membros));
        setObsGeral('');
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

  return (
    <div className="card">
      <button className="btn-back" onClick={() => router.push('/grupos?avaliador=' + encodeURIComponent(avaliador))}>
        ← Voltar
      </button>
      <h1 className="card-title">Grupo {grupo}</h1>
      <p className="card-sub">Avaliador: <strong>{avaliador}</strong></p>

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
            <h3 className="pessoa-nome">
              <span className="pessoa-index">{idx + 1}</span>
              {nome}
            </h3>
            <div className="criterios-grid">
              {CRITERIOS.map(({ id, label }) => (
                <div key={id} className="field">
                  <label>{label}</label>
                  <select
                    className={erros[nome + '-' + id] ? 'err' : ''}
                    value={notas[nome]?.[id] ?? ''}
                    onChange={(e) => setNota(nome, id, e.target.value)}
                  >
                    <option value="">--</option>
                    {NOTAS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  {erros[nome + '-' + id] && (
                    <span className="err-msg">{erros[nome + '-' + id]}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Observação sobre {nome.split(' ')[0]}</label>
              <textarea
                value={observacoes[nome] || ''}
                onChange={(e) => setObs(nome, e.target.value)}
                placeholder="Comentários sobre este avaliado (opcional)"
                rows={2}
              />
            </div>
          </div>
        ))}

        {membros.length > 0 && (
          <>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Observação geral</label>
              <textarea
                value={obsGeral}
                onChange={(e) => setObsGeral(e.target.value)}
                placeholder="Comentários sobre o grupo (opcional)"
              />
            </div>

            <button type="submit" className="btn-submit" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Salvar Avaliação'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
