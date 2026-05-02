import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import CandidatoList from '../components/CandidatoList';

export default function CandidatosPage() {
  const router = useRouter();
  const { avaliador } = router.query;

  if (!avaliador) {
    return (
      <Layout title="Carregando...">
        <div className="card"><p>Carregando...</p></div>
      </Layout>
    );
  }

  return (
    <Layout title="Escolha o Candidato" subtitle={avaliador}>
      <CandidatoList avaliador={avaliador} />
    </Layout>
  );
}
