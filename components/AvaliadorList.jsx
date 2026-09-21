import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

function getInitials(name) {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AvaliadorList() {
  const router = useRouter();
  const [avaliadores, setAvaliadores] = useState([]);
  const [carregandoPS, setCarregandoPS] = useState(true);
  const [edicaoPS, setEdicaoPS] = useState(null);
  const [edicaoTrainee, setEdicaoTrainee] = useState(null);
  const [carregandoTrainee, setCarregandoTrainee] = useState(true);
  const [modalExportar, setModalExportar] = useState(false);

  useEffect(() => {
    // Busca Edição Ativa de PS
    fetch('/api/edicao-ativa?tipo=ps')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setEdicaoPS(json.data);
          setAvaliadores(json.data.avaliadores || []);
        } else {
          setEdicaoPS(null);
          setAvaliadores([]);
        }
      })
      .catch(() => {
        setEdicaoPS(null);
        setAvaliadores([]);
      })
      .finally(() => setCarregandoPS(false));

    // Busca Edição Ativa de Trainee
    fetch('/api/edicao-ativa?tipo=trainee')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setEdicaoTrainee(json.data);
        } else {
          setEdicaoTrainee(null);
        }
      })
      .catch(() => setEdicaoTrainee(null))
      .finally(() => setCarregandoTrainee(false));
  }, []);

  function handleAbrirExportar(e) {
    e.preventDefault();
    if (!edicaoPS && !edicaoTrainee) {
      alert('Nenhum processo está ativo no momento para exportação.');
      return;
    }
    setModalExportar(true);
  }

  return (
    <div className="card">
      <div className="card-logo-wrap">
        <div className="card-logo-circle">
          <img src="/logo.png" alt="Microraptor Logo" className="card-logo" />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 className="card-title">
          Processo Seletivo {edicaoPS ? `· ${edicaoPS.codigo}` : ''}
        </h1>
        <p className="card-sub">
          {edicaoPS
            ? 'Selecione seu nome na lista para iniciar a avaliação dos candidatos'
            : 'Nenhum Processo Seletivo ativo no momento'}
        </p>
      </div>

      {carregandoPS ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando dados da edição...</p>
        </div>
      ) : !edicaoPS ? (
        <div style={{
          background: 'var(--surface-subtle)',
          border: '1.5px dashed var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 20px',
          textAlign: 'center',
          marginBottom: 24
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
            Processo Seletivo Desativado
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 16px' }}>
            Nenhuma edição de Processo Seletivo está ativa. Ative uma edição através do Painel Admin para liberar as avaliações.
          </p>
          <Link href="/admin" className="btn-sm" style={{ display: 'inline-flex' }}>
            Ir para Painel Admin →
          </Link>
        </div>
      ) : avaliadores.length === 0 ? (
        <div className="alert alert-err" style={{ textAlign: 'center' }}>
          Nenhum avaliador cadastrado na edição ativa ({edicaoPS.codigo}). Configure no Painel Admin.
        </div>
      ) : (
        <div className="list-grid">
          {avaliadores.map((nome) => (
            <button
              key={nome}
              className="btn-primary"
              onClick={() => router.push('/grupos?avaliador=' + encodeURIComponent(nome))}
            >
              <div className="avatar-initials">{getInitials(nome)}</div>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {nome}
              </span>
              <span style={{ color: 'var(--text-light)', fontSize: 13 }}>→</span>
            </button>
          ))}
        </div>
      )}

      <div className="divider" />

      {/* Seção Trainee */}
      <div style={{
        background: edicaoTrainee
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'var(--surface-subtle)',
        border: edicaoTrainee ? 'none' : '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        color: edicaoTrainee ? '#ffffff' : 'var(--text-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 24
      }}>
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.6,
            color: edicaoTrainee ? '#f43f5e' : 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 2
          }}>
            {edicaoTrainee ? `Acompanhamento Trainee (${edicaoTrainee.codigo})` : 'Acompanhamento Trainee (Inativo)'}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {edicaoTrainee ? 'Avaliação Individual de Trainees' : 'Processo Trainee Desativado'}
          </div>
          <div style={{ fontSize: 12, color: edicaoTrainee ? '#94a3b8' : 'var(--text-muted)' }}>
            {edicaoTrainee
              ? 'Avalie o desempenho individual dos novos membros'
              : 'Nenhuma edição de trainee ativa no momento'}
          </div>
        </div>

        {edicaoTrainee ? (
          <button
            onClick={() => router.push('/trainee')}
            className="btn-sm"
            style={{ padding: '9px 16px', fontSize: 13 }}
          >
            Acessar Trainee →
          </button>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: '#e2e8f0', padding: '4px 10px', borderRadius: 99 }}>
            Inativo
          </span>
        )}
      </div>

      {/* Ações e Atalhos */}
      <div className="export-bar">
        <button type="button" onClick={handleAbrirExportar} className="btn-dark" style={{ cursor: 'pointer' }}>
          <span>📊</span> Exportar Excel
        </button>
        <Link href="/dashboard" className="btn-dark">
          <span>📈</span> Dashboard PS
        </Link>
        <Link href="/dashboard-trainee" className="btn-dark">
          <span>🎯</span> Dashboard Trainee
        </Link>
        <Link href="/admin" className="btn-dark">
          <span>⚙️</span> Admin
        </Link>
      </div>

      {/* Modal de Exportação */}
      {modalExportar && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            maxWidth: 440,
            width: '100%',
            padding: 24,
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Exportar Avaliações
              </h2>
              <button
                onClick={() => setModalExportar(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-light)', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Selecione qual processo ativo você deseja exportar em formato Excel (.xlsx):
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {edicaoPS && (
                <a
                  href="/api/exportar?tipo=ps"
                  onClick={() => setModalExportar(false)}
                  className="btn-primary"
                  style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '12px 16px' }}
                >
                  <span style={{ fontSize: 20 }}>📊</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>Processo Seletivo (PS)</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Edição ativa: {edicaoPS.codigo}</div>
                  </div>
                  <span style={{ color: 'var(--text-light)' }}>↓</span>
                </a>
              )}

              {edicaoTrainee && (
                <a
                  href="/api/exportar?tipo=trainee"
                  onClick={() => setModalExportar(false)}
                  className="btn-primary"
                  style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '12px 16px' }}
                >
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>Processo Trainee</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Edição ativa: {edicaoTrainee.codigo}</div>
                  </div>
                  <span style={{ color: 'var(--text-light)' }}>↓</span>
                </a>
              )}

              {edicaoPS && edicaoTrainee && (
                <a
                  href="/api/exportar?tipo=ambos"
                  onClick={() => setModalExportar(false)}
                  className="btn-primary"
                  style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '12px 16px', background: '#f8fafc', borderColor: 'var(--primary)' }}
                >
                  <span style={{ fontSize: 20 }}>📑</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Exportar Ambos</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Planilha com abas de PS e Trainee</div>
                  </div>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>↓</span>
                </a>
              )}
            </div>

            <div style={{ textAlign: 'right', marginTop: 20 }}>
              <button
                className="btn-back"
                style={{ marginBottom: 0 }}
                onClick={() => setModalExportar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
