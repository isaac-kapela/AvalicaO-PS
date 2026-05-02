import mongoose from 'mongoose';

const EdicaoSchema = new mongoose.Schema({
  codigo:     { type: String, required: true },           // "2026.1"
  tipo:       { type: String, enum: ['ps', 'trainee'], required: true },
  ativo:      { type: Boolean, default: false },
  avaliadores:{ type: [String], default: [] },
  grupos:     { type: Map, of: [String], default: {} },   // só PS: { "1": [...], "2": [...] }
  candidatos: { type: [String], default: [] },            // só Trainee
  criadoEm:   { type: Date, default: Date.now },
});

export default mongoose.models.Edicao || mongoose.model('Edicao', EdicaoSchema);
