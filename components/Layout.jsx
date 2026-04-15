import Head from 'next/head';

export default function Layout({ title, subtitle, children }) {
  return (
    <>
      <Head>
        <title>{title || 'Sistema de Avaliação'}</title>
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="page">
        <header className="header">
          <img src="/logo.png" alt="Logo" className="header-logo" />
          <span className="header-title">Sistema de Avaliação</span>
          {subtitle && <span className="header-subtitle">{subtitle}</span>}
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </>
  );
}
