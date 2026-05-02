import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import FormAvaliacaoTrainee from '../components/FormAvaliacaoTrainee';

export default function AvaliarTraineePage() {
  const router = useRouter();
  const { avaliador, trainee } = router.query;

  if (!avaliador || !trainee) {
    return (
      <Layout title="Carregando...">
        <div className="card"><p>Carregando...</p></div>
      </Layout>
    );
  }

  return (
    <Layout title={'Trainee — ' + trainee.split(' ')[0]} subtitle={avaliador}>
      <FormAvaliacaoTrainee avaliador={avaliador} trainee={trainee} />
    </Layout>
  );
}
