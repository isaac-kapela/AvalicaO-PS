import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { CRITERIOS } from '../lib/data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const BAR_COLOR = '#c9182b';
const RADAR_COLOR = '#c9182b';

function badgeColor(media) {
  if (media === null || media === undefined) return '#94a3b8';
  if (media >= 3.5) return '#16a34a'; // verde
  if (media >= 2.5) return '#d97706'; // âmbar
  return '#dc2626'; // vermelho
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
        <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Carregando dados estatísticos...</p>
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
    <Layout title="Dashboard de Avaliações" subtitle="Métricas do Processo Seletivo">
      <div className="dashboard-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-back" style={{ marginBottom: 0 }} onClick={() => router.push('/')}>
              ← Início
            </button>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>
              Painel de Desempenho (PS)
            </h1>
          </div>
          <a href="/api/exportar" className="btn-sm" style={{ padding: '8px 14px' }}>
            📥 Baixar Planilha (.xlsx)
          </a>
        </div>

        {/* Stat cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-num">{totalAvaliacoes}</span>
            <span className="stat-label">Avaliações enviadas</span>
            <span className="stat-desc">Grupos com avaliações computadas</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{ranking.length}</span>
            <span className="stat-label">Candidatos avaliados</span>
            <span className="stat-desc">Participantes com notas registradas</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{totalMembros}</span>
            <span className="stat-label">Total de inscritos</span>
            <span className="stat-desc">Candidatos alocados nos grupos</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${aba === 'ranking' ? 'tab-active' : ''}`} onClick={() => setAba('ranking')}>
            🏆 Ranking Geral
          </button>
          <button className={`tab-btn ${aba === 'grupo' ? 'tab-active' : ''}`} onClick={() => setAba('grupo')}>
            📊 Médias por Grupo
          </button>
          <button className={`tab-btn ${aba === 'membro' ? 'tab-active' : ''}`} onClick={() => setAba('membro')}>
            👤 Radar por Membro
          </button>
        </div>

        {/* ── RANKING ── */}
        {aba === 'ranking' && (
          <div className="chart-section">
            <h2 className="section-title">Ranking de Desempenho dos Candidatos</h2>
            <p className="section-sub">
              Ordenado pela <strong>média ponderada</strong> em todos os critérios avaliados (escala de 0 a 4).
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }} /> ≥ 3.5 Excelente
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d97706' }} /> ≥ 2.5 Regular
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626' }} /> &lt; 2.5 Insuficiente
              </span>
            </div>

            <div className="ranking-list">
              {ranking.map((item, i) => (
                <div key={item.nome} className="ranking-row">
                  <span className="rank-pos">{medalha(i + 1)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grupo {item.grupo}</div>
                  </div>
                  <span className="rank-badge" style={{ background: badgeColor(item.media) }}>
                    Média: {item.media?.toFixed(2)}
                  </span>
                </div>
              ))}
              {ranking.length === 0 && (
                <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px 0' }}>
                  Nenhuma avaliação registrada ainda.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── GRUPO ── */}
        {aba === 'grupo' && (
          <div className="chart-section">
            <h2 className="section-title">Média de Critérios por Grupo</h2>
            <p className="section-sub">
              Visualize os pontos fortes e de desenvolvimento de cada grupo de dinâmicas.
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
              <div className="members-chips" style={{ marginBottom: 24 }}>
                {(GRUPOS[grupoSel] || []).map((m) => (
                  <span key={m} className="member-chip">{m}</span>
                ))}
              </div>
            )}

            {dadosGrupo ? (
              <div style={{ width: '100%', height: 380, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 8, right: 30, left: 16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 4]} tickCount={5} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }} />
                    <Tooltip
                      formatter={(v) => [`${v.toFixed(2)} / 4.0`, 'Média']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="media" radius={[0, 6, 6, 0]}>
                      {barData.map((_, idx) => <Cell key={idx} fill={BAR_COLOR} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px 0' }}>
                Sem dados para este grupo.
              </p>
            )}
          </div>
        )}

        {/* ── MEMBRO ── */}
        {aba === 'membro' && (
          <div className="chart-section">
            <h2 className="section-title">Análise de Competências Individual</h2>
            <p className="section-sub">
              Gráfico radar detalhando as 10 competências avaliadas para cada candidato.
            </p>

            <div style={{ maxWidth: 380, marginBottom: 24 }}>
              <select
                className="field select"
                style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--border)', width: '100%' }}
                value={membroSel || ''}
                onChange={(e) => setMembroSel(e.target.value)}
              >
                {todosMembros.map(({ nome, grupo }) => (
                  <option key={nome} value={nome}>
                    {nome} (G{grupo})
                  </option>
                ))}
              </select>
            </div>

            {membroSel && (
              <div>
                <div style={{ width: '100%', height: 380 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis domain={[0, 4]} tickCount={5} stroke="#94a3b8" />
                      <Tooltip formatter={(v) => [`${v.toFixed(2)} / 4.0`, 'Nota']} />
                      <Radar name="Nota" dataKey="A" stroke={RADAR_COLOR} fill={RADAR_COLOR} fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
