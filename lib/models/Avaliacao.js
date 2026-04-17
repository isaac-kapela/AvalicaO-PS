import mongoose from 'mongoose';

const AvaliacaoPessoaSchema = new mongoose.Schema({
  nome:               { type: String, required: true },
  proatividade:       { type: Number, required: true, min: 0, max: 4 },
  lideranca:          { type: Number, required: true, min: 0, max: 4 },
  escutaAtiva:        { type: Number, required: true, min: 0, max: 4 },
  iniciativa:         { type: Number, required: true, min: 0, max: 4 },
  trabalhoEquipe:     { type: Number, required: true, min: 0, max: 4 },
  comunicacao:        { type: Number, required: true, min: 0, max: 4 },
  resolucaoProblemas: { type: Number, required: true, min: 0, max: 4 },
  adaptabilidade:     { type: Number, required: true, min: 0, max: 4 },
  engajamento:        { type: Number, required: true, min: 0, max: 4 },
  organizacao:        { type: Number, required: true, min: 0, max: 4 },
  observacao:         { type: String, default: '' },
}, { _id: false });

const AvaliacaoSchema = new mongoose.Schema({
  avaliador: { type: String, required: true },
  grupo: { type: Number, required: true },
  avaliacoes: { type: [AvaliacaoPessoaSchema], required: true },
  observacao: { type: String, default: '' },

});

export default mongoose.models.Avaliacao || mongoose.model('Avaliacao', AvaliacaoSchema);
