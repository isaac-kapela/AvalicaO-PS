import { salvarAvaliacao, listarAvaliacoes } from '../../lib/avaliacoes';
import { getEdicaoAtiva } from '../../lib/edicoes';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { avaliador, grupo, avaliacoes, observacao } = req.body;
      if (!avaliador || !grupo || !avaliacoes?.length) {
        return res.status(400).json({ error: 'Dados incompletos.' });
      }

      const edicaoAtiva = await getEdicaoAtiva('ps');
      if (!edicaoAtiva) {
        return res.status(400).json({ error: 'O Processo Seletivo está desativado no momento.' });
      }

      const doc = await salvarAvaliacao({
        avaliador,
        grupo,
        avaliacoes,
        observacao,
        edicaoId: edicaoAtiva._id,
        edicao: edicaoAtiva.codigo,
      });

      return res.status(201).json({ success: true, data: doc });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const docs = await listarAvaliacoes();
      return res.status(200).json({ success: true, data: docs });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
