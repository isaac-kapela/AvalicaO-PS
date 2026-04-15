import dbConnect from '../../lib/mongodb';
import Avaliacao from '../../lib/models/Avaliacao';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { avaliador, grupo, avaliacoes, observacao } = req.body;
      if (!avaliador || !grupo || !avaliacoes?.length) {
        return res.status(400).json({ error: 'Dados incompletos.' });
      }
      const doc = await Avaliacao.create({ avaliador, grupo: Number(grupo), avaliacoes, observacao: observacao || '' });
      return res.status(201).json({ success: true, data: doc });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const docs = await Avaliacao.find({}).sort({ data: -1 }).lean();
      return res.status(200).json({ success: true, data: docs });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
