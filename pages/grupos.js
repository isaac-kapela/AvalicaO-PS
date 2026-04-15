import { useRouter } from 'next/router';
import Head from 'next/head';

const GRUPOS_INFO = [
  { num: 1, membros: ['Raphael Eloi Almeida de Oliveira', 'Gabriel Pereira Berg', 'João Pedro Leal Costa', 'Jean Balbino de Araujo'] },
  { num: 2, membros: ['Bernardo Reis Gayo', 'Arthur Esteves Mateus', 'João Henrique Fayer de Magalhães', 'Kaio Silva Ferreira'] },
  { num: 3, membros: ['Leonardo Duarte Miranda', 'Igor de Paula Bastos', 'Ana Carolina Carvalho da Silva', 'Caík Lazaroni Pereira'] },
  { num: 4, membros: ['Paulo Victor Silva Ramos', 'João Gabriel de Oliveira Miranda', 'João Eduardo Fernandes Mazilão Sampaio de Souza', 'Paulo Machado de Araujo Lopes'] },
  { num: 5, membros: ['Matheus Morais de Carvalho', 'Mateus Albuquerque', 'Sávio Benvindo da Silva', 'Emanuely Mol Duarte'] },
];

export default function GruposPage() {
  const router = useRouter();
  const { avaliador } = router.query;

  return (
    <>
      <Head>
        <title>Escolha o Grupo</title>
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
            <button className="btn-back" onClick={() => router.push('/')}>← Voltar</button>
            <h1 className="card-title">Escolha o Grupo</h1>
            <p className="card-sub">Avaliador: <strong>{avaliador}</strong></p>

            {GRUPOS_INFO.map(({ num, membros }) => (
              <div key={num} className="group-card">
                <div className="group-header">
                  <span className="group-label">
                    <span className="group-number">G{num}</span>
                    Grupo {num}
                  </span>
                  <button
                    className="btn-sm"
                    onClick={() => router.push('/avaliar?avaliador=' + encodeURIComponent(avaliador) + '&grupo=' + num)}
                  >
                    Avaliar
                  </button>
                </div>
                <ul className="members-list">
                  {membros.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
