import dbConnect from './mongodb';
import AvaliacaoTrainee from './models/AvaliacaoTrainee';

export async function salvarAvaliacaoTrainee(dados) {
  await dbConnect();
  return AvaliacaoTrainee.create(dados);
}

export async function listarAvaliacoesTrainee() {
  await dbConnect();
  return AvaliacaoTrainee.find({}).sort({ data: -1 }).lean();
}
