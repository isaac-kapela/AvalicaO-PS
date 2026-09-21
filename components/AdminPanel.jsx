import { useState, useEffect, useCallback } from 'react';

// ── helpers ────────────────────────────────────────────────────────────
function apiHeaders(pin) {
  return { 'Content-Type': 'application/json', 'x-admin-pin': pin };
}

function Badge({ children, color, bg }) {
  return (
    <span style={{
      background: bg || color,
      color: bg ? color : '#ffffff',
      fontSize: 11,
      fontWeight: 700,
      borderRadius: '9999px',
      padding: '3px 10px',
      letterSpacing: 0.4,
      whiteSpace: 'nowrap',
      border: bg ? `1px solid ${color}40` : 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
          Total cadastrado: {edicao.avaliadores.length} avaliador(es)
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'inherit' }}
          placeholder="Nome do avaliador..."
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionar()}
        />
        <button className="btn-sm" onClick={adicionar} disabled={salvando || !novo.trim()}>
          + Adicionar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {edicao.avaliadores.map((nome) => (
          <div
            key={nome}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--surface-subtle)', borderRadius: 8, padding: '10px 14px',
              border: '1px solid var(--border)'
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{nome}</span>
            <button
              onClick={() => remover(nome)}
              disabled={salvando}
              style={{
                background: '#fee2e2', border: 'none', color: '#dc2626',
                cursor: 'pointer', fontWeight: 700, fontSize: 13, width: 24, height: 24,
                borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Remover"
            >
              ✕
            </button>
          </div>
        ))}
        {edicao.avaliadores.length === 0 && (
          <p style={{ color: 'var(--text-light)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            Nenhum avaliador cadastrado nesta edição.
          </p>
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {numeros.map((n) => (
          <button
            key={n}
            className={`grupo-btn ${grupoSel === n ? 'grupo-btn-active' : ''}`}
            onClick={() => setGrupoSel(n)}
          >
            Grupo {n}
          </button>
        ))}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <input
            style={{ width: 70, padding: '7px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'inherit' }}
            placeholder="Nº..."
            value={novoGrupo}
            onChange={(e) => setNovoGrupo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && criarGrupo()}
          />
          <button className="btn-sm" onClick={criarGrupo} disabled={salvando || !novoGrupo.trim()}>
            + Novo Grupo
          </button>
        </div>
      </div>

      {grupoSel ? (
        <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              Grupo {grupoSel} · {membrosAtuais.length} membro(s)
            </span>
            <button
              onClick={excluirGrupo}
              disabled={salvando}
              style={{
                background: 'transparent', border: '1px solid #dc2626', color: '#dc2626',
                borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600
              }}
            >
              Excluir Grupo
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'inherit' }}
              placeholder="Nome completo do candidato..."
              value={novoMembro}
              onChange={(e) => setNovoMembro(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && adicionarMembro()}
            />
            <button className="btn-sm" onClick={adicionarMembro} disabled={salvando || !novoMembro.trim()}>
              + Candidato
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {membrosAtuais.map((nome) => (
              <div
                key={nome}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#ffffff', borderRadius: 8, padding: '8px 12px',
                  border: '1px solid var(--border)'
                }}
              >
                <span style={{ fontSize: 14, color: 'var(--text-main)' }}>{nome}</span>
                <button
                  onClick={() => removerMembro(nome)}
                  disabled={salvando}
                  style={{
                    background: '#fee2e2', border: 'none', color: '#dc2626',
                    cursor: 'pointer', fontWeight: 700, fontSize: 12, width: 22, height: 22,
                    borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Remover"
                >
                  ✕
                </button>
              </div>
            ))}
            {membrosAtuais.length === 0 && (
              <p style={{ color: 'var(--text-light)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                Nenhum membro neste grupo.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--text-light)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
          Nenhum grupo cadastrado. Crie um grupo acima.
        </p>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
          Total cadastrado: {edicao.candidatos.length} trainee(s)
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'inherit' }}
          placeholder="Nome completo do trainee..."
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionar()}
        />
        <button className="btn-sm" onClick={adicionar} disabled={salvando || !novo.trim()}>
          + Adicionar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {edicao.candidatos.map((nome) => (
          <div
            key={nome}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--surface-subtle)', borderRadius: 8, padding: '10px 14px',
              border: '1px solid var(--border)'
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{nome}</span>
            <button
              onClick={() => remover(nome)}
              disabled={salvando}
              style={{
                background: '#fee2e2', border: 'none', color: '#dc2626',
                cursor: 'pointer', fontWeight: 700, fontSize: 13, width: 24, height: 24,
                borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Remover"
            >
              ✕
            </button>
          </div>
        ))}
        {edicao.candidatos.length === 0 && (
          <p style={{ color: 'var(--text-light)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            Nenhum trainee cadastrado nesta edição.
          </p>
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

  async function desativar(ed) {
    await fetch(`/api/admin/edicoes/${ed._id}`, {
      method: 'PUT',
      headers: apiHeaders(pin),
      body: JSON.stringify({ desativar: true }),
    });
    await carregar();
  }

  async function excluir(ed) {
    if (!window.confirm(`Excluir edição "${ed.codigo} ${ed.tipo.toUpperCase()}"? Isso não apaga as avaliações já salvas.`)) return;
    await fetch(`/api/admin/edicoes/${ed._id}`, { method: 'DELETE', headers: apiHeaders(pin) });
    if (edicaoSel?._id === ed._id) setEdicaoSel(null);
    await carregar();
  }

  useEffect(() => {
    if (edicaoSel && edicoes.length > 0) {
      const nova = edicoes.find((e) => e._id === edicaoSel._id);
      if (nova) setEdicaoSel(nova);
    }
  }, [edicoes]); // eslint-disable-line react-hooks/exhaustive-deps

  function onAtualizado() {
    carregar();
  }

  const tipoLabel = (t) => t === 'ps' ? 'Processo Seletivo' : 'Trainee';

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '36px 18px 64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>Painel Administrativo</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Gerenciamento de edições, grupos e avaliadores</p>
        </div>
        <button className="btn-back" style={{ marginBottom: 0 }} onClick={onLogout}>
          Sair do Painel
        </button>
      </div>

      {erro && <div className="alert alert-err" style={{ marginBottom: 16 }}>{erro}</div>}

      {/* Lista de edições */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Edições do Sistema</h2>
          <button className="btn-sm" onClick={() => setCriando((v) => !v)}>
            {criando ? '✕ Cancelar' : '+ Nova Edição'}
          </button>
        </div>

        {criando && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', background: 'var(--surface-subtle)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
            <input
              style={{ flex: 1, minWidth: 120, padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'inherit' }}
              placeholder="Código (ex: 2026.1)"
              value={novoCodigo}
              onChange={(e) => setNovoCodigo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && criarEdicao()}
            />
            <select
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'inherit' }}
            >
              <option value="ps">Processo Seletivo (PS)</option>
              <option value="trainee">Processo Trainee</option>
            </select>
            <button className="btn-sm" onClick={criarEdicao} disabled={!novoCodigo.trim()}>
              Confirmar Criação
            </button>
          </div>
        )}

        {carregando ? (
          <p style={{ color: 'var(--text-light)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Carregando edições...</p>
        ) : edicoes.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Nenhuma edição encontrada. Crie uma acima.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {edicoes.map((ed) => {
              const selecionada = edicaoSel?._id === ed._id;
              return (
                <div
                  key={ed._id}
                  onClick={() => setEdicaoSel(ed)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                    border: `1.5px solid ${selecionada ? 'var(--primary)' : 'var(--border)'}`,
                    background: selecionada ? '#fff5f5' : 'var(--surface)',
                    boxShadow: selecionada ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 16, flex: 1, color: 'var(--text-main)' }}>
                    {ed.codigo}
                  </span>
                  <Badge color={ed.tipo === 'ps' ? '#2563eb' : '#7c3aed'} bg={ed.tipo === 'ps' ? '#eff6ff' : '#f5f3ff'}>
                    {tipoLabel(ed.tipo)}
                  </Badge>
                  <Badge color={ed.ativo ? '#16a34a' : '#94a3b8'} bg={ed.ativo ? '#f0fdf4' : '#f8fafc'}>
                    {ed.ativo ? '● Ativa' : 'Inativa'}
                  </Badge>

                  {ed.ativo ? (
                    <button
                      className="btn-sm"
                      style={{ fontSize: 11, padding: '5px 12px', background: '#e2e8f0', color: '#475569', boxShadow: 'none' }}
                      onClick={(e) => { e.stopPropagation(); desativar(ed); }}
                    >
                      Desativar
                    </button>
                  ) : (
                    <button
                      className="btn-sm"
                      style={{ fontSize: 11, padding: '5px 12px', background: '#16a34a' }}
                      onClick={(e) => { e.stopPropagation(); ativar(ed); }}
                    >
                      Ativar
                    </button>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); excluir(ed); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontWeight: 700, fontSize: 16, lineHeight: 1, padding: '0 4px' }}
                    title="Excluir edição"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Painel da edição selecionada */}
      {edicaoSel && (
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
              Configurações · {edicaoSel.codigo} ({tipoLabel(edicaoSel.tipo)})
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Alimente a lista de avaliadores e {edicaoSel.tipo === 'ps' ? 'grupos de candidatos' : 'trainees individuais'}
            </p>
          </div>

          <div className="tab-bar" style={{ marginBottom: 20 }}>
            <button
              className={`tab-btn ${aba === 'avaliadores' ? 'tab-active' : ''}`}
              onClick={() => setAba('avaliadores')}
            >
              👥 Avaliadores
            </button>
            <button
              className={`tab-btn ${aba === 'conteudo' ? 'tab-active' : ''}`}
              onClick={() => setAba('conteudo')}
            >
              {edicaoSel.tipo === 'ps' ? '📂 Grupos e Candidatos' : '👤 Trainees'}
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
