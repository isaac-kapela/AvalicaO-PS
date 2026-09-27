import dbConnect from './mongodb';
import Avaliacao from './models/Avaliacao';

export async function salvarAvaliacao({ avaliador, grupo, avaliacoes, observacao, edicaoId, edicao }) {
  await dbConnect();
  return Avaliacao.create({
    avaliador,
    grupo: Number(grupo),
    avaliacoes,
    observacao: observacao || '',
    edicaoId: edicaoId || null,
    edicao: edicao || null,
  });
}

export async function listarAvaliacoes(filtro = {}) {
  await dbConnect();
  return Avaliacao.find(filtro).sort({ data: -1 }).lean();
}
