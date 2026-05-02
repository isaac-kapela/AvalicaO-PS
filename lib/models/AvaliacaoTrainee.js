import mongoose from 'mongoose';

const AvaliacaoTraineeSchema = new mongoose.Schema({
  avaliador:          { type: String, required: true },
  trainee:            { type: String, required: true },
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
  data:               { type: Date, default: Date.now },
});

export default mongoose.models.AvaliacaoTrainee ||
  mongoose.model('AvaliacaoTrainee', AvaliacaoTraineeSchema);
