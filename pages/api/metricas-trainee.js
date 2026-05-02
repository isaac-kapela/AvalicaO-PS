import { listarAvaliacoesTrainee } from '../../lib/avaliacoes-trainee';
import { getEdicaoAtiva } from '../../lib/edicoes';
import { CRITERIOS } from '../../lib/data';

const IDS = CRITERIOS.map((c) => c.id);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const [docs, edicao] = await Promise.all([
      listarAvaliacoesTrainee(),
      getEdicaoAtiva('trainee'),
    ]);

    const candidatos = edicao?.candidatos || [];

    // Acumula notas por candidato
    const acumulado = {};
    for (const doc of docs) {
      if (!acumulado[doc.trainee]) {
        acumulado[doc.trainee] = {};
        for (const id of IDS) acumulado[doc.trainee][id] = [];
      }
      for (const id of IDS) {
        const val = doc[id];
        if (typeof val === 'number') acumulado[doc.trainee][id].push(val);
      }
    }

    // Calcula médias por candidato
    const porCandidato = {};
    for (const [nome, criterios] of Object.entries(acumulado)) {
      porCandidato[nome] = {};
      let somaTotal = 0;
      let contTotal = 0;
      for (const id of IDS) {
        const vals = criterios[id];
        const media = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        porCandidato[nome][id] = media !== null ? parseFloat(media.toFixed(2)) : null;
        if (media !== null) { somaTotal += media; contTotal++; }
      }
      porCandidato[nome].media = contTotal
        ? parseFloat((somaTotal / contTotal).toFixed(2))
        : null;
      porCandidato[nome].totalAvaliacoes = docs.filter((d) => d.trainee === nome).length;
    }

    // Ranking: ordenado por média decrescente
    const ranking = candidatos
      .map((nome) => ({
        nome,
        media: porCandidato[nome]?.media ?? null,
        totalAvaliacoes: porCandidato[nome]?.totalAvaliacoes ?? 0,
      }))
      .sort((a, b) => {
        if (a.media === null && b.media === null) return 0;
        if (a.media === null) return 1;
        if (b.media === null) return -1;
        return b.media - a.media;
      });

    return res.status(200).json({
      porCandidato,
      ranking,
      candidatos,
      totalAvaliacoes: docs.length,
      totalCandidatos: candidatos.length,
      avaliados: Object.keys(porCandidato).length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
