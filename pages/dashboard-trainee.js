import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { CRITERIOS } from '../lib/data';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

const RADAR_COLOR = '#a80303';

function badgeColor(media) {
  if (media === null || media === undefined) return '#aaaaaa';
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
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <p style={{ color: '#555' }}>Carregando métricas...</p>
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
    <Layout title="Dashboard Trainee">
      <div className="dashboard-content">
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn-back" onClick={() => router.push('/')}>← Voltar</button>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard — Processo Trainee</h1>
        </div>

        {/* Stat cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-num">{totalAvaliacoes}</span>
            <span className="stat-label">Avaliações enviadas</span>
            <span className="stat-desc">Total de avaliações individuais registradas no banco</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{avaliados}</span>
            <span className="stat-label">Candidatos avaliados</span>
            <span className="stat-desc">Candidatos que já receberam pelo menos uma nota</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{totalCandidatos}</span>
            <span className="stat-label">Total de candidatos</span>
            <span className="stat-desc">Candidatos cadastrados na edição trainee ativa</span>
          </div>
        </div>

        {/* Abas */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${aba === 'ranking' ? 'tab-active' : ''}`}
            onClick={() => setAba('ranking')}
          >
            Ranking Geral
          </button>
          <button
            className={`tab-btn ${aba === 'candidato' ? 'tab-active' : ''}`}
            onClick={() => setAba('candidato')}
          >
            Por Candidato
          </button>
        </div>

        {/* ── ABA: RANKING ── */}
        {aba === 'ranking' && (
          <div className="chart-section">
            <h2 className="section-title">Ranking dos Candidatos</h2>
            <p className="section-sub">
              Ordenado pela <strong>média geral</strong> (escala 0–4), calculada sobre todos os
              avaliadores que já avaliaram o candidato. Candidatos sem avaliação aparecem ao final.
            </p>
            <div className="legenda-badges">
              <span className="legenda-item">
                <span className="rank-badge" style={{ background: '#2e7d32', fontSize: 12, padding: '2px 10px' }}>≥ 3.5</span> Excelente
              </span>
              <span className="legenda-item">
                <span className="rank-badge" style={{ background: '#f57c00', fontSize: 12, padding: '2px 10px' }}>≥ 2.5</span> Regular
              </span>
              <span className="legenda-item">
                <span className="rank-badge" style={{ background: '#a80303', fontSize: 12, padding: '2px 10px' }}>&lt; 2.5</span> Abaixo
              </span>
            </div>

            <div className="ranking-list">
              {ranking.map((item, i) => (
                <div
                  key={item.nome}
                  className="ranking-row"
                  style={{ cursor: item.media !== null ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (item.media !== null) {
                      setCandidatoSel(item.nome);
                      setAba('candidato');
                    }
                  }}
                >
                  <span className="rank-pos">
                    {item.media !== null ? medalha(i + 1) : '—'}
                  </span>
                  <span className="rank-nome">{item.nome}</span>
                  <span className="rank-grupo" style={{ fontSize: 11, color: '#aaa' }}>
                    {item.totalAvaliacoes} avaliação(ões)
                  </span>
                  <span
                    className="rank-badge"
                    style={{ background: badgeColor(item.media) }}
                  >
                    {item.media !== null ? item.media.toFixed(2) : 'Sem nota'}
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

        {/* ── ABA: CANDIDATO ── */}
        {aba === 'candidato' && (
          <div className="chart-section">
            <h2 className="section-title">Perfil por Candidato</h2>
            <p className="section-sub">
              Média de cada critério recebida pelo candidato de todos os avaliadores.
            </p>

            <div className="field member-select-wrap">
              <label htmlFor="candidato-sel">Selecione o candidato</label>
              <select
                id="candidato-sel"
                value={candidatoSel || ''}
                onChange={(e) => setCandidatoSel(e.target.value)}
                className="member-select"
              >
                {(dados.candidatos || []).map((nome) => (
                  <option key={nome} value={nome}>{nome}</option>
                ))}
              </select>
            </div>

            {dadosCandidato.media !== undefined && dadosCandidato.media !== null ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <span
                    className="rank-badge"
                    style={{ fontSize: 18, padding: '6px 20px', background: badgeColor(dadosCandidato.media) }}
                  >
                    Média: {dadosCandidato.media?.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 12, color: '#aaa', marginLeft: 12 }}>
                    {dadosCandidato.totalAvaliacoes} avaliador(es)
                  </span>
                </div>

                <ResponsiveContainer width="100%" height={360}>
                  <RadarChart data={radarData} margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 4]} tickCount={5} tick={{ fontSize: 10 }} />
                    <Radar
                      name={candidatoSel}
                      dataKey="A"
                      stroke={RADAR_COLOR}
                      fill={RADAR_COLOR}
                      fillOpacity={0.35}
                    />
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
                          <span
                            className="rank-badge"
                            style={{ background: badgeColor(dadosCandidato[c.id]), fontSize: 12, padding: '2px 10px' }}
                          >
                            {dadosCandidato[c.id]?.toFixed(2) ?? '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '32px 0' }}>
                {candidatoSel
                  ? `${candidatoSel.split(' ')[0]} ainda não foi avaliado(a).`
                  : 'Selecione um candidato.'}
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
