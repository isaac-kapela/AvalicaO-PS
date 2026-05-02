import { listarEdicoes, criarEdicao } from '../../../lib/edicoes';

function verificarPin(req) {
  const pin = req.headers['x-admin-pin'];
  return pin === (process.env.ADMIN_PIN || '1234');
}

export default async function handler(req, res) {
  if (!verificarPin(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (req.method === 'GET') {
    try {
      const edicoes = await listarEdicoes();
      return res.status(200).json({ success: true, data: edicoes });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { codigo, tipo } = req.body;
      if (!codigo || !tipo) return res.status(400).json({ error: 'Código e tipo são obrigatórios.' });
      const edicao = await criarEdicao({ codigo, tipo });
      return res.status(201).json({ success: true, data: edicao });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
