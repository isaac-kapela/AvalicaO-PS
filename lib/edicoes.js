import dbConnect from './mongodb';
import Edicao from './models/Edicao';
import { AVALIADORES, GRUPOS, TRAINEES } from './data';

async function seedEdicoesPadrao() {
  await Edicao.create([
    {
      codigo: '2026.1',
      tipo: 'ps',
      ativo: true,
      avaliadores: AVALIADORES,
      grupos: Object.fromEntries(
        Object.entries(GRUPOS).map(([k, v]) => [k, v])
      ),
      candidatos: [],
    },
    {
      codigo: '2026.1',
      tipo: 'trainee',
      ativo: true,
      avaliadores: AVALIADORES,
      grupos: {},
      candidatos: TRAINEES,
    },
  ]);
}

export async function getEdicaoAtiva(tipo) {
  await dbConnect();
  const total = await Edicao.countDocuments({ tipo });
  if (total === 0) await seedEdicoesPadrao();
  return Edicao.findOne({ tipo, ativo: true }).lean();
}

export async function listarEdicoes() {
  await dbConnect();
  return Edicao.find({}).sort({ criadoEm: -1 }).lean();
}

export async function criarEdicao({ codigo, tipo }) {
  await dbConnect();
  return Edicao.create({ codigo, tipo, ativo: false, avaliadores: [], grupos: {}, candidatos: [] });
}

export async function atualizarEdicao(id, dados) {
  await dbConnect();
  return Edicao.findByIdAndUpdate(id, dados, { new: true }).lean();
}

export async function ativarEdicao(id, tipo) {
  await dbConnect();
  await Edicao.updateMany({ tipo }, { ativo: false });
  return Edicao.findByIdAndUpdate(id, { ativo: true }, { new: true }).lean();
}

export async function deletarEdicao(id) {
  await dbConnect();
  return Edicao.findByIdAndDelete(id);
}
