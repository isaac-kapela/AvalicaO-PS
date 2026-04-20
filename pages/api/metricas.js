import { listarAvaliacoes } from '../../lib/avaliacoes';
import { GRUPOS, CRITERIOS } from '../../lib/data';

// Lista dos IDs dos 10 critérios de avaliação
const IDS = CRITERIOS.map((c) => c.id);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    // Busca todos os documentos de avaliação salvos no banco
    const docs = await listarAvaliacoes();

    // Acumula as notas recebidas por cada membro em cada critério.
    // Estrutura: { [nomeMembro]: { [criterio]: [nota1, nota2, ...] } }
    // Cada avaliador que avaliou o grupo contribui com uma nota por critério.
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

    // Calcula as médias por membro.
    // Para cada critério: média = soma de todas as notas recebidas ÷ quantidade de avaliadores.
    // Média geral do membro: soma das médias dos 10 critérios ÷ 10.
    const porMembro = {};
    for (const [nome, criterios] of Object.entries(acumulado)) {
      porMembro[nome] = {};
      let somaTotal = 0;
      let contTotal = 0;
      for (const id of IDS) {
        const vals = criterios[id];
        const media = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        porMembro[nome][id] = media !== null ? parseFloat(media.toFixed(2)) : null;
        // Acumula para calcular a média geral (só conta critérios com ao menos uma nota)
        if (media !== null) { somaTotal += media; contTotal++; }
      }
      // Média geral = soma das médias dos critérios avaliados ÷ quantidade de critérios avaliados
      porMembro[nome].media = contTotal ? parseFloat((somaTotal / contTotal).toFixed(2)) : null;
    }

    // Calcula as médias por grupo.
    // Para cada critério do grupo: média das médias individuais dos membros do grupo.
    // Média geral do grupo: média das médias gerais dos membros do grupo.
    const porGrupo = {};
    for (const [gNum, membros] of Object.entries(GRUPOS)) {
      const grupoAcc = {};
      for (const id of IDS) grupoAcc[id] = [];
      let somaTotal = 0;
      let contTotal = 0;

      for (const membro of membros) {
        // Ignora membros que ainda não foram avaliados
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
        // Média do critério no grupo = soma das médias dos membros ÷ membros avaliados
        porGrupo[gNum][id] = vals.length
          ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
          : null;
      }
      // Média geral do grupo = soma das médias gerais dos membros ÷ membros avaliados
      porGrupo[gNum].media = contTotal
        ? parseFloat((somaTotal / contTotal).toFixed(2))
        : null;
    }

    // Ranking geral: lista de todos os membros avaliados, ordenada por média geral decrescente.
    // Membros sem nenhuma avaliação (media === null) são excluídos.
    const ranking = Object.entries(porMembro)
      .map(([nome, dados]) => {
        const grupo = Object.entries(GRUPOS).find(([, membros]) => membros.includes(nome))?.[0];
        return { nome, grupo: grupo ? Number(grupo) : null, media: dados.media };
      })
      .filter((r) => r.media !== null)
      .sort((a, b) => b.media - a.media);

    // Total de avaliações enviadas (cada doc = um avaliador avaliando um grupo)
    const avaliadoresQueEnviaram = new Set(docs.map((d) => d.avaliador));

    return res.status(200).json({
      porMembro,
      porGrupo,
      ranking,
      totalAvaliacoes: docs.length,
      avaliadores: avaliadoresQueEnviaram.size,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
