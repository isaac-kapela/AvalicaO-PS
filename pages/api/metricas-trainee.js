import { listarAvaliacoesTrainee } from '../../lib/avaliacoes-trainee';
import { getEdicaoAtiva } from '../../lib/edicoes';
import { CRITERIOS } from '../../lib/data';

const IDS = CRITERIOS.map((c) => c.id);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const edicao = await getEdicaoAtiva('trainee');

    if (!edicao) {
      return res.status(200).json({
        ativo: false,
        edicao: null,
        porCandidato: {},
        ranking: [],
        candidatos: [],
        totalAvaliacoes: 0,
        totalCandidatos: 0,
        avaliados: 0,
      });
    }

    const candidatos = edicao.candidatos || [];
    const candidatosAtivos = new Set(candidatos);

    // Busca avaliações e filtra pela edição ativa
    const allDocs = await listarAvaliacoesTrainee();
    const docs = allDocs.filter((doc) => {
      if (doc.edicaoId && edicao._id) {
        return doc.edicaoId.toString() === edicao._id.toString();
      }
      if (doc.edicao) {
        return doc.edicao === edicao.codigo;
      }
      return candidatosAtivos.has(doc.trainee);
    });

    // Acumula notas por candidato da edição ativa
    const acumulado = {};
    for (const c of candidatos) {
      acumulado[c] = {};
      for (const id of IDS) acumulado[c][id] = [];
    }

    for (const doc of docs) {
      if (candidatosAtivos.has(doc.trainee)) {
        for (const id of IDS) {
          const val = doc[id];
          if (typeof val === 'number') acumulado[doc.trainee][id].push(val);
        }
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

    // Ranking estrito da edição ativa
    const ranking = candidatos
      .map((nome) => ({
        nome,
        media: porCandidato[nome]?.media ?? null,
        totalAvaliacoes: porCandidato[nome]?.totalAvaliacoes ?? 0,
      }))
      .filter((r) => r.media !== null)
      .sort((a, b) => b.media - a.media);

    return res.status(200).json({
      ativo: true,
      edicao: { codigo: edicao.codigo, id: edicao._id },
      porCandidato,
      ranking,
      candidatos,
      totalAvaliacoes: docs.length,
      totalCandidatos: candidatos.length,
      avaliados: ranking.length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
