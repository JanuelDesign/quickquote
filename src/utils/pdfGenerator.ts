import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation, AppSettings, Language } from '../types';
import { formatCurrency } from './calculations';

// Create a high-res QuickSurfaces logo Data URI on canvas for PDF embedding
export function generateLogoDataUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw circle badge
  const cx = 70;
  const cy = 70;
  const r = 48;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#1A1A1A';
  ctx.stroke();

  // Draw 3 orange floor planks inside circle
  ctx.fillStyle = '#FF8407';
  
  // Center plank
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 26);
  ctx.lineTo(cx + 8, cy - 26);
  ctx.lineTo(cx + 12, cy + 28);
  ctx.lineTo(cx - 12, cy + 28);
  ctx.closePath();
  ctx.fill();

  // Left plank
  ctx.beginPath();
  ctx.moveTo(cx - 24, cy - 12);
  ctx.lineTo(cx - 12, cy - 20);
  ctx.lineTo(cx - 16, cy + 28);
  ctx.lineTo(cx - 30, cy + 28);
  ctx.closePath();
  ctx.fill();

  // Right plank
  ctx.beginPath();
  ctx.moveTo(cx + 12, cy - 20);
  ctx.lineTo(cx + 24, cy - 12);
  ctx.lineTo(cx + 30, cy + 28);
  ctx.lineTo(cx + 16, cy + 28);
  ctx.closePath();
  ctx.fill();

  // Text: QuickSurfaces
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 54px Poppins, sans-serif, Arial';
  ctx.fillText('Quick', 140, 75);
  
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText('Surfaces', 290, 75);

  // Subtitle: LUXURY VINYL FLOORING
  ctx.fillStyle = '#FF8407';
  ctx.font = 'bold 20px Poppins, sans-serif, Arial';
  ctx.fillText('L U X U R Y   V I N Y L   F L O O R I N G', 142, 110);

  return canvas.toDataURL('image/png');
}

