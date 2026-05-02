import { getEdicaoAtiva } from '../../lib/edicoes';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  const { tipo } = req.query;
  if (!tipo || !['ps', 'trainee'].includes(tipo)) {
    return res.status(400).json({ error: 'Parâmetro tipo inválido. Use ps ou trainee.' });
  }
  try {
    const edicao = await getEdicaoAtiva(tipo);
    if (!edicao) {
      return res.status(404).json({ error: 'Nenhuma edição ativa encontrada.' });
    }
    // Converte Map (grupos) para objeto simples quando serializado
    const data = {
      _id: edicao._id,
      codigo: edicao.codigo,
      tipo: edicao.tipo,
      avaliadores: edicao.avaliadores,
      grupos: edicao.grupos
        ? Object.fromEntries(
            Object.entries(edicao.grupos).map(([k, v]) => [k, v])
          )
        : {},
      candidatos: edicao.candidatos || [],
    };
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
