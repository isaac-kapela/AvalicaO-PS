import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { CRITERIOS } from '../lib/data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const BAR_COLOR = '#a80303';
const RADAR_COLOR = '#a80303';

function badgeColor(media) {
  if (media === null) return '#aaaaaa';
  if (media >= 3.5) return '#2e7d32';
  if (media >= 2.5) return '#f57c00';
  return '#a80303';
}

function medalha(pos) {
  if (pos === 1) return '🥇';
  if (pos === 2) return '🥈';
  if (pos === 3) return '🥉';
  return `${pos}º`;
}

export default function Dashboard() {
  const router = useRouter();
  const [aba, setAba] = useState('ranking');
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [grupoSel, setGrupoSel] = useState(null);
  const [membroSel, setMembroSel] = useState(null);

  useEffect(() => {
    fetch('/api/metricas')
      .then((r) => r.json())
      .then((json) => {
        setDados(json);
        // Inicializa seleções após carregar
        const nums = Object.keys(json.grupos || {}).sort((a, b) => Number(a) - Number(b));
        if (nums.length > 0) setGrupoSel(nums[0]);
        const todosM = Object.entries(json.grupos || {}).flatMap(([, membros]) => membros);
        if (todosM.length > 0) setMembroSel(todosM[0]);
        setCarregando(false);
      })
      .catch((e) => { setErro(e.message); setCarregando(false); });
  }, []);

  if (carregando) {
    return (
      <Layout title="Dashboard">
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <p style={{ color: '#555' }}>Carregando métricas...</p>
        </div>
      </Layout>
    );
  }

  if (erro) {
    return (
      <Layout title="Dashboard">
        <div className="card">
          <div className="alert alert-err">Erro ao carregar dados: {erro}</div>
          <button className="btn-back" onClick={() => router.push('/')}>← Voltar</button>
        </div>
      </Layout>
    );
  }

  const { porMembro, porGrupo, ranking, grupos, totalAvaliacoes } = dados;
  const GRUPOS = grupos || {};
  const numeros = Object.keys(GRUPOS).sort((a, b) => Number(a) - Number(b));
  const todosMembros = Object.entries(GRUPOS).flatMap(([g, membros]) =>
    membros.map((nome) => ({ nome, grupo: Number(g) }))
  );
  const totalMembros = todosMembros.length;

  const dadosGrupo = grupoSel ? porGrupo[grupoSel] : null;
  const barData = CRITERIOS.map((c) => ({
    name: c.label,
    media: dadosGrupo?.[c.id] ?? 0,
  }));

  const dadosMembro = membroSel ? (porMembro[membroSel] || {}) : {};
  const radarData = CRITERIOS.map((c) => ({
    subject: c.label,
    A: dadosMembro[c.id] ?? 0,
    fullMark: 4,
  }));

  return (
    <Layout title="Dashboard de Avaliações">
      <div className="dashboard-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn-back" onClick={() => router.push('/')}>← Voltar</button>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard</h1>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-num">{totalAvaliacoes}</span>
            <span className="stat-label">Avaliações enviadas</span>
            <span className="stat-desc">Quantidade de grupos avaliados enviados ao banco</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{ranking.length}</span>
            <span className="stat-label">Membros avaliados</span>
            <span className="stat-desc">Membros que já receberam pelo menos uma nota de algum avaliador</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{totalMembros}</span>
            <span className="stat-label">Total de membros</span>
            <span className="stat-desc">Total de participantes cadastrados na edição ativa</span>
          </div>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${aba === 'ranking' ? 'tab-active' : ''}`} onClick={() => setAba('ranking')}>
            Ranking Geral
          </button>
          <button className={`tab-btn ${aba === 'grupo' ? 'tab-active' : ''}`} onClick={() => setAba('grupo')}>
            Por Grupo
          </button>
          <button className={`tab-btn ${aba === 'membro' ? 'tab-active' : ''}`} onClick={() => setAba('membro')}>
            Por Membro
          </button>
        </div>

        {/* ── RANKING ── */}
        {aba === 'ranking' && (
          <div className="chart-section">
            <h2 className="section-title">Ranking Geral dos Membros</h2>
            <p className="section-sub">
              Ordenado pela <strong>média geral</strong> de cada membro (escala 0–4).
            </p>
            <div className="legenda-badges">
              <span className="legenda-item"><span className="rank-badge" style={{ background: '#2e7d32', fontSize: 12, padding: '2px 10px' }}>≥ 3.5</span> Excelente</span>
              <span className="legenda-item"><span className="rank-badge" style={{ background: '#f57c00', fontSize: 12, padding: '2px 10px' }}>≥ 2.5</span> Regular</span>
              <span className="legenda-item"><span className="rank-badge" style={{ background: '#a80303', fontSize: 12, padding: '2px 10px' }}>&lt; 2.5</span> Abaixo</span>
            </div>
            <div className="ranking-list">
              {ranking.map((item, i) => (
                <div key={item.nome} className="ranking-row">
                  <span className="rank-pos">{medalha(i + 1)}</span>
                  <span className="rank-nome">{item.nome}</span>
                  <span className="rank-grupo">Grupo {item.grupo}</span>
                  <span className="rank-badge" style={{ background: badgeColor(item.media) }}>
                    {item.media?.toFixed(2)}
                  </span>
                </div>
              ))}
              {ranking.length === 0 && (
                <p style={{ color: '#aaa', textAlign: 'center', padding: '32px 0' }}>
                  Nenhuma avaliação registrada ainda.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── GRUPO ── */}
        {aba === 'grupo' && (
          <div className="chart-section">
            <h2 className="section-title">Média por Critério — Grupo</h2>
            <p className="section-sub">
              Média dos critérios de todos os membros do grupo selecionado.
            </p>
            <div className="grupo-selector">
              {numeros.map((g) => (
                <button
                  key={g}
                  className={`grupo-btn ${grupoSel === g ? 'grupo-btn-active' : ''}`}
                  onClick={() => setGrupoSel(g)}
                >
                  Grupo {g}
                </button>
              ))}
            </div>

            {grupoSel && (
              <div className="membros-tag-list">
                {(GRUPOS[grupoSel] || []).map((m) => (
                  <span key={m} className="membro-tag">{m}</span>
                ))}
              </div>
            )}

            {dadosGrupo ? (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={barData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 4]} tickCount={5} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [v.toFixed(2), 'Média']} contentStyle={{ fontSize: 13 }} />
                  <Bar dataKey="media" radius={[0, 4, 4, 0]}>
                    {barData.map((_, idx) => <Cell key={idx} fill={BAR_COLOR} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '32px 0' }}>
                Nenhuma avaliação para este grupo ainda.
              </p>
            )}

            {dadosGrupo && (
              <p className="media-geral-label">
                Média geral do grupo:{' '}
                <strong style={{ color: badgeColor(dadosGrupo.media) }}>
                  {dadosGrupo.media?.toFixed(2) ?? '—'}
                </strong>
              </p>
            )}
          </div>
        )}

        {/* ── MEMBRO ── */}
        {aba === 'membro' && (
          <div className="chart-section">
            <h2 className="section-title">Perfil por Membro</h2>
            <p className="section-sub">
              Média de cada critério recebida pelo membro de todos os avaliadores.
            </p>

            <div className="field member-select-wrap">
              <label htmlFor="membro-sel">Selecione o membro</label>
              <select
                id="membro-sel"
                value={membroSel || ''}
                onChange={(e) => setMembroSel(e.target.value)}
                className="member-select"
              >
                {numeros.map((g) => (
                  <optgroup key={g} label={`Grupo ${g}`}>
                    {(GRUPOS[g] || []).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {dadosMembro.media !== undefined && dadosMembro.media !== null ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <span className="rank-badge" style={{ fontSize: 18, padding: '6px 20px', background: badgeColor(dadosMembro.media) }}>
                    Média: {dadosMembro.media?.toFixed(2)}
                  </span>
                </div>

                <ResponsiveContainer width="100%" height={360}>
                  <RadarChart data={radarData} margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 4]} tickCount={5} tick={{ fontSize: 10 }} />
                    <Radar name={membroSel} dataKey="A" stroke={RADAR_COLOR} fill={RADAR_COLOR} fillOpacity={0.35} />
                    <Tooltip formatter={(v) => [v.toFixed(2), 'Média']} contentStyle={{ fontSize: 13 }} />
                  </RadarChart>
                </ResponsiveContainer>

                <table className="criterios-table">
                  <thead>
                    <tr><th>Critério</th><th>Média</th></tr>
                  </thead>
                  <tbody>
                    {CRITERIOS.map((c) => (
                      <tr key={c.id}>
                        <td>{c.label}</td>
                        <td>
                          <span className="rank-badge" style={{ background: badgeColor(dadosMembro[c.id]), fontSize: 12, padding: '2px 10px' }}>
                            {dadosMembro[c.id]?.toFixed(2) ?? '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '32px 0' }}>
                Nenhuma avaliação para este membro ainda.
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
