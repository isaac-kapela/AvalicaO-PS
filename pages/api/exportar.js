import * as XLSX from 'xlsx';
import { listarAvaliacoes } from '../../lib/avaliacoes';
import { listarAvaliacoesTrainee } from '../../lib/avaliacoes-trainee';
import { getEdicaoAtiva } from '../../lib/edicoes';
import { CRITERIOS } from '../../lib/data';

function calcularMedia(obj) {
  const notas = CRITERIOS.map((c) => obj[c.id]).filter((n) => typeof n === 'number');
  if (!notas.length) return null;
  return parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { tipo } = req.query; // 'ps' | 'trainee' | 'ambos'

  try {
    const [edicaoPS, edicaoTrainee] = await Promise.all([
      getEdicaoAtiva('ps'),
      getEdicaoAtiva('trainee'),
    ]);

    const wb = XLSX.utils.book_new();
    let temConteudo = false;

    // Exportar Processo Seletivo (se solicitado e ativo)
    if ((!tipo || tipo === 'ps' || tipo === 'ambos') && edicaoPS) {
      const allDocs = await listarAvaliacoes();
      const membrosPS = new Set(Object.values(edicaoPS.grupos || {}).flat());

      const docs = allDocs.filter((doc) => {
        if (doc.edicaoId && edicaoPS._id) {
          return doc.edicaoId.toString() === edicaoPS._id.toString();
        }
        if (doc.edicao) {
          return doc.edicao === edicaoPS.codigo;
        }
        return doc.avaliacoes?.some((p) => membrosPS.has(p.nome));
      });

      const linhas = [];

      for (const doc of docs) {
        for (const p of doc.avaliacoes || []) {
          if (!membrosPS.has(p.nome) && !doc.edicaoId && !doc.edicao) continue;
          const media = calcularMedia(p);
          linhas.push({
            'Edição': edicaoPS.codigo || 'Ativa',
            'Avaliador': doc.avaliador,
            'Grupo': `Grupo ${doc.grupo}`,
            'Candidato': p.nome,
            'Média Final': media,
            'Proatividade': p.proatividade,
            'Liderança': p.lideranca,
            'Escuta Ativa': p.escutaAtiva,
            'Iniciativa': p.iniciativa,
            'Trabalho em Equipe': p.trabalhoEquipe,
            'Comunicação': p.comunicacao,
            'Resolução de Problemas': p.resolucaoProblemas,
            'Adaptabilidade': p.adaptabilidade,
            'Engajamento': p.engajamento,
            'Organização': p.organizacao,
            'Observação Individual': p.observacao || '',
            'Observação do Grupo': doc.observacao || '',
            'Data': doc.data ? new Date(doc.data).toLocaleString('pt-BR') : '',
          });
        }
      }

      const wsPS = XLSX.utils.json_to_sheet(linhas.length ? linhas : [{ 'Aviso': 'Nenhuma avaliação registrada ainda' }]);
      wsPS['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 30 }, { wch: 12 },
        { wch: 13 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 18 },
        { wch: 14 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 13 },
        { wch: 35 }, { wch: 35 }, { wch: 18 },
      ];
      XLSX.utils.book_append_sheet(wb, wsPS, `PS ${edicaoPS.codigo || 'Ativo'}`);
      temConteudo = true;
    }

    // Exportar Processo Trainee (se solicitado e ativo)
    if ((!tipo || tipo === 'trainee' || tipo === 'ambos') && edicaoTrainee) {
      const allDocsTrainee = await listarAvaliacoesTrainee();
      const candidatosTrainee = new Set(edicaoTrainee.candidatos || []);

      const docsTrainee = allDocsTrainee.filter((doc) => {
        if (doc.edicaoId && edicaoTrainee._id) {
          return doc.edicaoId.toString() === edicaoTrainee._id.toString();
        }
        if (doc.edicao) {
          return doc.edicao === edicaoTrainee.codigo;
        }
        return candidatosTrainee.has(doc.trainee);
      });

      const linhasTrainee = [];

      for (const doc of docsTrainee) {
        const media = calcularMedia(doc);
        linhasTrainee.push({
          'Edição': edicaoTrainee.codigo || 'Ativa',
          'Avaliador': doc.avaliador,
          'Trainee': doc.trainee,
          'Média Final': media,
          'Proatividade': doc.proatividade,
          'Liderança': doc.lideranca,
          'Escuta Ativa': doc.escutaAtiva,
          'Iniciativa': doc.iniciativa,
          'Trabalho em Equipe': doc.trabalhoEquipe,
          'Comunicação': doc.comunicacao,
          'Resolução de Problemas': doc.resolucaoProblemas,
          'Adaptabilidade': doc.adaptabilidade,
          'Engajamento': doc.engajamento,
          'Organização': doc.organizacao,
          'Observações': doc.observacao || '',
          'Data': doc.data ? new Date(doc.data).toLocaleString('pt-BR') : '',
        });
      }

      const wsTrainee = XLSX.utils.json_to_sheet(linhasTrainee.length ? linhasTrainee : [{ 'Aviso': 'Nenhuma avaliação registrada ainda' }]);
      wsTrainee['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 12 },
        { wch: 13 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 18 },
        { wch: 14 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 13 },
        { wch: 35 }, { wch: 18 },
      ];
      XLSX.utils.book_append_sheet(wb, wsTrainee, `Trainee ${edicaoTrainee.codigo || 'Ativo'}`);
      temConteudo = true;
    }

    if (!temConteudo) {
      return res.status(400).json({ error: 'Nenhum processo ativo disponível para exportação.' });
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="avaliacoes-consolidadas.xlsx"');
    return res.status(200).send(buf);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
