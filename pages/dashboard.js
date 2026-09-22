import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { CRITERIOS } from '../lib/data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const BAR_COLOR = '#c9182b';
const RADAR_COLOR = '#c9182b';

function badgeColor(media) {
  if (media === null || media === undefined) return '#94a3b8';
  if (media >= 3.5) return '#16a34a';
  if (media >= 2.5) return '#d97706';
  return '#dc2626';
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
        const gNums = Object.keys(json.grupos || {}).sort((a, b) => Number(a) - Number(b));
        if (gNums.length > 0) setGrupoSel(gNums[0]);

        const primeiroMembro = Object.entries(json.grupos || {})
          .flatMap(([, membros]) => membros)[0];
        if (primeiroMembro) setMembroSel(primeiroMembro);

        setCarregando(false);
      })
      .catch((e) => { setErro(e.message); setCarregando(false); });
  }, []);

  if (carregando) {
    return (
      <Layout title="Dashboard PS">
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Carregando dados consolidados...</p>
        </div>
      </Layout>
    );
  }

  if (erro) {
    return (
      <Layout title="Dashboard PS">
        <div className="card">
          <div className="alert alert-err">Erro ao carregar dados: {erro}</div>
          <button className="btn-back" onClick={() => router.push('/')}>← Voltar</button>
        </div>
      </Layout>
    );
  }

  const { porMembro, porGrupo, ranking, grupos: GRUPOS, totalAvaliacoes, avaliadores } = dados;
  const numeros = Object.keys(GRUPOS || {}).sort((a, b) => Number(a) - Number(b));
  const totalCandidatos = Object.values(GRUPOS || {}).reduce((acc, m) => acc + m.length, 0);

  // Dados do gráfico de barras (por grupo)
  const dadosGrupo = grupoSel ? porGrupo[grupoSel] : null;
  const barData = CRITERIOS.map((c) => ({
    name: c.label,
    media: dadosGrupo?.[c.id] ?? 0,
  }));

  // Dados do gráfico radar (por membro)
  const dadosMembro = membroSel ? (porMembro[membroSel] || {}) : {};
  const radarData = CRITERIOS.map((c) => ({
    subject: c.label,
    A: dadosMembro[c.id] ?? 0,
    fullMark: 4,
  }));

  const todosMembros = Object.entries(GRUPOS || {}).flatMap(([g, membros]) =>
    membros.map((m) => ({ nome: m, grupo: g }))
  );

  return (
    <Layout title="Dashboard PS" subtitle="Processo Seletivo">
      <div className="dashboard-content">
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-back" style={{ marginBottom: 0 }} onClick={() => router.push('/')}>
              ← Início
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>
              Painel de Desempenho (PS)
            </h1>
          </div>

          <a href="/api/exportar?tipo=ps" className="btn-sm">
            📊 Exportar PS
          </a>
        </div>

        {/* Stat cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-num">{totalAvaliacoes}</span>
            <span className="stat-label">Avaliações enviadas</span>
            <span className="stat-desc">Registros de formulários preenchidos</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{avaliadores}</span>
            <span className="stat-label">Avaliadores ativos</span>
            <span className="stat-desc">Membros que já enviaram notas</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{totalCandidatos}</span>
            <span className="stat-label">Total de candidatos</span>
            <span className="stat-desc">Distribuídos em {numeros.length} grupos</span>
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
            👤 Radar Individual
          </button>
        </div>

        {/* ── RANKING ── */}
        {aba === 'ranking' && (
          <div className="chart-section">
            <h2 className="section-title">Classificação Geral dos Candidatos</h2>
            <p className="section-sub">
              Média ponderada calculada a partir de todas as avaliações recebidas na edição.
            </p>

            {/* Legenda */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} /> ≥ 3.5 Excelente
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} /> ≥ 2.5 Regular
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} /> &lt; 2.5 Insuficiente
              </span>
            </div>

            <div className="ranking-list">
              {ranking.map((item, i) => (
                <div key={item.nome} className="ranking-row">
                  <span className="rank-pos">{medalha(i + 1)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.nome}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grupo {item.grupo}</div>
                  </div>
                  <span className="rank-badge" style={{ background: badgeColor(item.media) }}>
                    {item.media?.toFixed(2)}
                  </span>
                </div>
              ))}
              {ranking.length === 0 && (
                <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '32px 0' }}>
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
              <div className="members-chips" style={{ marginBottom: 18 }}>
                {(GRUPOS[grupoSel] || []).map((m) => (
                  <span key={m} className="member-chip">{m}</span>
                ))}
              </div>
            )}

            {dadosGrupo ? (
              <div style={{ width: '100%', height: 360, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 4]} tickCount={5} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }} />
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
              <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '32px 0' }}>
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

            <div style={{ maxWidth: 360, marginBottom: 20 }}>
              <select
                className="field select"
                style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', width: '100%', fontSize: 14 }}
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
              <div style={{ width: '100%', height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                    <PolarRadiusAxis domain={[0, 4]} tickCount={5} stroke="#94a3b8" />
                    <Tooltip formatter={(v) => [`${v.toFixed(2)} / 4.0`, 'Nota']} />
                    <Radar name="Nota" dataKey="A" stroke={RADAR_COLOR} fill={RADAR_COLOR} fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
