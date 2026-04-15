import { useRouter } from 'next/router';
import Head from 'next/head';

const AVALIADORES = [
  'Isaac Kapela', 'Arthur Padilha', 'Bernardo Almeida', 'Breno C',
  'Daniel Alves', 'Enzo Giradi', 'Enzo Freçatti', 'JR', 'Lorena',
  'Maria Clara', 'Mauler', 'Mima', 'Mariana', 'Vitão', 'Elias', 'Isis',
  'Leonardo M', 'Leonardo Prata', 'Luís Fernando', 'Rodolfo',
  'Pedro Breder', 'João Kleber',
];

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Sistema de Avaliação</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="page">
        <header className="header">
          <img src="/logo.png" alt="Logo" className="header-logo" />
          <span className="header-title">Sistema de Avaliação</span>
        </header>

        <main className="content">
          <div className="card">
            <h1 className="card-title">Selecione o avaliador</h1>
            <p className="card-sub">Clique no seu nome para iniciar</p>

            <div className="list-grid">
              {AVALIADORES.map((nome) => (
                <button
                  key={nome}
                  className="btn-primary"
                  onClick={() => router.push('/grupos?avaliador=' + encodeURIComponent(nome))}
                >
                  {nome}
                </button>
              ))}
            </div>

            <div className="export-bar">
              <a href="/api/exportar" className="btn-dark">Exportar Excel</a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
