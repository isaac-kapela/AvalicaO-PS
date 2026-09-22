import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { CRITERIOS } from '../lib/data';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

const RADAR_COLOR = '#6366f1';

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

export default function DashboardTrainee() {
  const router = useRouter();
  const [aba, setAba] = useState('ranking');
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [candidatoSel, setCandidatoSel] = useState(null);

  useEffect(() => {
    fetch('/api/metricas-trainee')
      .then((r) => r.json())
      .then((json) => {
        setDados(json);
        if (json.candidatos?.length > 0) setCandidatoSel(json.candidatos[0]);
        setCarregando(false);
      })
      .catch((e) => { setErro(e.message); setCarregando(false); });
  }, []);

  if (carregando) {
    return (
      <Layout title="Dashboard Trainee">
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Carregando métricas de trainees...</p>
        </div>
      </Layout>
    );
  }

  if (erro) {
    return (
      <Layout title="Dashboard Trainee">
        <div className="card">
          <div className="alert alert-err">Erro ao carregar dados: {erro}</div>
          <button className="btn-back" onClick={() => router.push('/')}>← Voltar</button>
        </div>
      </Layout>
    );
  }

  const { porCandidato, ranking, totalAvaliacoes, totalCandidatos, avaliados } = dados;

  const dadosCandidato = candidatoSel ? (porCandidato[candidatoSel] || {}) : {};
  const radarData = CRITERIOS.map((c) => ({
    subject: c.label,
    A: dadosCandidato[c.id] ?? 0,
    fullMark: 4,
  }));

  return (
    <Layout title="Dashboard Trainee" subtitle="Acompanhamento Individual">
      <div className="dashboard-content">
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-back" style={{ marginBottom: 0 }} onClick={() => router.push('/')}>
              ← Início
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>
              Painel de Desempenho (Trainees)
            </h1>
          </div>

          <a href="/api/exportar?tipo=trainee" className="btn-sm">
            📊 Exportar Trainee
          </a>
        </div>

        {/* Stat cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-num">{totalAvaliacoes}</span>
            <span className="stat-label">Avaliações enviadas</span>
            <span className="stat-desc">Total de feedbacks individuais registrados</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{avaliados}</span>
            <span className="stat-label">Trainees avaliados</span>
            <span className="stat-desc">Membros que já receberam nota</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{totalCandidatos}</span>
            <span className="stat-label">Total de trainees</span>
            <span className="stat-desc">Cadastrados na edição atual</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${aba === 'ranking' ? 'tab-active' : ''}`} onClick={() => setAba('ranking')}>
            🏆 Ranking Geral
          </button>
          <button className={`tab-btn ${aba === 'radar' ? 'tab-active' : ''}`} onClick={() => setAba('radar')}>
            👤 Radar de Competências
          </button>
        </div>

        {/* ── RANKING ── */}
        {aba === 'ranking' && (
          <div className="chart-section">
            <h2 className="section-title">Ranking de Desempenho dos Trainees</h2>
            <p className="section-sub">
              Média ponderada baseada nas avaliações enviadas pelos membros seniores.
            </p>

            <div className="ranking-list">
              {ranking.map((item, i) => (
                <div key={item.nome} className="ranking-row">
                  <span className="rank-pos">{medalha(i + 1)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.nome}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {item.totalAvaliacoes} {item.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
                    </div>
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

        {/* ── RADAR ── */}
        {aba === 'radar' && (
          <div className="chart-section">
            <h2 className="section-title">Radar de Competências por Trainee</h2>
            <p className="section-sub">
              Visualize a distribuição de notas em cada competência individual.
            </p>

            <div style={{ maxWidth: 360, marginBottom: 20 }}>
              <select
                className="field select"
                style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', width: '100%', fontSize: 14 }}
                value={candidatoSel || ''}
                onChange={(e) => setCandidatoSel(e.target.value)}
              >
                {(dados.candidatos || []).map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            {candidatoSel && (
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
