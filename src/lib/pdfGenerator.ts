import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RDO, Obra, Empresa } from '../types';

export async function generateRdoPdf(rdo: RDO, obra?: Obra, empresa?: Empresa): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Colors
  const primaryColor: [number, number, number] = [24, 43, 73]; // Navy Blue
  const secondaryColor: [number, number, number] = [41, 128, 185]; // Steel Blue
  const grayHeader: [number, number, number] = [241, 245, 249];
  const darkTextColor: [number, number, number] = [30, 41, 59];

  // Helper for text formatting
  const addHeader = (pageNum: number) => {
    // Header Bar
    doc.setFillColor(...primaryColor);
    doc.rect(margin, 12, pageWidth - margin * 2, 20, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('RELATÓRIO DIÁRIO DE OBRA (RDO)', margin + 6, 22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(empresa?.nomeFantasia || 'RDO INTELIGENTE - GESTÃO DE OBRAS', margin + 6, 27);

    // Number & Date badge on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`RDO Nº ${String(rdo.numero).padStart(3, '0')}`, pageWidth - margin - 6, 21, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${rdo.data}`, pageWidth - margin - 6, 27, { align: 'right' });
  };

  addHeader(1);

  let currentY = 36;

  // Obra & Responsible technical details block
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { textColor: darkTextColor, fontSize: 8.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 62 },
      2: { fontStyle: 'bold', cellWidth: 32 },
      3: { cellWidth: 'auto' },
    },
    body: [
      ['Obra:', `${obra?.codigo || ''} - ${obra?.nome || rdo.obraNome}`, 'Cliente / Fiscal:', obra?.cliente || 'Não informado'],
      ['Endereço:', obra?.endereco || 'Canteiro de obras', 'Resp. Técnico:', `${rdo.responsavel} ${obra?.creaCau ? `(${obra.creaCau})` : ''}`],
      ['Status Obra:', obra?.status || 'Em Andamento', 'Status do RDO:', rdo.status.toUpperCase()],
      ['Avanço Físico:', `${rdo.percentualAvanco || obra?.percentualAvanco || 0}%`, 'Elaborado por:', rdo.responsavel],
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // Condições Climáticas
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    head: [['CONDIÇÕES CLIMÁTICAS']],
    headStyles: { fillColor: grayHeader, textColor: primaryColor, fontStyle: 'bold', fontSize: 9 },
    body: [
      [
        `Manhã: ${rdo.condicoesClimaticas?.manha || 'Bom'}    |    Tarde: ${rdo.condicoesClimaticas?.tarde || 'Bom'}    |    Noite: ${rdo.condicoesClimaticas?.noite || 'Bom'}`,
      ],
    ],
    bodyStyles: { fontSize: 8.5, textColor: darkTextColor },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // Atividades Executadas e Frentes
  const atividadesRows: string[][] = [];
  if (rdo.etapa) {
    atividadesRows.push(['Etapa da Obra:', rdo.etapa]);
  }
  if (rdo.frenteServico) {
    atividadesRows.push(['Frente de Serviço:', rdo.frenteServico]);
  }
  if (rdo.local) {
    atividadesRows.push(['Local / Ambiente:', rdo.local]);
  } else if (rdo.etapasFrentes && !rdo.etapa && !rdo.frenteServico) {
    atividadesRows.push(['Frentes / Pavimentos:', rdo.etapasFrentes]);
  }

  let servicosTexto = rdo.atividadesExecutadas || '';
  if (rdo.atividadesChecklist && rdo.atividadesChecklist.length > 0) {
    const checklistFormatted = rdo.atividadesChecklist
      .map(
        (it) =>
          `[${it.status || (it.concluida ? 'Concluído' : 'Em Andamento')}] ${it.descricao}${
            it.local ? ` - ${it.local}` : ''
          }`
      )
      .join('\n');
    servicosTexto = checklistFormatted + (servicosTexto ? `\n\n${servicosTexto}` : '');
  }

  atividadesRows.push(['Serviços Realizados:', servicosTexto || 'Nenhuma atividade registrada no dia.']);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['SERVIÇOS E ATIVIDADES EXECUTADAS', '']],
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' },
    },
    body: atividadesRows,
    bodyStyles: { fontSize: 8.5, textColor: darkTextColor, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Mão de Obra
  if (rdo.maoDeObra && rdo.maoDeObra.length > 0) {
    const totalTrabalhadores = rdo.maoDeObra.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0);
    const maoDeObraRows = rdo.maoDeObra.map((item) => [
      item.funcao,
      String(item.quantidade),
      item.empresa || empresa?.nomeFantasia || 'Direta',
    ]);
    maoDeObraRows.push(['TOTAL EFETIVO NO CANTEIRO', String(totalTrabalhadores), '']);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'striped',
      head: [['MÃO DE OBRA / EFETIVO', 'QUANTIDADE', 'EMPRESA / CONTRATADA']],
      headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      body: maoDeObraRows,
      bodyStyles: { fontSize: 8, textColor: darkTextColor },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 60 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // Equipamentos
  if (rdo.equipamentos && rdo.equipamentos.length > 0) {
    const equipRows = rdo.equipamentos.map((item) => [item.nome, String(item.quantidade), item.status || 'Operando']);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'striped',
      head: [['EQUIPAMENTO / MAQUINÁRIO', 'QTD', 'STATUS OPERACIONAL']],
      headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      body: equipRows,
      bodyStyles: { fontSize: 8, textColor: darkTextColor },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 24, halign: 'center' },
        2: { cellWidth: 50 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // Materiais
  if (rdo.materiais && rdo.materiais.length > 0) {
    const matRows = rdo.materiais.map((item) => [item.descricao, item.quantidade, item.tipo]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'striped',
      head: [['MATERIAL / INSUMO', 'QUANTIDADE', 'TIPO']],
      headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      body: matRows,
      bodyStyles: { fontSize: 8, textColor: darkTextColor },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // Ocorrências e Segurança
  const ocorrenciasData: string[][] = [];
  if (rdo.ocorrencias) {
    ocorrenciasData.push(['Ocorrências / Imprevistos:', rdo.ocorrencias]);
  } else {
    ocorrenciasData.push(['Ocorrências / Imprevistos:', 'Sem ocorrências anormais registradas no dia.']);
  }

  if (rdo.seguranca) {
    ocorrenciasData.push(['Segurança do Trabalho:', rdo.seguranca]);
  } else {
    ocorrenciasData.push(['Segurança do Trabalho:', 'DDS realizado. Nenhum acidente registrado.']);
  }

  if (rdo.observacoes) {
    ocorrenciasData.push(['Observações Gerais:', rdo.observacoes]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['OCORRÊNCIAS, SEGURANÇA E OBSERVAÇÕES', '']],
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' },
    },
    body: ocorrenciasData,
    bodyStyles: { fontSize: 8.5, textColor: darkTextColor, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Photographic report
  if (rdo.fotos && rdo.fotos.length > 0) {
    // Add page for photos if space is tight
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(...grayHeader);
    doc.rect(margin, currentY, pageWidth - margin * 2, 7, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('RELATÓRIO FOTOGRÁFICO DE CAMPO', margin + 3, currentY + 5);

    currentY += 10;

    for (let i = 0; i < rdo.fotos.length; i++) {
      const foto = rdo.fotos[i];

      // Check remaining page height
      if (currentY > pageHeight - 55) {
        doc.addPage();
        currentY = 20;
      }

      try {
        // Try drawing image if possible
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, currentY, 65, 45);

        // We can place image data if it's base64 or loaded
        if (foto.url && (foto.url.startsWith('data:image') || foto.url.startsWith('http'))) {
          try {
            doc.addImage(foto.url, 'JPEG', margin, currentY, 65, 45);
          } catch {
            // Fallback placeholder text if external CORS prevents addImage
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.text('[Registro Fotográfico]', margin + 14, currentY + 24);
          }
        }

        // Caption box
        doc.setTextColor(...darkTextColor);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`Foto ${i + 1}: ${foto.dataHora || ''}`, margin + 70, currentY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const splitCaption = doc.splitTextToSize(foto.legenda || 'Sem legenda informada.', pageWidth - margin * 2 - 72);
        doc.text(splitCaption, margin + 70, currentY + 12);

        currentY += 50;
      } catch (e) {
        console.warn('Erro ao inserir foto no PDF:', e);
      }
    }
  }

  // Signatures block
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 30;
  } else {
    currentY = Math.max(currentY + 10, pageHeight - 40);
  }

  // Signature lines
  const sigColWidth = (pageWidth - margin * 2 - 15) / 2;
  const sig1X = margin;
  const sig2X = margin + sigColWidth + 15;

  doc.setDrawColor(100, 116, 139);
  doc.line(sig1X, currentY + 12, sig1X + sigColWidth, currentY + 12);
  doc.line(sig2X, currentY + 12, sig2X + sigColWidth, currentY + 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(rdo.responsavel || 'Responsável Técnico', sig1X + sigColWidth / 2, currentY + 17, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(obra?.creaCau ? `CREA/CAU: ${obra.creaCau}` : 'Engenheiro / Responsável Técnico', sig1X + sigColWidth / 2, currentY + 21, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(obra?.cliente || 'Fiscalização / Contratante', sig2X + sigColWidth / 2, currentY + 17, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Cliente / Fiscal de Obra', sig2X + sigColWidth / 2, currentY + 21, { align: 'center' });

  // Add page numbers at bottom
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `RDO Inteligente • Sistema de Diário de Obra • Página ${i} de ${totalPages} • Emitido em ${new Date().toLocaleDateString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  return doc;
}
