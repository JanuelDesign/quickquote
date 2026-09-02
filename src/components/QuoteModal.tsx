import React, { useState } from 'react';
import { Quotation, AppSettings, Language } from '../types';
import { generateQuotePDF, openWhatsAppShare, generateWhatsAppMessage } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { QuickSurfacesLogo } from './QuickSurfacesLogo';
import { 
  FileDown, 
  Check, 
  X, 
  MessageSquare, 
  Copy, 
  Clock, 
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quotation;
  settings: AppSettings;
  onUpdateQuoteDays: (days: number) => void;
  onUpdateSalesperson: (name: string, phone: string) => void;
  onSaveToHistory: () => void;
  language?: Language;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  quote,
  settings,
  onUpdateQuoteDays,
  onSaveToHistory,
  language = 'en'
}) => {
  if (!isOpen) return null;
  const currentLang: Language = language === 'es' ? 'es' : 'en';
  const t = translations[currentLang];

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const salespersonName = quote.salespersonName || settings.salespersonName;
  const salespersonPhone = quote.salespersonPhone || settings.salespersonPhone;

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = generateQuotePDF(quote, settings, currentLang);
      doc.save(`QuickSurfaces_${quote.quoteNumber}_${quote.client.name.replace(/\s+/g, '_')}.pdf`);
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      onSaveToHistory();
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    openWhatsAppShare(quote, undefined, currentLang);
    onSaveToHistory();
  };

  const handleCopyText = () => {
    const text = generateWhatsAppMessage(quote, currentLang);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl w-full max-w-3xl shadow-2xl border border-[#E5E5E5] overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] bg-black text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center font-bold">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {t.quoteDocTitle} #{quote.quoteNumber}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  {t.readyToExport}
                </span>
              </div>
              <p className="text-xs text-[#8C8C8C]">
                {t.clientLabel}: <strong className="text-white">{quote.client.name}</strong> • Total: <strong className="text-[#FF8407] font-mono">{formatCurrency(quote.total)}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-zinc-800 text-[#8C8C8C] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Document Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F9F9F9] space-y-4">
          {/* Settings Bar inside preview */}
          <div className="bg-white p-3 rounded-lg border border-[#E5E5E5] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF8407]" />
              <span className="font-bold text-black uppercase tracking-wider text-[11px]">{t.quoteValidity}</span>
              <div className="flex gap-1">
                {[2, 3, 5, 7, 15].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => onUpdateQuoteDays(days)}
                    className={`px-2 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                      quote.validDays === days
                        ? 'bg-black text-[#FF8407]'
                        : 'bg-[#FAFAFA] border border-[#E5E5E5] text-zinc-600 hover:border-black'
                    }`}
                  >
                    {days} {t.days}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8C8C8C]">{t.validUntil}</span>
              <span className="font-mono font-bold text-black">{quote.validUntil}</span>
            </div>
          </div>

          {/* Paper Sheet Preview (WYSIWYG PDF appearance) */}
          <div className="bg-white p-5 sm:p-8 rounded-xl border border-[#E5E5E5] shadow-xs text-black font-sans space-y-6">
            {/* Header with Logo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <QuickSurfacesLogo className="h-10 sm:h-12 w-auto text-black" />
              </div>

              <div className="text-left sm:text-right">
                <h3 className="text-lg font-black text-black uppercase tracking-wider">{t.quoteDocTitle}</h3>
                <p className="text-xs text-[#8C8C8C] font-mono">No. {quote.quoteNumber}</p>
                <p className="text-xs text-[#8C8C8C]">{language === 'en' ? 'Date:' : 'Fecha:'} {quote.date}</p>
              </div>
            </div>

            {/* Client & Issuer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                <p className="font-bold text-[#FF8407] uppercase tracking-wider text-[10px] mb-1">
                  {t.clientInfoTitle}
                </p>
                <p className="text-sm font-bold text-black">{quote.client.name}</p>
                {quote.client.phone && <p className="text-zinc-600">Tel: {quote.client.phone}</p>}
                {quote.client.email && <p className="text-zinc-600">Email: {quote.client.email}</p>}
                {quote.client.address && <p className="text-zinc-600">{language === 'en' ? 'Address:' : 'Dirección:'} {quote.client.address}</p>}
              </div>

              <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                <p className="font-bold text-[#FF8407] uppercase tracking-wider text-[10px] mb-1">
                  {t.salesRepTitle}
                </p>
                <p className="text-sm font-bold text-black">QuickSurfaces Miami</p>
                <p className="text-zinc-600">{settings.companyAddress}</p>
                <p className="text-zinc-600">{t.salesperson}: {salespersonName} • {salespersonPhone}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto border border-[#E5E5E5] rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">{t.tableHash}</th>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">{t.tableDesc}</th>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">{t.tableQty}</th>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider text-right">{t.tableUnitPrice}</th>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider text-right">{t.tableSubtotal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {quote.items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                      <td className="p-2.5 text-[#8C8C8C] font-mono">{idx + 1}</td>
                      <td className="p-2.5">
                        <p className="font-bold text-black">{item.productName}</p>
                        {item.color && (
                          <p className="text-[11px] text-[#FF8407] font-medium">
                            Color: {item.color.code} - {item.color.name}
                          </p>
                        )}
                        {item.stepIncludesRiser && (
                          <p className="text-[11px] text-[#8C8C8C]">
                            {language === 'en' ? 'Includes: Step + Matching Flush Riser' : 'Incluye: Peldaño + Contrahuella'}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-[11px] text-[#8C8C8C] italic">
                            {language === 'en' ? 'Note:' : 'Nota:'} {item.notes}
                          </p>
                        )}
                      </td>
                      <td className="p-2.5 text-zinc-800 font-medium">
                        <span className="block font-bold text-black">{item.userEnteredQuantity} {item.quantityUnitLabel}</span>
                        <span className="text-[11px] text-[#8C8C8C]">{item.calculatedUnitsLabel}</span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-medium">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-black">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Breakdown & Legal Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              {/* Legal Notice Note */}
              <div className="sm:col-span-7 p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-[#FF8407]" />
                  <span>{t.termsTitle}</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                  {t.termsBody.replace('{days}', quote.validDays.toString()).replace('{date}', quote.validUntil)}
                </p>
              </div>

              {/* Financial Totals Card */}
              <div className="sm:col-span-5 p-4 rounded-lg bg-black text-white space-y-2 text-xs">
                <div className="flex justify-between text-[#8C8C8C]">
                  <span>{t.subtotalProducts}:</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(quote.subtotalProducts)}</span>
                </div>

                {quote.includeDelivery && (
                  <div className="flex justify-between text-[#8C8C8C]">
                    <span>{t.deliveryTaxable}:</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(quote.deliveryCost)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#8C8C8C]">
                  <span>{t.salesTax}:</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(quote.taxAmount)}</span>
                </div>

                {quote.installationTotal > 0 && (
                  <div className="flex justify-between text-[#8C8C8C]">
                    <span>{t.installationServices}:</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(quote.installationTotal)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                  <span className="font-bold text-xs uppercase tracking-wider text-white">{t.estimatedTotal}:</span>
                  <span className="font-bold text-xl font-mono text-[#FF8407]">
                    {formatCurrency(quote.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E5E5E5] bg-white flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3.5 py-2.5 rounded-lg text-xs font-bold border border-[#E5E5E5] hover:border-black text-black flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.copiedBtn : t.copyTextBtn}</span>
            </button>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              id="btn-share-whatsapp"
              onClick={handleWhatsAppShare}
              className="px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 uppercase tracking-wider"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.whatsAppBtn}</span>
            </button>

            <button
              type="button"
              id="btn-download-pdf"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#FF8407] text-white hover:bg-[#E07300] transition-colors flex items-center gap-2 cursor-pointer shadow-md active:scale-95 uppercase tracking-wider"
            >
              <FileDown className="w-4 h-4" />
              <span>{downloading ? t.generatingPdf : t.downloadPdfBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
