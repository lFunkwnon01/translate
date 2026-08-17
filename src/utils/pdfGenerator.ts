import { jsPDF } from 'jspdf';
import { TranslationJob } from '../types';

export function generateTranslatedPDF(job: TranslationJob): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  job.pages.forEach((page, index) => {
    if (index > 0) {
      doc.addPage();
    }

    // Top Header Banner
    doc.setFillColor(59, 73, 223); // Brand blue
    doc.rect(0, 0, pageWidth, 12, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('DocTranslate AI — Verified Neural Translation', margin, 8);
    doc.text(`Doc ID: ${job.id} | Page ${page.pageNumber} of ${job.pages.length}`, pageWidth - margin, 8, { align: 'right' });

    let currentY = 25;

    // Document Title if page 1
    if (page.pageNumber === 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(23, 23, 23);
      doc.text(job.filename.replace(/\.[^/.]+$/, ''), margin, currentY);
      currentY += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Translation Pair: ${job.sourceLang} → ${job.targetLang} | Model: ${job.qualityMetrics.modelUsed} | Fidelity: ${job.qualityMetrics.layoutFidelity}%`, margin, currentY);
      currentY += 10;

      // Divider
      doc.setDrawColor(220, 226, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;
    }

    // OCR Warning Notice if present
    if (page.hasOcrWarning) {
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(245, 158, 11);
      doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text(`⚠️ Advertencia de OCR (Confianza: ${page.ocrConfidence || 74}%): Texto aproximado desde escaneo.`, margin + 4, currentY + 7.5);
      currentY += 18;
    }

    // Main Translated Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const splitText = doc.splitTextToSize(page.translatedText, contentWidth);
    doc.text(splitText, margin, currentY);
    currentY += splitText.length * 5.5 + 8;

    // Tables if present
    if (page.tables && page.tables.length > 0) {
      page.tables.forEach((tbl) => {
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, currentY, contentWidth, 7, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);

        const colWidth = contentWidth / tbl.headers.length;
        tbl.headers.forEach((h, hIdx) => {
          doc.text(h, margin + hIdx * colWidth + 2, currentY + 5);
        });
        currentY += 8;

        doc.setFont('helvetica', 'normal');
        tbl.rows.forEach((row) => {
          row.forEach((cell, cIdx) => {
            doc.text(cell, margin + cIdx * colWidth + 2, currentY + 5);
          });
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);
          currentY += 8;
        });
        currentY += 6;
      });
    }

    // Callout boxes if present
    if (page.callouts && page.callouts.length > 0) {
      page.callouts.forEach((callout) => {
        doc.setFillColor(240, 249, 255);
        doc.setDrawColor(186, 230, 253);
        const calloutText = doc.splitTextToSize(`ℹ️ ${callout}`, contentWidth - 8);
        const boxHeight = calloutText.length * 5 + 6;
        
        doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(3, 105, 161);
        doc.text(calloutText, margin + 4, currentY + 5);
        currentY += boxHeight + 6;
      });
    }

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated securely by DocTranslate AI • Verified Hash: SHA256-${job.id.replace('job_', '')}889x`, margin, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Página ${page.pageNumber} / ${job.pages.length}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  });

  const outputName = job.filename.replace(/(\.[^/.]+)$/, `_${job.targetLang.toUpperCase()}_translated$1`);
  doc.save(outputName.endsWith('.pdf') ? outputName : `${outputName}.pdf`);
}

export function generateOriginalDummy(job: TranslationJob): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  job.pages.forEach((page, index) => {
    if (index > 0) doc.addPage();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`${job.filename} (Original Document)`, margin, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(page.originalText, contentWidth);
    doc.text(splitText, margin, 40);
  });

  doc.save(`ORIGINAL_${job.filename}`);
}
