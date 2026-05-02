export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  const { pin } = req.body;
  const adminPin = process.env.ADMIN_PIN || '1234';
  if (pin === adminPin) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'PIN incorreto.' });
}