export function generateQuotePDF(quote: Quotation, settings: AppSettings, lang: Language = 'en'): jsPDF {
  const isEn = lang === 'en';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Add logo
  const logoData = generateLogoDataUrl();
  if (logoData) {
    doc.addImage(logoData, 'PNG', margin, 12, 65, 15);
  }

  // Header Right: Quote Title & Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 26);
  doc.text(isEn ? 'QUOTATION' : 'COTIZACIÓN', pageWidth - margin, 18, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`No. ${quote.quoteNumber}`, pageWidth - margin, 24, { align: 'right' });
  doc.text(`${isEn ? 'Date:' : 'Fecha:'} ${quote.date}`, pageWidth - margin, 29, { align: 'right' });
  doc.text(`${isEn ? 'Valid Until:' : 'Válido hasta:'} ${quote.validUntil} (${quote.validDays} ${isEn ? 'days' : 'días'})`, pageWidth - margin, 34, { align: 'right' });

  // Divider line
  doc.setDrawColor(255, 132, 7); // Brand orange
  doc.setLineWidth(0.8);
  doc.line(margin, 40, pageWidth - margin, 40);

  // Info Grid: Client & Company
  // Left: Client info box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, 44, (pageWidth - margin * 2) / 2 - 3, 30, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 132, 7);
  doc.text(isEn ? 'CLIENT INFORMATION' : 'DATOS DEL CLIENTE', margin + 4, 50);

  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text(quote.client.name || (isEn ? 'Private Client' : 'Cliente Particular'), margin + 4, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  if (quote.client.phone) {
    doc.text(`${isEn ? 'Phone:' : 'Teléfono:'} ${quote.client.phone}`, margin + 4, 61);
  }
  if (quote.client.email) {
    doc.text(`Email: ${quote.client.email}`, margin + 4, 66);
  }
  if (quote.client.address) {
    doc.text(`${isEn ? 'Address:' : 'Dirección:'} ${quote.client.address}`, margin + 4, 71);
  }

  // Right: QuickSurfaces / Salesperson info box
  const rightBoxX = margin + (pageWidth - margin * 2) / 2 + 3;
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(rightBoxX, 44, (pageWidth - margin * 2) / 2 - 3, 30, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 132, 7);
  doc.text(isEn ? 'ISSUER & SALES CONSULTANT' : 'EMISOR & ASESOR COMERCIAL', rightBoxX + 4, 50);

  doc.setFontSize(9.5);
  doc.setTextColor(26, 26, 26);
  doc.text('QuickSurfaces Miami', rightBoxX + 4, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(settings.companyAddress, rightBoxX + 4, 61);
  doc.text(`${isEn ? 'Consultant:' : 'Asesor:'} ${quote.salespersonName || settings.salespersonName} | Tel: ${quote.salespersonPhone || settings.salespersonPhone}`, rightBoxX + 4, 66);
  doc.text(`Email: ${settings.companyEmail}`, rightBoxX + 4, 71);

  // Table of Products & Services
  const tableRows = quote.items.map((item, index) => {
    let desc = item.productName;
    if (item.thickness) desc += ` (${item.thickness})`;
    if (item.color) desc += `\nColor: ${item.color.code} - ${item.color.name}`;
    if (item.stepIncludesRiser) desc += isEn ? `\nIncludes: Step + Matching Flush Riser` : `\nIncluye: Peldaño + Contrahuella (Riser)`;
    if (item.notes) desc += isEn ? `\nNote: ${item.notes}` : `\nNota: ${item.notes}`;

    let qtyText = `${item.userEnteredQuantity} ${item.quantityUnitLabel}`;
    if (item.calculatedUnitsLabel) {
      qtyText += `\n➔ ${item.calculatedUnitsLabel}`;
    }

    const priceText = formatCurrency(item.unitPrice);
    const subtotalText = formatCurrency(item.subtotal);

    return [
      (index + 1).toString(),
      desc,
      qtyText,
      priceText,
      subtotalText
    ];
  });

  const tableHead = isEn 
    ? [['#', 'Product / Service Description', 'Quantity & Dispatch Specs', 'Unit Price', 'Subtotal']]
    : [['#', 'Descripción del Producto / Servicio', 'Cantidad Solicitada & Despacho', 'Precio Unit.', 'Subtotal']];

  autoTable(doc, {
    startY: 78,
    head: tableHead,
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 55 },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      textColor: [40, 40, 40]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: margin, right: margin }
  });

  // Calculate position after table
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  let finalY = doc.lastAutoTable.finalY + 6;

  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  // Summary Totals Card on the right
  const summaryWidth = 95;
  const summaryX = pageWidth - margin - summaryWidth;

  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(summaryX, finalY, summaryWidth, quote.installationTotal > 0 || quote.includeDelivery ? 48 : 38, 2, 2, 'FD');

  let currentTotalY = finalY + 6;
  doc.setFontSize(8.5);

  // Subtotal Productos
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(isEn ? 'Products Subtotal (Taxable):' : 'Subtotal Materiales (Gravable):', summaryX + 4, currentTotalY);
  doc.setTextColor(26, 26, 26);
  doc.text(formatCurrency(quote.subtotalProducts), pageWidth - margin - 4, currentTotalY, { align: 'right' });

  // Delivery (Taxable with products)
  if (quote.includeDelivery) {
    currentTotalY += 6;
    doc.setTextColor(80, 80, 80);
    doc.text(isEn ? 'Delivery Fee (Taxable):' : 'Delivery Fijo (Gravable):', summaryX + 4, currentTotalY);
    doc.setTextColor(26, 26, 26);
    doc.text(formatCurrency(quote.deliveryCost), pageWidth - margin - 4, currentTotalY, { align: 'right' });
  }

  // Sales Tax 7% (on Products + Delivery)
  currentTotalY += 6;
  doc.setTextColor(80, 80, 80);
  doc.text(isEn ? `FL Sales Tax (7%):` : `Impuesto Sales Tax (7%):`, summaryX + 4, currentTotalY);
  doc.setTextColor(26, 26, 26);
  doc.text(formatCurrency(quote.taxAmount), pageWidth - margin - 4, currentTotalY, { align: 'right' });

  // Installation (Labor / Tax Exempt)
  if (quote.installationTotal > 0) {
    currentTotalY += 6;
    doc.setTextColor(80, 80, 80);
    doc.text(isEn ? 'Labor / Services (Tax Exempt):' : 'Instalación / Servicios (Exento):', summaryX + 4, currentTotalY);
    doc.setTextColor(26, 26, 26);
    doc.text(formatCurrency(quote.installationTotal), pageWidth - margin - 4, currentTotalY, { align: 'right' });
  }

  // Total Line
  currentTotalY += 7;
  doc.setDrawColor(255, 132, 7);
  doc.line(summaryX + 4, currentTotalY - 2, pageWidth - margin - 4, currentTotalY - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 132, 7);
  doc.text(isEn ? 'TOTAL ESTIMATE:' : 'TOTAL:', summaryX + 4, currentTotalY + 3);
  doc.setTextColor(26, 26, 26);
  doc.text(formatCurrency(quote.total), pageWidth - margin - 4, currentTotalY + 3, { align: 'right' });

  // Left Side Notes & Legal Warning Box
  const leftBoxWidth = summaryX - margin - 6;
  doc.setFillColor(255, 244, 230); // Soft orange tint
  doc.setDrawColor(255, 200, 140);
  doc.roundedRect(margin, finalY, leftBoxWidth, quote.installationTotal > 0 || quote.includeDelivery ? 48 : 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(224, 115, 0); // Dark orange
  doc.text(isEn ? 'TERMS & CONDITIONS' : 'TÉRMINOS Y CONDICIONES DEL ESTIMADO', margin + 4, finalY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);
  
  const legalText = isEn
    ? `This is a reference estimate. Prices and inventory are subject to change without prior notice. Valid for ${quote.validDays} days from date of issue (${quote.validUntil}).\n\nBox and strip calculations include standard yield adjustments. Demolition, leveling and installation are excluded unless itemized.`
    : `Este es un estimado referencial. Los precios están sujetos a cambio sin previo aviso. Válido por ${quote.validDays} días a partir de la fecha de emisión (${quote.validUntil}).\n\nEl cálculo de cajas y tiras incluye el ajuste por rendimiento estándar. No incluye desinstalación o nivelación de piso a menos que se especifique expresamente.`;
  
  const splitLegal = doc.splitTextToSize(legalText, leftBoxWidth - 8);
  doc.text(splitLegal, margin + 4, finalY + 11);

  // Footer on bottom of page
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text('QuickSurfaces — Luxury Flooring & Surfaces | Miami, FL | www.quicksurfaces.com', margin, footerY);
  doc.text(isEn ? 'Page 1 of 1' : 'Página 1 de 1', pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

export function generateWhatsAppMessage(quote: Quotation, lang: Language = 'en'): string {
  const isEn = lang === 'en';

  let message = `*QUICKSURFACES ${isEn ? 'QUOTATION' : 'COTIZACIÓN'}*\n`;
  message += `📄 ${isEn ? 'Quote' : 'Cotización'}: *#${quote.quoteNumber}*\n`;
  message += `👤 ${isEn ? 'Client' : 'Cliente'}: *${quote.client.name}*\n`;
  message += `📅 ${isEn ? 'Date' : 'Fecha'}: ${quote.date} (${isEn ? `Valid for ${quote.validDays} days` : `Válido por ${quote.validDays} días`})\n\n`;
  
  message += `*${isEn ? 'ITEMIZED BREAKDOWN:' : 'DETALLE DE PRODUCTOS:'}*\n`;
  quote.items.forEach((item) => {
    message += `▪️ *${item.productName}*`;
    if (item.color) message += ` (${item.color.name})`;
    message += `\n   ${item.calculatedUnitsLabel} | ${formatCurrency(item.subtotal)}\n`;
  });

  message += `\n*${isEn ? 'FINANCIAL SUMMARY:' : 'RESUMEN:'}*\n`;
  message += `▫️ ${isEn ? 'Products Subtotal' : 'Subtotal Materiales'}: ${formatCurrency(quote.subtotalProducts)}\n`;
  if (quote.includeDelivery) {
    message += `▫️ ${isEn ? 'Delivery (Taxable)' : 'Delivery Fijo'}: ${formatCurrency(quote.deliveryCost)}\n`;
  }
  message += `▫️ ${isEn ? 'FL Sales Tax (7%)' : 'Impuesto (7%)'}: ${formatCurrency(quote.taxAmount)}\n`;
  if (quote.installationTotal > 0) {
    message += `▫️ ${isEn ? 'Labor / Services' : 'Instalación/Servicios'}: ${formatCurrency(quote.installationTotal)}\n`;
  }
  message += `\n💰 *TOTAL: ${formatCurrency(quote.total)}*\n\n`;
  message += `⚠️ _${isEn ? `Reference estimate valid until ${quote.validUntil}.` : `Estimado referencial sujeto a cambio sin previo aviso. Válido hasta ${quote.validUntil}.`}_\n`;
  message += isEn ? `Thank you for choosing QuickSurfaces!` : `¡Gracias por preferir QuickSurfaces!`;

  return message;
}

export function openWhatsAppShare(quote: Quotation, phoneNumber?: string, lang: Language = 'en'): void {
  const message = generateWhatsAppMessage(quote, lang);
  const encoded = encodeURIComponent(message);
  
  // Clean phone number (digits only)
  const cleanPhone = (phoneNumber || quote.client.phone || '').replace(/\D/g, '');
  
  let url = `https://wa.me/?text=${encoded}`;
  if (cleanPhone.length >= 10) {
    const finalPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
    url = `https://wa.me/${finalPhone}?text=${encoded}`;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
