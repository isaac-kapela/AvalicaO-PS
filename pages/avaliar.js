import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';

const GRUPOS = {
  1: ['Raphael Eloi Almeida de Oliveira', 'Gabriel Pereira Berg', 'João Pedro Leal Costa', 'Jean Balbino de Araujo'],
  2: ['Bernardo Reis Gayo', 'Arthur Esteves Mateus', 'João Henrique Fayer de Magalhães', 'Kaio Silva Ferreira'],
  3: ['Leonardo Duarte Miranda', 'Igor de Paula Bastos', 'Ana Carolina Carvalho da Silva', 'Caík Lazaroni Pereira'],
  4: ['Paulo Victor Silva Ramos', 'João Gabriel de Oliveira Miranda', 'João Eduardo Fernandes Mazilão Sampaio de Souza', 'Paulo Machado de Araujo Lopes'],
  5: ['Matheus Morais de Carvalho', 'Mateus Albuquerque', 'Sávio Benvindo da Silva', 'Emanuely Mol Duarte'],
};

const CRITERIOS = [
  { id: 'comunicacao', label: 'Comunicação' },
  { id: 'trabalhoEquipe', label: 'Trabalho em Equipe' },
  { id: 'organizacao', label: 'Organização' },
];

function initNotas(membros) {
  const obj = {};
  membros.forEach((nome) => { obj[nome] = { comunicacao: '', trabalhoEquipe: '', organizacao: '' }; });
  return obj;
}

export default function AvaliarPage() {
  const router = useRouter();
  const { avaliador, grupo } = router.query;
  const membros = GRUPOS[grupo] || [];

  const [notas, setNotas] = useState({});
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [erros, setErros] = useState({});

  const notasRef = Object.keys(notas).length > 0 ? notas : (membros.length > 0 ? initNotas(membros) : {});

  function setNota(nome, campo, valor) {
    setNotas((prev) => ({
      ...(Object.keys(prev).length > 0 ? prev : initNotas(membros)),
      [nome]: { ...(prev[nome] || {}), [campo]: valor },
    }));
  }

  function validar() {
    const e = {};
    membros.forEach((nome) => {
      CRITERIOS.forEach(({ id, label }) => {
        const v = notasRef[nome]?.[id];
        if (v === '' || v === undefined) e[nome + '-' + id] = 'Informe ' + label;
        else if (Number(v) < 0 || Number(v) > 10) e[nome + '-' + id] = 'Entre 0 e 10';
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

    const avaliacoes = membros.map((nome) => ({
      nome,
      comunicacao: Number(notasRef[nome].comunicacao),
      trabalhoEquipe: Number(notasRef[nome].trabalhoEquipe),
      organizacao: Number(notasRef[nome].organizacao),
    }));

    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avaliador, grupo: Number(grupo), avaliacoes, observacao }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem({ tipo: 'sucesso', texto: 'Avaliação enviada com sucesso!' });
        setNotas(initNotas(membros));
        setObservacao('');
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
    <>
      <Head>
        <title>Avaliação — Grupo {grupo}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="page">
        <header className="header">
          <img src="/logo.png" alt="Logo" className="header-logo" />
          <span className="header-title">Sistema de Avaliação</span>
          {avaliador && <span className="header-subtitle">{avaliador}</span>}
        </header>

        <main className="content">
          <div className="card">
            <button className="btn-back" onClick={() => router.push('/grupos?avaliador=' + encodeURIComponent(avaliador))}>
              ← Voltar
            </button>
            <h1 className="card-title">Grupo {grupo}</h1>
            <p className="card-sub">Avaliador: <strong>{avaliador}</strong></p>

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
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="0–10"
                          className={erros[nome + '-' + id] ? 'err' : ''}
                          value={notasRef[nome]?.[id] ?? ''}
                          onChange={(e) => setNota(nome, id, e.target.value)}
                        />
                        {erros[nome + '-' + id] && <span className="err-msg">{erros[nome + '-' + id]}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="field" style={{ marginBottom: 20 }}>
                <label>Observação geral</label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Comentários sobre o grupo (opcional)"
                />
              </div>

              <button type="submit" className="btn-submit" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Salvar Avaliação'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
