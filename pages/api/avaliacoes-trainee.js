import { salvarAvaliacaoTrainee, listarAvaliacoesTrainee } from '../../lib/avaliacoes-trainee';
import { getEdicaoAtiva } from '../../lib/edicoes';
import { CRITERIOS } from '../../lib/data';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { avaliador, trainee, observacao, ...notas } = req.body;
      if (!avaliador || !trainee) {
        return res.status(400).json({ error: 'Dados incompletos.' });
      }

      const edicaoAtiva = await getEdicaoAtiva('trainee');
      if (!edicaoAtiva) {
        return res.status(400).json({ error: 'O Processo de Trainee está desativado no momento.' });
      }

      for (const { id } of CRITERIOS) {
        if (notas[id] === undefined || notas[id] === '') {
          return res.status(400).json({ error: `Critério "${id}" não preenchido.` });
        }
      }

      const doc = await salvarAvaliacaoTrainee({
        avaliador,
        trainee,
        observacao: observacao || '',
        edicaoId: edicaoAtiva._id,
        edicao: edicaoAtiva.codigo,
        ...notas,
      });

      return res.status(201).json({ success: true, data: doc });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const docs = await listarAvaliacoesTrainee();
      return res.status(200).json({ success: true, data: docs });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
