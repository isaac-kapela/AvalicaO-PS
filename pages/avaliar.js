import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import FormAvaliacao from '../components/FormAvaliacao';

export default function AvaliarPage() {
  const router = useRouter();
  const { avaliador, grupo } = router.query;

  if (!avaliador || !grupo) {
    return <Layout title="Carregando..."><div className="card"><p>Carregando...</p></div></Layout>;
  }

  return (
    <Layout title={'Avaliação — Grupo ' + grupo} subtitle={avaliador}>
      <FormAvaliacao avaliador={avaliador} grupo={grupo} />
    </Layout>
  );
}
