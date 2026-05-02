import { listarAvaliacoes } from '../../lib/avaliacoes';
import { getEdicaoAtiva } from '../../lib/edicoes';
import { CRITERIOS } from '../../lib/data';

const IDS = CRITERIOS.map((c) => c.id);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const [docs, edicao] = await Promise.all([
      listarAvaliacoes(),
      getEdicaoAtiva('ps'),
    ]);

    // Converte grupos do Map/objeto da edição ativa
    const GRUPOS = edicao?.grupos
      ? Object.fromEntries(Object.entries(edicao.grupos))
      : {};

    const acumulado = {};
    for (const doc of docs) {
      for (const av of doc.avaliacoes) {
        if (!acumulado[av.nome]) {
          acumulado[av.nome] = {};
          for (const id of IDS) acumulado[av.nome][id] = [];
        }
        for (const id of IDS) {
          const val = av[id];
          if (typeof val === 'number') {
            acumulado[av.nome][id].push(val);
          }
        }
      }
    }

    const porMembro = {};
    for (const [nome, criterios] of Object.entries(acumulado)) {
      porMembro[nome] = {};
      let somaTotal = 0;
      let contTotal = 0;
      for (const id of IDS) {
        const vals = criterios[id];
        const media = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        porMembro[nome][id] = media !== null ? parseFloat(media.toFixed(2)) : null;
        if (media !== null) { somaTotal += media; contTotal++; }
      }
      porMembro[nome].media = contTotal ? parseFloat((somaTotal / contTotal).toFixed(2)) : null;
    }

    const porGrupo = {};
    for (const [gNum, membros] of Object.entries(GRUPOS)) {
      const grupoAcc = {};
      for (const id of IDS) grupoAcc[id] = [];
      let somaTotal = 0;
      let contTotal = 0;

      for (const membro of membros) {
        if (!porMembro[membro]) continue;
        for (const id of IDS) {
          const v = porMembro[membro][id];
          if (v !== null && v !== undefined) grupoAcc[id].push(v);
        }
        const mediaM = porMembro[membro].media;
        if (mediaM !== null) { somaTotal += mediaM; contTotal++; }
      }

      porGrupo[gNum] = { membros: membros.length };
      for (const id of IDS) {
        const vals = grupoAcc[id];
        porGrupo[gNum][id] = vals.length
          ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
          : null;
      }
      porGrupo[gNum].media = contTotal
        ? parseFloat((somaTotal / contTotal).toFixed(2))
        : null;
    }

    const ranking = Object.entries(porMembro)
      .map(([nome, dados]) => {
        const grupo = Object.entries(GRUPOS).find(([, membros]) => membros.includes(nome))?.[0];
        return { nome, grupo: grupo ? Number(grupo) : null, media: dados.media };
      })
      .filter((r) => r.media !== null)
      .sort((a, b) => b.media - a.media);

    const avaliadoresQueEnviaram = new Set(docs.map((d) => d.avaliador));

    return res.status(200).json({
      porMembro,
      porGrupo,
      ranking,
      grupos: GRUPOS,
      totalAvaliacoes: docs.length,
      avaliadores: avaliadoresQueEnviaram.size,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
