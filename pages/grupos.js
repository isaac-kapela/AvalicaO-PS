import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import GrupoList from '../components/GrupoList';

export default function GruposPage() {
  const router = useRouter();
  const { avaliador } = router.query;

  return (
    <Layout title="Escolha o Grupo" subtitle={avaliador}>
      <GrupoList avaliador={avaliador} />
    </Layout>
  );
}
