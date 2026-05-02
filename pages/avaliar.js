import Layout from '../components/Layout';
import FormAvaliacao from '../components/FormAvaliacao';
import { getEdicaoAtiva } from '../lib/edicoes';

export async function getServerSideProps(context) {
  const { avaliador, grupo } = context.query;
  if (!avaliador || !grupo) {
    return { props: { avaliador: null, grupo: null, membros: [] } };
  }
  try {
    const edicao = await getEdicaoAtiva('ps');
    const gruposObj = edicao?.grupos
      ? Object.fromEntries(Object.entries(edicao.grupos))
      : {};
    const membros = gruposObj[grupo] || [];
    return { props: { avaliador, grupo, membros } };
  } catch {
    return { props: { avaliador, grupo, membros: [] } };
  }
}

export default function AvaliarPage({ avaliador, grupo, membros }) {
  if (!avaliador || !grupo) {
    return <Layout title="Carregando..."><div className="card"><p>Carregando...</p></div></Layout>;
  }

  return (
    <Layout title={'Avaliação — Grupo ' + grupo} subtitle={avaliador}>
      <FormAvaliacao avaliador={avaliador} grupo={grupo} membros={membros} />
    </Layout>
  );
}
