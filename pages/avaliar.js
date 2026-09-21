import Layout from '../components/Layout';
import FormAvaliacao from '../components/FormAvaliacao';
import { getEdicaoAtiva } from '../lib/edicoes';

export async function getServerSideProps(context) {
  const { avaliador, grupo } = context.query;
  if (!avaliador || !grupo) {
    return { props: { avaliador: null, grupo: null, membros: [], edicaoAtiva: false } };
  }
  try {
    const edicao = await getEdicaoAtiva('ps');
    if (!edicao) {
      return { props: { avaliador, grupo, membros: [], edicaoAtiva: false } };
    }
    const gruposObj = edicao?.grupos
      ? Object.fromEntries(Object.entries(edicao.grupos))
      : {};
    const membros = gruposObj[grupo] || [];
    return { props: { avaliador, grupo, membros, edicaoAtiva: true } };
  } catch {
    return { props: { avaliador, grupo, membros: [], edicaoAtiva: false } };
  }
}

export default function AvaliarPage({ avaliador, grupo, membros, edicaoAtiva }) {
  if (!avaliador || !grupo) {
    return <Layout title="Carregando..."><div className="card"><p>Carregando...</p></div></Layout>;
  }

  if (!edicaoAtiva) {
    return (
      <Layout title="Processo Desativado">
        <div className="card">
          <div className="alert alert-err" style={{ textAlign: 'center' }}>
            O Processo Seletivo está desativado no momento. Ative uma edição no painel administrativo.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={'Avaliação — Grupo ' + grupo} subtitle={avaliador}>
      <FormAvaliacao avaliador={avaliador} grupo={grupo} membros={membros} />
    </Layout>
  );
}
