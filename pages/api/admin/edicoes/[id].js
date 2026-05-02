import { atualizarEdicao, ativarEdicao, deletarEdicao } from '../../../../lib/edicoes';

function verificarPin(req) {
  const pin = req.headers['x-admin-pin'];
  return pin === (process.env.ADMIN_PIN || '1234');
}

export default async function handler(req, res) {
  if (!verificarPin(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { ativar, ...campos } = req.body;
      let doc;
      if (ativar) {
        if (!campos.tipo) return res.status(400).json({ error: 'Tipo necessário para ativar.' });
        doc = await ativarEdicao(id, campos.tipo);
      } else {
        doc = await atualizarEdicao(id, campos);
      }
      if (!doc) return res.status(404).json({ error: 'Edição não encontrada.' });
      return res.status(200).json({ success: true, data: doc });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deletarEdicao(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
