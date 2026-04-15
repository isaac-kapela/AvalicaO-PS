import mongoose from 'mongoose';

const AvaliacaoPessoaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  comunicacao: { type: Number, required: true, min: 0, max: 10 },
  trabalhoEquipe: { type: Number, required: true, min: 0, max: 10 },
  organizacao: { type: Number, required: true, min: 0, max: 10 },
}, { _id: false });

const AvaliacaoSchema = new mongoose.Schema({
  avaliador: { type: String, required: true },
  grupo: { type: Number, required: true },
  avaliacoes: { type: [AvaliacaoPessoaSchema], required: true },
  observacao: { type: String, default: '' },

});

export default mongoose.models.Avaliacao || mongoose.model('Avaliacao', AvaliacaoSchema);
