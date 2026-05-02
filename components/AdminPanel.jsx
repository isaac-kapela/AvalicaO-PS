import { useState, useEffect, useCallback } from 'react';

// ── helpers ────────────────────────────────────────────────────────────
function apiHeaders(pin) {
  return { 'Content-Type': 'application/json', 'x-admin-pin': pin };
}

function Badge({ children, color }) {
  return (
    <span style={{
      background: color,
      color: '#fff',
      fontSize: 11,
      fontWeight: 700,
      borderRadius: 4,
      padding: '2px 8px',
      letterSpacing: 0.4,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

// ── sub-component: gerencia avaliadores ───────────────────────────────
function GerenciarAvaliadores({ edicao, pin, onAtualizado }) {
  const [novo, setNovo] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(lista) {
    setSalvando(true);
    await fetch(`/api/admin/edicoes/${edicao._id}`, {
      method: 'PUT',
      headers: apiHeaders(pin),
      body: JSON.stringify({ avaliadores: lista }),
    });
    setSalvando(false);
    onAtualizado();
  }

  function remover(nome) {
    salvar(edicao.avaliadores.filter((a) => a !== nome));
  }

  function adicionar() {
    const trimmed = novo.trim();
    if (!trimmed || edicao.avaliadores.includes(trimmed)) return;
    salvar([...edicao.avaliadores, trimmed]);
    setNovo('');
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--gray-4)', marginBottom: 12 }}>
        {edicao.avaliadores.length} avaliador(es)
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid var(--gray-2)', fontSize: 14, fontFamily: 'inherit' }}
          placeholder="Nome do avaliador"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionar()}
        />
        <button className="btn-sm" onClick={adicionar} disabled={salvando || !novo.trim()}>
          + Adicionar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {edicao.avaliadores.map((nome) => (
          <div key={nome} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-1)', borderRadius: 6, padding: '8px 12px' }}>
            <span style={{ fontSize: 14 }}>{nome}</span>
            <button
              onClick={() => remover(nome)}
              disabled={salvando}
              style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 700, fontSize: 16, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ))}
        {edicao.avaliadores.length === 0 && (
          <p style={{ color: 'var(--gray-3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Nenhum avaliador cadastrado.</p>
        )}
      </div>
    </div>
  );
}

// ── sub-component: gerencia grupos PS ─────────────────────────────────
function GerenciarGrupos({ edicao, pin, onAtualizado }) {
  const gruposObj = edicao.grupos || {};
  const numeros = Object.keys(gruposObj).sort((a, b) => Number(a) - Number(b));
  const [grupoSel, setGrupoSel] = useState(numeros[0] || '1');
  const [novoMembro, setNovoMembro] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvarGrupos(grupos) {
    setSalvando(true);
    await fetch(`/api/admin/edicoes/${edicao._id}`, {
      method: 'PUT',
      headers: apiHeaders(pin),
      body: JSON.stringify({ grupos }),
    });
    setSalvando(false);
    onAtualizado();
  }

  function adicionarMembro() {
    const trimmed = novoMembro.trim();
    if (!trimmed) return;
    const lista = gruposObj[grupoSel] || [];
    if (lista.includes(trimmed)) return;
    salvarGrupos({ ...gruposObj, [grupoSel]: [...lista, trimmed] });
    setNovoMembro('');
  }

  function removerMembro(nome) {
    const lista = (gruposObj[grupoSel] || []).filter((m) => m !== nome);
    salvarGrupos({ ...gruposObj, [grupoSel]: lista });
  }

  function criarGrupo() {
    const n = novoGrupo.trim();
    if (!n || gruposObj[n]) return;
    const novos = { ...gruposObj, [n]: [] };
    setGrupoSel(n);
    setNovoGrupo('');
    salvarGrupos(novos);
  }

  function excluirGrupo() {
    if (!window.confirm(`Excluir Grupo ${grupoSel}?`)) return;
    const novos = { ...gruposObj };
    delete novos[grupoSel];
    const restantes = Object.keys(novos).sort((a, b) => Number(a) - Number(b));
    setGrupoSel(restantes[0] || '');
    salvarGrupos(novos);
  }

  const membrosAtuais = gruposObj[grupoSel] || [];

  return (
    <div>
      {/* Seletor de grupo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {numeros.map((n) => (
          <button
            key={n}
            className={`grupo-btn ${grupoSel === n ? 'grupo-btn-active' : ''}`}
            onClick={() => setGrupoSel(n)}
          >
            G{n}
          </button>
        ))}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <input
            style={{ width: 70, padding: '6px 10px', borderRadius: 6, border: '1.5px solid var(--gray-2)', fontSize: 14, fontFamily: 'inherit' }}
            placeholder="Nº"
            value={novoGrupo}
            onChange={(e) => setNovoGrupo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && criarGrupo()}
          />
          <button className="btn-sm" onClick={criarGrupo} disabled={salvando || !novoGrupo.trim()}>
            + Grupo
          </button>
        </div>
      </div>

      {grupoSel ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-4)' }}>
              Grupo {grupoSel} · {membrosAtuais.length} membro(s)
            </span>
            <button
              onClick={excluirGrupo}
              disabled={salvando}
              style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              Excluir grupo
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid var(--gray-2)', fontSize: 14, fontFamily: 'inherit' }}
              placeholder="Nome completo do membro"
              value={novoMembro}
              onChange={(e) => setNovoMembro(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && adicionarMembro()}
            />
            <button className="btn-sm" onClick={adicionarMembro} disabled={salvando || !novoMembro.trim()}>
              + Membro
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {membrosAtuais.map((nome) => (
              <div key={nome} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-1)', borderRadius: 6, padding: '8px 12px' }}>
                <span style={{ fontSize: 14 }}>{nome}</span>
                <button
                  onClick={() => removerMembro(nome)}
                  disabled={salvando}
                  style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 700, fontSize: 16, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            ))}
            {membrosAtuais.length === 0 && (
              <p style={{ color: 'var(--gray-3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Grupo vazio.</p>
            )}
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--gray-3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Nenhum grupo. Crie um acima.</p>
      )}
    </div>
  );
}

// ── sub-component: gerencia candidatos Trainee ────────────────────────
function GerenciarCandidatos({ edicao, pin, onAtualizado }) {
  const [novo, setNovo] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(lista) {
    setSalvando(true);
    await fetch(`/api/admin/edicoes/${edicao._id}`, {
      method: 'PUT',
      headers: apiHeaders(pin),
      body: JSON.stringify({ candidatos: lista }),
    });
    setSalvando(false);
    onAtualizado();
  }

  function remover(nome) {
    salvar(edicao.candidatos.filter((c) => c !== nome));
  }

  function adicionar() {
    const trimmed = novo.trim();
    if (!trimmed || edicao.candidatos.includes(trimmed)) return;
    salvar([...edicao.candidatos, trimmed]);
    setNovo('');
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--gray-4)', marginBottom: 12 }}>
        {edicao.candidatos.length} candidato(s)
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid var(--gray-2)', fontSize: 14, fontFamily: 'inherit' }}
          placeholder="Nome completo do candidato"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionar()}
        />
        <button className="btn-sm" onClick={adicionar} disabled={salvando || !novo.trim()}>
          + Adicionar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {edicao.candidatos.map((nome) => (
          <div key={nome} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-1)', borderRadius: 6, padding: '8px 12px' }}>
            <span style={{ fontSize: 14 }}>{nome}</span>
            <button
              onClick={() => remover(nome)}
              disabled={salvando}
              style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 700, fontSize: 16, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ))}
        {edicao.candidatos.length === 0 && (
          <p style={{ color: 'var(--gray-3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Nenhum candidato cadastrado.</p>
        )}
      </div>
    </div>
  );
}

// ── componente principal ───────────────────────────────────────────────
export default function AdminPanel({ pin, onLogout }) {
  const [edicoes, setEdicoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [edicaoSel, setEdicaoSel] = useState(null);
  const [aba, setAba] = useState('avaliadores');
  const [criando, setCriando] = useState(false);
  const [novoCodigo, setNovoCodigo] = useState('');
  const [novoTipo, setNovoTipo] = useState('ps');
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch('/api/admin/edicoes', { headers: apiHeaders(pin) });
      if (res.status === 401) { onLogout(); return; }
      const json = await res.json();
      if (json.success) {
        setEdicoes(json.data);
        if (json.data.length > 0 && !edicaoSel) {
          setEdicaoSel(json.data[0]);
        }
      }
    } catch {
      setErro('Erro ao carregar edições.');
    } finally {
      setCarregando(false);
    }
  }, [pin, onLogout]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { carregar(); }, [carregar]);

  async function criarEdicao() {
    if (!novoCodigo.trim()) return;
    const res = await fetch('/api/admin/edicoes', {
      method: 'POST',
      headers: apiHeaders(pin),
      body: JSON.stringify({ codigo: novoCodigo.trim(), tipo: novoTipo }),
    });
    const json = await res.json();
    if (json.success) {
      setNovoCodigo('');
      setCriando(false);
      await carregar();
      setEdicaoSel(json.data);
    } else {
      setErro(json.error || 'Erro ao criar edição.');
    }
  }

  async function ativar(ed) {
    await fetch(`/api/admin/edicoes/${ed._id}`, {
      method: 'PUT',
      headers: apiHeaders(pin),
      body: JSON.stringify({ ativar: true, tipo: ed.tipo }),
    });
    await carregar();
  }

  async function excluir(ed) {
    if (!window.confirm(`Excluir edição "${ed.codigo} ${ed.tipo.toUpperCase()}"? Isso não apaga as avaliações.`)) return;
    await fetch(`/api/admin/edicoes/${ed._id}`, { method: 'DELETE', headers: apiHeaders(pin) });
    if (edicaoSel?._id === ed._id) setEdicaoSel(null);
    await carregar();
  }

  // Sync edicaoSel sempre que edicoes for recarregada
  useEffect(() => {
    if (edicaoSel && edicoes.length > 0) {
      const nova = edicoes.find((e) => e._id === edicaoSel._id);
      if (nova) setEdicaoSel(nova);
    }
  }, [edicoes]); // eslint-disable-line react-hooks/exhaustive-deps

  function onAtualizado() {
    carregar();
  }

  const tipoLabel = (t) => t === 'ps' ? 'PS' : 'Trainee';
  const tipoColor = (t) => t === 'ps' ? '#1565c0' : '#4a148c';

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Painel Admin</h1>
        <button className="btn-back" onClick={onLogout}>Sair</button>
      </div>

      {erro && <div className="alert alert-err" style={{ marginBottom: 16 }}>{erro}</div>}

      {/* Lista de edições */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edições</h2>
          <button className="btn-sm" onClick={() => setCriando((v) => !v)}>
            {criando ? 'Cancelar' : '+ Nova edição'}
          </button>
        </div>

        {criando && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <input
              style={{ flex: 1, minWidth: 100, padding: '8px 12px', borderRadius: 6, border: '1.5px solid var(--gray-2)', fontSize: 14, fontFamily: 'inherit' }}
              placeholder="Código (ex: 2027.1)"
              value={novoCodigo}
              onChange={(e) => setNovoCodigo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && criarEdicao()}
            />
            <select
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1.5px solid var(--gray-2)', fontSize: 14, fontFamily: 'inherit' }}
            >
              <option value="ps">PS</option>
              <option value="trainee">Trainee</option>
            </select>
            <button className="btn-sm" onClick={criarEdicao} disabled={!novoCodigo.trim()}>
              Criar
            </button>
          </div>
        )}

        {carregando ? (
          <p style={{ color: 'var(--gray-3)', fontSize: 13, padding: '16px 0' }}>Carregando...</p>
        ) : edicoes.length === 0 ? (
          <p style={{ color: 'var(--gray-3)', fontSize: 13, padding: '16px 0' }}>Nenhuma edição. Crie uma acima.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {edicoes.map((ed) => (
              <div
                key={ed._id}
                onClick={() => setEdicaoSel(ed)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                  border: `2px solid ${edicaoSel?._id === ed._id ? 'var(--red)' : 'var(--gray-2)'}`,
                  background: edicaoSel?._id === ed._id ? '#fff8f8' : 'var(--white)',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{ed.codigo}</span>
                <Badge color={tipoColor(ed.tipo)}>{tipoLabel(ed.tipo)}</Badge>
                <Badge color={ed.ativo ? '#2e7d32' : '#aaa'}>{ed.ativo ? 'Ativo' : 'Inativo'}</Badge>
                {!ed.ativo && (
                  <button
                    className="btn-sm"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={(e) => { e.stopPropagation(); ativar(ed); }}
                  >
                    Ativar
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); excluir(ed); }}
                  style={{ background: 'none', border: 'none', color: 'var(--gray-3)', cursor: 'pointer', fontWeight: 700, fontSize: 18, lineHeight: 1, padding: '0 4px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Painel da edição selecionada */}
      {edicaoSel && (
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            {edicaoSel.codigo} · {tipoLabel(edicaoSel.tipo)}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--gray-4)', marginBottom: 20 }}>
            Gerencie avaliadores e {edicaoSel.tipo === 'ps' ? 'grupos' : 'candidatos'}
          </p>

          <div className="tab-bar" style={{ marginBottom: 20 }}>
            <button
              className={`tab-btn ${aba === 'avaliadores' ? 'tab-active' : ''}`}
              onClick={() => setAba('avaliadores')}
            >
              Avaliadores
            </button>
            <button
              className={`tab-btn ${aba === 'conteudo' ? 'tab-active' : ''}`}
              onClick={() => setAba('conteudo')}
            >
              {edicaoSel.tipo === 'ps' ? 'Grupos' : 'Candidatos'}
            </button>
          </div>

          {aba === 'avaliadores' && (
            <GerenciarAvaliadores edicao={edicaoSel} pin={pin} onAtualizado={onAtualizado} />
          )}
          {aba === 'conteudo' && edicaoSel.tipo === 'ps' && (
            <GerenciarGrupos edicao={edicaoSel} pin={pin} onAtualizado={onAtualizado} />
          )}
          {aba === 'conteudo' && edicaoSel.tipo === 'trainee' && (
            <GerenciarCandidatos edicao={edicaoSel} pin={pin} onAtualizado={onAtualizado} />
          )}
        </div>
      )}
    </div>
  );
}
