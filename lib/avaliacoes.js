import dbConnect from './mongodb';
import Avaliacao from './models/Avaliacao';

export async function salvarAvaliacao({ avaliador, grupo, avaliacoes, observacao }) {
  await dbConnect();
  return Avaliacao.create({
    avaliador,
    grupo: Number(grupo),
    avaliacoes,
    observacao: observacao || '',
  });
}

export async function listarAvaliacoes() {
  await dbConnect();
  return Avaliacao.find({}).sort({ data: -1 }).lean();
}
