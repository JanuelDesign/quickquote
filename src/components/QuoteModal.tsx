import React, { useState } from 'react';
import { Quotation, AppSettings, Language } from '../types';
import { generateQuotePDF, generateWhatsAppMessage } from '../utils/pdfGenerator';
import { formatCurrency, getItemUnitPriceDetail } from '../utils/calculations';
import { translations } from '../utils/translations';
import { QuickSurfacesLogo } from './QuickSurfacesLogo';
import { 
  FileDown, 
  Check, 
  X, 
  Copy, 
  Clock, 
  CreditCard,
  Truck,
  Eye,
  ArrowRight,
  ArrowLeft,
  Share2,
  FileText,
  UserCheck,
  Building,
  Zap,
  Banknote,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quotation;
  settings: AppSettings;
  shippingAddress?: string;
  onUpdateShippingAddress?: (addr: string) => void;
  sameAsBillingAddress?: boolean;
  onToggleSameAsBilling?: (same: boolean) => void;
  onUpdateQuoteDays: (days: number) => void;
  onToggleDelivery?: (include: boolean) => void;
  onTogglePayWithCard?: (payWithCard: boolean) => void;
  onSaveToHistory: () => void;
  language?: Language;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  quote,
  settings,
  shippingAddress = '',
  onUpdateShippingAddress,
  sameAsBillingAddress = true,
  onToggleSameAsBilling,
  onUpdateQuoteDays,
  onToggleDelivery,
  onTogglePayWithCard,
  onSaveToHistory,
  language = 'en'
}) => {
  const currentLang: Language = language === 'es' ? 'es' : 'en';
  const isEn = currentLang === 'en';
  const t = translations[currentLang];

  // Stage 1: Setup options -> Stage 2: Full Document Preview
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedZelle, setCopiedZelle] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const salespersonName = quote.salespersonName || settings.salespersonName;
  const salespersonPhone = quote.salespersonPhone || settings.salespersonPhone;

  // Prepare quote object with latest shipping address
  const quoteWithShipping: Quotation = {
    ...quote,
    shippingAddress: sameAsBillingAddress ? (quote.client.address || '') : (shippingAddress || ''),
    sameAsBillingAddress
  };

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3200);
  };

  // Download PDF with visible green confirmation toast
  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = generateQuotePDF(quoteWithShipping, settings, currentLang);
      const safeClient = (quote.client.name || 'Cliente').replace(/\s+/g, '_');
      doc.save(`QuickSurfaces_${quote.quoteNumber}_${safeClient}.pdf`);

      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.8 }
      });

      onSaveToHistory();

      // Visible confirmation toast
      showToast(
        isEn 
          ? '✓ PDF downloaded — check your Downloads folder' 
          : '✓ PDF descargado — revisa tus Descargas'
      );
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Native Web Share API or Clipboard Fallback
  const handleShare = async () => {
    const summaryText = generateWhatsAppMessage(quoteWithShipping, currentLang);

    if (navigator.share) {
      try {
        // Try sharing with file if possible
        const doc = generateQuotePDF(quoteWithShipping, settings, currentLang);
        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], `QuickSurfaces_${quote.quoteNumber}.pdf`, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            title: `QuickQuote - ${quote.quoteNumber}`,
            text: summaryText,
            files: [pdfFile]
          });
          onSaveToHistory();
          showToast(isEn ? '✓ Shared successfully!' : '✓ ¡Compartido con éxito!');
          return;
        }

        // Standard text share
        await navigator.share({
          title: `QuickQuote - ${quote.quoteNumber}`,
          text: summaryText
        });
        onSaveToHistory();
        showToast(isEn ? '✓ Shared successfully!' : '✓ ¡Compartido con éxito!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled share dialog
        console.warn('Native share failed, copying to clipboard:', err);
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(summaryText);
      onSaveToHistory();
      showToast(isEn ? '✓ Summary copied to clipboard' : '✓ Resumen copiado al portapapeles');
    } catch (clipErr) {
      console.error('Clipboard copy failed:', clipErr);
    }
  };

  const handleCopyZelle = () => {
    navigator.clipboard.writeText('quickzelle@gmail.com');
    setCopiedZelle(true);
    setTimeout(() => setCopiedZelle(false), 2000);
  };

  if (!isOpen) return null;

  // =========================================================================
  // STAGE 2: FULL-SCREEN REAL DOCUMENT PREVIEW
  // =========================================================================
  if (isFullPreviewOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#242424] overflow-y-auto flex flex-col text-[#181818] animate-in fade-in duration-200">
        {/* Floating Success Toast */}
        {successToast && (
          <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-60 bg-emerald-600 text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 border border-emerald-400">
            <Check className="w-5 h-5 text-white shrink-0 stroke-[3]" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Top Control Bar */}
        <header className="sticky top-0 z-40 bg-[#181818]/95 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 shadow-md">
          {/* Back to Options Button */}
          <button
            type="button"
            id="btn-back-to-quote-options"
            onClick={() => setIsFullPreviewOpen(false)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">{isEn ? 'Back to Options' : 'Volver a Opciones'}</span>
            <span className="xs:hidden">{isEn ? 'Back' : 'Volver'}</span>
          </button>

          {/* Title in center */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-black uppercase tracking-wider text-white truncate hidden md:inline">
              {isEn ? 'Official Document Preview' : 'Vista Previa Oficial del Documento'}
            </span>
            <span className="font-mono text-xs font-bold text-[#FF8407] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              #{quote.quoteNumber}
            </span>
          </div>

          {/* The 2 Actions: Descargar PDF (Primary Orange) + Compartir (Secondary) - ICON ONLY */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Action 1: Descargar PDF (Icon only) */}
            <button
              type="button"
              id="btn-preview-download-pdf"
              onClick={handleDownloadPDF}
              disabled={downloading}
              title={downloading ? (isEn ? 'Saving PDF...' : 'Guardando PDF...') : (isEn ? 'Download PDF' : 'Descargar PDF')}
              aria-label={downloading ? (isEn ? 'Saving PDF...' : 'Guardando PDF...') : (isEn ? 'Download PDF' : 'Descargar PDF')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FF8407] hover:bg-[#E07300] active:scale-95 text-white flex items-center justify-center shadow-md cursor-pointer transition-all disabled:opacity-60"
            >
              {downloading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" /> : <FileDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            </button>

            {/* Action 2: Compartir (Web Share API - Icon only) */}
            <button
              type="button"
              id="btn-preview-share"
              onClick={handleShare}
              title={isEn ? 'Share Quote' : 'Compartir Cotización'}
              aria-label={isEn ? 'Share Quote' : 'Compartir Cotización'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-zinc-100 text-[#181818] flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF8407]" />
            </button>

            {/* Close Entire Modal */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-0.5"
              title={isEn ? 'Close' : 'Cerrar'}
              aria-label={isEn ? 'Close' : 'Cerrar'}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Real Printable Document Container */}
        <div className="flex-1 p-3 sm:p-8 flex justify-center">
          <div className="max-w-4xl w-full bg-white shadow-2xl rounded-sm p-6 sm:p-12 text-[#181818] border border-zinc-300 space-y-6 select-text">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3">
              <div>
                <QuickSurfacesLogo className="h-9 sm:h-11 w-auto text-black" />
                <p className="text-[11px] text-[#6B6A63] font-medium mt-1">
                  Flooring & Architectural Surfaces Specialist
                </p>
              </div>

              <div className="sm:text-right">
                <h1 className="text-xl sm:text-2xl font-black text-[#181818] tracking-tight uppercase">
                  {isEn ? 'QUOTATION' : 'COTIZACIÓN'}
                </h1>
                <p className="font-mono text-xs font-bold text-[#FF8407] mt-0.5">
                  No. {quote.quoteNumber}
                </p>
                <p className="text-xs text-[#6B6A63] mt-0.5">
                  {isEn ? 'Date:' : 'Fecha:'} <strong>{quote.date}</strong>
                </p>
                <p className="text-xs text-[#6B6A63]">
                  {isEn ? 'Valid Until:' : 'Válido hasta:'} <strong>{quote.validUntil}</strong> ({quote.validDays} {isEn ? 'days' : 'días'})
                </p>
              </div>
            </div>

            {/* Orange Divider Line */}
            <div className="h-1 bg-[#FF8407] w-full" />

            {/* 2-Column Info Grid: Client Billing & Shipping/Salesperson */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Client Billing Info */}
              <div className="bg-[#F8F9FA] p-4 rounded-lg border border-[#E9ECEF] space-y-1">
                <span className="text-[10px] font-bold text-[#FF8407] uppercase tracking-wider block">
                  {isEn ? 'CLIENT INFORMATION (BILLING)' : 'DATOS DEL CLIENTE (FACTURACIÓN)'}
                </span>
                <p className="text-sm font-bold text-[#181818]">
                  {quote.client.name}
                  {quote.client.clientType && (
                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800">
                      {quote.client.clientType}
                    </span>
                  )}
                </p>
                {quote.client.phone && <p className="text-[#555] font-mono">Tel: {quote.client.phone}</p>}
                {quote.client.email && <p className="text-[#555] font-mono">Email: {quote.client.email}</p>}
                {quote.client.address && <p className="text-[#555]">Dir: {quote.client.address}</p>}
              </div>

              {/* Shipping Address & Salesperson Info */}
              <div className="bg-[#F8F9FA] p-4 rounded-lg border border-[#E9ECEF] space-y-1">
                <span className="text-[10px] font-bold text-[#FF8407] uppercase tracking-wider block">
                  {isEn ? 'DISPATCH & SALESPERSON' : 'DESPACHO Y VENDEDOR ASIGNADO'}
                </span>
                <p className="text-xs font-semibold text-[#181818]">
                  <span className="text-[#6B6A63] font-normal">{isEn ? 'Delivery:' : 'Entrega:'} </span>
                  {quoteWithShipping.shippingAddress || (isEn ? 'Same as billing address' : 'Misma dirección de facturación')}
                </p>
                <div className="pt-1.5 border-t border-zinc-200 mt-1">
                  <p className="font-bold text-[#181818] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#FF8407]" />
                    <span>{salespersonName}</span>
                  </p>
                  <p className="text-[#555] font-mono text-[11px]">{salespersonPhone}</p>
                </div>
              </div>
            </div>

            {/* Itemized Vertically Stacked Cards (Replacing narrow cramped table) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#E4E2DA]">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {isEn ? 'Itemized Products & Services' : 'Detalle de Productos y Servicios'} ({quote.items.length})
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-[#6B6A63]">
                  {isEn ? 'Quantity, Packaging & Rates' : 'Cantidad, Empaque & Precios'}
                </span>
              </div>

              {quote.items.map((item, idx) => {
                const priceDetail = getItemUnitPriceDetail(item, currentLang);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[#E4E2DA] bg-[#FAFAFA] hover:border-[#181818] transition-colors space-y-2.5 shadow-2xs"
                  >
                    {/* Header Row: Index + Name + Badges on Left, Price / Subtotal aligned to Right of Name */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-[#181818] text-[#FF8407] font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 text-[10px] shrink-0">
                            {item.category}
                          </span>
                          {item.color && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-[#FF8407]/30 text-[#FF8407] text-[11px] font-bold">
                              {item.color.hex && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: item.color.hex }}
                                />
                              )}
                              <span>{item.color.name} ({item.color.code})</span>
                            </span>
                          )}
                          {!item.isTaxable && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              {isEn ? 'Tax Exempt (Labor)' : 'Exento Impuesto (Labor)'}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-[#181818] leading-snug">
                          {item.productName}
                        </h4>
                      </div>

                      {/* Price / Subtotal Aligned to the Right of the Name */}
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-base sm:text-lg text-[#181818] block leading-tight">
                          {formatCurrency(item.subtotal)}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#FF8407] block mt-0.5">
                          {priceDetail.primaryRate}
                        </span>
                        {priceDetail.packagingRate && (
                          <span className="text-[10px] text-[#6B6A63] font-mono block">
                            {priceDetail.packagingRate}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Dispatch Specs - Full Width, No Truncation */}
                    <div className="bg-white p-3 rounded-lg border border-[#E4E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                          {isEn ? 'Quantity & Dispatch Specs' : 'Cantidad y Especificaciones de Despacho'}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#181818] text-xs sm:text-sm">
                            {item.userEnteredQuantity} {item.quantityUnitLabel}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="font-semibold text-[#FF8407] text-xs">
                            {item.calculatedUnitsLabel}
                          </span>
                        </div>
                      </div>

                      {(item.thickness || item.notes) && (
                        <div className="text-[11px] text-[#6B6A63] sm:text-right space-y-0.5">
                          {item.thickness && (
                            <span className="block font-medium">{item.thickness}</span>
                          )}
                          {item.notes && (
                            <span className="block italic text-[10px] text-zinc-500">"{item.notes}"</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Totals (Right Aligned) */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 bg-[#181818] text-white p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>{isEn ? 'Products Subtotal (Taxable):' : 'Subtotal Materiales (Gravable):'}</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(quote.subtotalProducts)}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>{isEn ? 'FL Sales Tax (7% on products):' : 'Impuesto de Ventas (7%):'}</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(quote.taxAmount)}</span>
                </div>

                {quote.includeDelivery && (
                  <div className="flex justify-between text-zinc-400">
                    <span>{isEn ? 'Delivery Fee (No Tax):' : 'Delivery Fijo (No Tax):'}</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(quote.deliveryCost)}</span>
                  </div>
                )}

                {quote.installationTotal > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>{isEn ? 'Installation / Labor (Tax Exempt):' : 'Instalación / Mano de obra:'}</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(quote.installationTotal)}</span>
                  </div>
                )}

                {quote.payWithCard && (quote.cardFeeAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-[#FF8407] bg-black/40 px-2 py-1 rounded border border-[#FF8407]/30">
                    <span>{isEn ? 'Card Surcharge (3%):' : 'Recargo Tarjeta (3%):'}</span>
                    <span className="font-mono font-bold">+{formatCurrency(quote.cardFeeAmount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                  <span className="font-bold text-xs uppercase tracking-wider text-white">
                    {isEn ? 'TOTAL ESTIMATE:' : 'TOTAL ESTIMADO:'}
                  </span>
                  <span className="font-mono font-black text-2xl text-[#FF8407]">
                    {formatCurrency(quote.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods Info Box */}
            <div className="bg-[#FFFBF5] border border-[#F0D5BA] rounded-xl p-4 text-xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-[#181818] uppercase tracking-wider text-xs">
                  {isEn ? 'Accepted Payment Methods' : 'Métodos de Pago Aceptados'}
                </span>

                {/* 3 distinct payment icons with short label underneath */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Zelle */}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#181818] flex items-center justify-center text-[#FF8407] shadow-2xs">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#FF8407]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#181818]">Zelle</span>
                  </div>

                  {/* Cash */}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#181818] flex items-center justify-center text-emerald-400 shadow-2xs">
                      <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#181818]">{isEn ? 'Cash' : 'Efectivo'}</span>
                  </div>

                  {/* Card / POS */}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#181818] flex items-center justify-center text-sky-400 shadow-2xs">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#181818]">Card / POS</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0D5BA]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[#555]">
                <p>
                  {isEn ? 'Zelle Payments:' : 'Transferencias Zelle:'} <strong className="text-black font-mono font-bold">quickzelle@gmail.com</strong>
                </p>
                <p className="text-[#777]">
                  {isEn ? 'Account: Brugge International' : 'Titular: Brugge International'}
                </p>
              </div>
            </div>

            {/* Legal Disclaimer Box (Customer Signature & Date removed completely) */}
            <div className="pt-3 border-t border-zinc-200 text-[11px] text-[#6B6A63]">
              <p>
                {isEn
                  ? `This quote is valid until ${quote.validUntil}. Prices and inventory are subject to change after the validity period. Materials must be inspected prior to installation.`
                  : `Esta cotización es válida hasta el ${quote.validUntil}. Los precios e inventario están sujetos a cambio luego del período de validez. Inspeccionar materiales antes de instalar.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 1: QUOTE OPTIONS & REVIEW (SINGLE PRIMARY BUTTON FLOW)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto pt-2 sm:pt-4">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-[#E4E2DA] overflow-hidden my-0 sm:my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#E4E2DA] bg-[#181818] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center font-bold shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {isEn ? 'Review Quote' : 'Revisar Cotización'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF8407] text-white uppercase tracking-wider">
                  {isEn ? 'STEP 1 OF 2' : 'PASO 1 DE 2'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                #{quote.quoteNumber} • {quote.date}
              </p>
            </div>
          </div>

          <button
            id="btn-close-quote-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#F9F9F8] space-y-4 text-xs">
          {/* Validity Chips - Fixed 4-column grid */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E4E2DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#181818] uppercase tracking-wider text-[11px]">
                <Clock className="w-4 h-4 text-[#FF8407]" />
                <span>{isEn ? 'Quote Validity Days:' : 'Días de Validez de la Oferta:'}</span>
              </div>
              <span className="text-[11px] text-[#6B6A63] font-semibold">
                {isEn ? 'Valid Until' : 'Vence el'}: <strong className="text-[#181818] font-mono">{quote.validUntil}</strong>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[3, 7, 15, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => onUpdateQuoteDays(days)}
                  className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer border ${
                    quote.validDays === days
                      ? 'bg-[#181818] text-[#FF8407] border-[#181818] shadow-xs'
                      : 'bg-[#FAFAFA] text-[#6B6A63] hover:text-[#181818] border-[#E4E2DA]'
                  }`}
                >
                  {days} {isEn ? 'Days' : 'Días'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-white p-4 rounded-xl border border-[#E4E2DA] shadow-xs space-y-3">
            {/* Client & Salesperson summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#E4E2DA]">
              <div>
                <span className="text-[10px] font-bold text-[#9C9A90] uppercase tracking-wider block">
                  {isEn ? 'Quoted For (Billing):' : 'Cotizado para (Facturación):'}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#181818]">
                    {quote.client.name}
                  </h3>
                  {quote.client.clientType && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2F1EC] text-[#181818] border border-[#E4E2DA]">
                      {quote.client.clientType}
                    </span>
                  )}
                </div>
                {quote.client.phone && <p className="text-[11px] text-[#6B6A63]">{quote.client.phone}</p>}
                {quote.client.address && <p className="text-[11px] text-[#6B6A63]">{quote.client.address}</p>}
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-bold text-[#9C9A90] uppercase tracking-wider block">
                  {isEn ? 'Sales Representative:' : 'Vendedor Asignado:'}
                </span>
                <p className="text-xs font-bold text-[#181818]">{salespersonName}</p>
                <p className="text-[11px] text-[#6B6A63]">{salespersonPhone}</p>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="bg-[#FAFAFA] p-3 sm:p-3.5 rounded-lg border border-[#E4E2DA] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="chk-same-as-billing"
                  checked={sameAsBillingAddress}
                  onChange={(e) => onToggleSameAsBilling?.(e.target.checked)}
                  className="w-4 h-4 accent-[#FF8407] rounded cursor-pointer shrink-0"
                />
                <span className="text-xs font-bold text-[#181818]">
                  {isEn ? 'Shipping address same as billing' : 'Dirección de entrega igual a la de facturación'}
                </span>
              </label>

              {!sameAsBillingAddress && (
                <div className="pt-1.5 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] block">
                    {isEn ? 'Shipping / Delivery Address' : 'Dirección de Entrega (Shipping Address)'}
                  </label>
                  <input
                    type="text"
                    id="input-shipping-address"
                    value={shippingAddress}
                    onChange={(e) => onUpdateShippingAddress?.(e.target.value)}
                    placeholder={isEn ? 'e.g. 8320 NW 56th St, Doral, FL 33166' : 'Ej. 8320 NW 56th St, Doral, FL 33166'}
                    className="w-full text-xs bg-white border border-[#E4E2DA] focus:border-[#FF8407] rounded-lg px-3 py-2 outline-none font-medium text-black"
                  />
                </div>
              )}
            </div>

            {/* Products in Quote - Vertically Stacked Cards */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-bold text-[#9C9A90] uppercase tracking-wider block">
                {isEn ? 'Products in Quote:' : 'Productos en la Cotización:'} ({quote.items.length})
              </span>
              <div className="space-y-2">
                {quote.items.map((item, idx) => {
                  const priceDetail = getItemUnitPriceDetail(item, currentLang);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-[#E4E2DA] bg-[#FAFAFA] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="w-4 h-4 rounded-full bg-[#181818] text-[#FF8407] font-mono font-bold text-[9px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold uppercase px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 text-[9px]">
                              {item.category}
                            </span>
                            {item.color && (
                              <span className="text-[10px] font-bold text-[#FF8407] bg-amber-500/10 px-1.5 py-0.2 rounded border border-[#FF8407]/20">
                                {item.color.name}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-[#181818] mt-0.5 leading-snug">
                            {item.productName}
                          </h4>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-xs text-[#181818] block">
                            {formatCurrency(item.subtotal)}
                          </span>
                          <span className="font-mono text-[10px] text-[#FF8407] block">
                            {priceDetail.primaryRate}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-[#E4E2DA] text-[11px] text-[#6B6A63] flex items-center justify-between gap-2">
                        <span className="font-bold text-[#181818]">
                          {item.userEnteredQuantity} {item.quantityUnitLabel}
                        </span>
                        <span className="font-semibold text-[#FF8407]">
                          {item.calculatedUnitsLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Toggles: Delivery & Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {onToggleDelivery && (
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  quote.includeDelivery ? 'bg-[#FFF6EC] border-[#FF8407]/50 shadow-2xs' : 'bg-[#F9F9F9] border-[#E4E2DA]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Truck className={`w-4 h-4 shrink-0 ${quote.includeDelivery ? 'text-[#FF8407]' : 'text-zinc-500'}`} />
                    <div>
                      <span className="font-bold text-xs text-[#181818] block leading-tight">
                        {isEn ? 'Include Delivery ($60)' : 'Incluir Delivery ($60)'}
                      </span>
                      <span className="text-[10px] text-[#6B6A63] block">
                        {isEn ? 'Local delivery fee (No Tax)' : 'Flete local (Sin Impuesto)'}
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      id="chk-delivery-checkout"
                      checked={quote.includeDelivery}
                      onChange={(e) => onToggleDelivery(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF8407]"></div>
                  </label>
                </div>
              )}

              {onTogglePayWithCard && (
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  quote.payWithCard ? 'bg-[#FFF6EC] border-[#FF8407]/50 shadow-2xs' : 'bg-[#F9F9F9] border-[#E4E2DA]'
                }`}>
                  <div className="flex items-center gap-2">
                    <CreditCard className={`w-4 h-4 shrink-0 ${quote.payWithCard ? 'text-[#FF8407]' : 'text-zinc-500'}`} />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-[#181818]">
                          {isEn ? 'Card Payment' : 'Pago con Tarjeta'}
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#FF8407] text-white">
                          +3%
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6B6A63] block">
                        {isEn ? 'Debit/Credit card fee' : 'Recargo tarjeta débito/crédito'}
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      id="chk-card-payment-checkout"
                      checked={quote.payWithCard || false}
                      onChange={(e) => onTogglePayWithCard(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF8407]"></div>
                  </label>
                </div>
              )}
            </div>

            {/* Totals Summary */}
            <div className="bg-[#181818] text-white p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>{isEn ? 'Products Subtotal:' : 'Subtotal Materiales:'}</span>
                <span className="font-mono font-bold text-white">{formatCurrency(quote.subtotalProducts)}</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>{isEn ? 'FL Sales Tax (7% on products):' : 'Impuesto (7% solo s/materiales):'}</span>
                <span className="font-mono font-bold text-white">{formatCurrency(quote.taxAmount)}</span>
              </div>

              {quote.includeDelivery && (
                <div className="flex justify-between text-zinc-400">
                  <span>{isEn ? 'Delivery Fee (No Tax):' : 'Delivery ($60 sin impuesto):'}</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(quote.deliveryCost)}</span>
                </div>
              )}

              {quote.installationTotal > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>{isEn ? 'Installation / Labor (Tax Exempt):' : 'Instalación / Mano de obra:'}</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(quote.installationTotal)}</span>
                </div>
              )}

              {quote.payWithCard && (quote.cardFeeAmount ?? 0) > 0 && (
                <div className="flex justify-between text-[#FF8407] bg-black/40 px-2.5 py-1.5 rounded-lg border border-[#FF8407]/30">
                  <span>{isEn ? 'Card Surcharge (3% Debit/Credit):' : 'Recargo Tarjeta (3%):'}</span>
                  <span className="font-mono font-bold">+{formatCurrency(quote.cardFeeAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  {isEn ? 'TOTAL ESTIMATE:' : 'TOTAL:'}
                </span>
                <span className="font-mono font-black text-2xl text-[#FF8407]">
                  {formatCurrency(quote.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom: SINGLE PRIMARY BUTTON (Ver vista previa completa) */}
        <div className="p-4 sm:p-5 border-t border-[#E4E2DA] bg-white shrink-0">
          <button
            type="button"
            id="btn-open-full-preview"
            onClick={() => setIsFullPreviewOpen(true)}
            className="w-full py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#FF8407] hover:bg-[#E07300] active:scale-[0.99] text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md group"
          >
            <Eye className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span>{isEn ? 'View Full Document Preview' : 'Ver vista previa completa'}</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
