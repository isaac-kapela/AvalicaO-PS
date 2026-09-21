import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ title, subtitle, children }) {
  return (
    <>
      <Head>
        <title>{title ? `${title} | Microraptor` : 'Sistema de Avaliação | Microraptor'}</title>
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="page">
        <header className="header">
          <Link href="/" className="header-brand-link">
            <img src="/logo.png" alt="Logo Microraptor" className="header-logo" />
            <div className="header-title-wrap">
              <span className="header-title">Microraptor Avaliações</span>
            </div>
          </Link>
          {subtitle && <span className="header-subtitle">{subtitle}</span>}
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </>
  );
}
