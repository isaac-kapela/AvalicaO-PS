import dbConnect from '../../lib/mongodb';
import Avaliacao from '../../lib/models/Avaliacao';
import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  await dbConnect();
  try {
    const docs = await Avaliacao.find({}).sort({ data: -1 }).lean();

    const linhas = [];
    for (const doc of docs) {
      const data = new Date(doc.data).toLocaleDateString('pt-BR');
      for (const p of doc.avaliacoes) {
        linhas.push({
          Avaliador: doc.avaliador,
          Grupo: doc.grupo,
          Pessoa: p.nome,
          'Comunicação': p.comunicacao,
          'Trabalho em Equipe': p.trabalhoEquipe,
          'Organização': p.organizacao,
          'Data': data,
        });
      }
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(linhas);
    ws['!cols'] = [
      { wch: 20 }, { wch: 8 }, { wch: 38 },
      { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Avaliações');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="avaliacoes.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
