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
  AlertTriangle,
  Truck
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
      // Ensure the quote carries the latest shipping address
      const quoteWithShipping: Quotation = {
        ...quote,
        shippingAddress: sameAsBillingAddress ? (quote.client.address || '') : (shippingAddress || ''),
        sameAsBillingAddress
      };

      const doc = generateQuotePDF(quoteWithShipping, settings, currentLang);
      doc.save(`QuickSurfaces_${quote.quoteNumber}_${quote.client.name.replace(/\s+/g, '_')}.pdf`);
      
      confetti({
        particleCount: 45,
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-[#E4E2DA] overflow-hidden my-auto max-h-[92vh] flex flex-col"
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
                  {currentLang === 'en' ? 'Quote Ready' : 'Cotización Lista'}
                </h2>
                {/* Brand unified badge (Orange, NOT green) */}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF8407] text-white uppercase tracking-wider">
                  {currentLang === 'en' ? 'READY TO SEND' : 'LISTA PARA ENVIAR'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                #{quote.quoteNumber} • {quote.date}
              </p>
            </div>
          </div>

          {/* Close button at least 32x32px aligned with title */}
          <button
            id="btn-close-quote-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Container (Max 2 Levels of Cards) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#F9F9F8] space-y-4 text-xs">
          {/* Validity Chips - Fixed 4-column grid that NEVER wraps */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E4E2DA] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#181818] uppercase tracking-wider text-[11px]">
                <Clock className="w-3.5 h-3.5 text-[#FF8407]" />
                <span>{currentLang === 'en' ? 'Validity' : 'Validez de la cotización'}</span>
              </div>
              <span className="text-[11px] text-[#6B6A63]">
                {currentLang === 'en' ? 'Valid until:' : 'Válido hasta:'} <strong className="text-[#181818]">{quote.validUntil}</strong>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 5, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  id={`btn-validity-${days}`}
                  onClick={() => onUpdateQuoteDays(days)}
                  className={`py-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer border ${
                    quote.validDays === days
                      ? 'bg-[#181818] border-[#181818] text-[#FF8407] shadow-xs'
                      : 'bg-[#FAFAFA] border-[#E4E2DA] text-[#6B6A63] hover:border-[#181818] hover:text-[#181818]'
                  }`}
                >
                  {days} {currentLang === 'en' ? 'days' : 'días'}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Quote Preview Box (Single Client appearance) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E4E2DA] shadow-xs space-y-4">
            {/* Top info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#E4E2DA]">
              <div>
                <span className="text-[10px] font-bold text-[#9C9A90] uppercase tracking-wider block">
                  {currentLang === 'en' ? 'Quoted For (Billing):' : 'Cotizado para (Facturación):'}
                </span>
                <h3 className="text-sm font-bold text-[#181818]">
                  {quote.client.name}
                </h3>
                {quote.client.phone && (
                  <p className="text-[11px] text-[#6B6A63]">{quote.client.phone}</p>
                )}
                {quote.client.address && (
                  <p className="text-[11px] text-[#6B6A63]">{quote.client.address}</p>
                )}
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-bold text-[#9C9A90] uppercase tracking-wider block">
                  {currentLang === 'en' ? 'Sales Representative:' : 'Vendedor Asignado:'}
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
                  {currentLang === 'en' 
                    ? 'Shipping address same as billing' 
                    : 'Dirección de entrega igual a la de facturación'}
                </span>
              </label>

              {!sameAsBillingAddress && (
                <div className="pt-1.5 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] block">
                    {currentLang === 'en' ? 'Shipping / Delivery Address' : 'Dirección de Entrega (Shipping Address)'}
                  </label>
                  <input
                    type="text"
                    id="input-shipping-address"
                    value={shippingAddress}
                    onChange={(e) => onUpdateShippingAddress?.(e.target.value)}
                    placeholder={currentLang === 'en' ? 'e.g. 8320 NW 56th St, Doral, FL 33166' : 'Ej. 8320 NW 56th St, Doral, FL 33166'}
                    className="w-full text-xs bg-white border border-[#E4E2DA] focus:border-[#181818] rounded-lg px-3 py-2 outline-none font-medium text-[#181818]"
                  />
                  <p className="text-[10px] text-[#9C9A90]">
                    {currentLang === 'en' 
                      ? 'This delivery address will be printed on the quotation PDF for logistics and installation.' 
                      : 'Esta dirección de entrega se imprimirá en el PDF de cotización para logística e instalación.'}
                  </p>
                </div>
              )}
            </div>

            {/* Itemized Table */}
            <div className="border border-[#E4E2DA] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#181818] text-white">
                  <tr>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">#</th>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">
                      {currentLang === 'en' ? 'Item / Finish' : 'Producto / Acabado'}
                    </th>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">
                      {currentLang === 'en' ? 'Qty' : 'Cant.'}
                    </th>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider text-right">
                      {currentLang === 'en' ? 'Subtotal' : 'Subtotal'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DA]">
                  {quote.items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                      <td className="p-2.5 text-[#9C9A90] font-mono">{idx + 1}</td>
                      <td className="p-2.5">
                        <p className="font-bold text-[#181818]">{item.productName}</p>
                        {item.color && (
                          <p className="text-[11px] text-[#FF8407] font-medium">
                            {item.color.name} ({item.color.code})
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-[10px] text-[#6B6A63] italic">{item.notes}</p>
                        )}
                      </td>
                      <td className="p-2.5 text-[#181818]">
                        <span className="font-bold">{item.userEnteredQuantity} {item.quantityUnitLabel}</span>
                        <span className="block text-[10px] text-[#9C9A90]">{item.calculatedUnitsLabel}</span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#181818]">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Delivery Toggle & Totals Breakdown */}
            <div className="space-y-3 pt-2">
              {/* Delivery row with quick toggle */}
              {onToggleDelivery && (
                <div className="flex items-center justify-between p-2.5 bg-[#F2F1EC] rounded-lg border border-[#E4E2DA]">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#FF8407]" />
                    <div>
                      <span className="font-bold text-xs text-[#181818]">
                        {currentLang === 'en' ? 'Flat Delivery Fee' : 'Servicio de Delivery Fijo'}
                      </span>
                      <span className="text-[10px] text-[#6B6A63] block">
                        {currentLang === 'en' ? '$60 fixed rate (no tax)' : '$60 tarifa plana (sin impuesto)'}
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quote.includeDelivery}
                      onChange={(e) => onToggleDelivery(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF8407]"></div>
                  </label>
                </div>
              )}

              {/* Totals Box */}
              <div className="bg-[#181818] text-white p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>{currentLang === 'en' ? 'Products Subtotal:' : 'Subtotal Materiales:'}</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(quote.subtotalProducts)}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>{currentLang === 'en' ? 'FL Sales Tax (7% on products):' : 'Impuesto (7% solo s/materiales):'}</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(quote.taxAmount)}</span>
                </div>

                {quote.includeDelivery && (
                  <div className="flex justify-between text-zinc-400">
                    <span>{currentLang === 'en' ? 'Delivery Fee (No Tax):' : 'Delivery ($60 sin impuesto):'}</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(quote.deliveryCost)}</span>
                  </div>
                )}

                {quote.installationTotal > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>{currentLang === 'en' ? 'Installation / Labor (Tax Exempt):' : 'Instalación / Mano de obra:'}</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(quote.installationTotal)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                  <span className="font-bold text-xs uppercase tracking-wider text-white">
                    {currentLang === 'en' ? 'TOTAL ESTIMATE:' : 'TOTAL:'}
                  </span>
                  <span className="font-mono font-black text-2xl text-[#FF8407]">
                    {formatCurrency(quote.total)}
                  </span>
                </div>
              </div>

              {/* Clean Legal Note */}
              <p className="text-[11px] text-[#6B6A63] leading-relaxed bg-[#FAFAFA] p-2.5 rounded-lg border border-[#E4E2DA]">
                {currentLang === 'en'
                  ? `This is a reference estimate. Prices are subject to change without prior notice. Valid until ${quote.validUntil}.`
                  : `Este es un estimado referencial. Los precios están sujetos a cambio sin previo aviso. Válido hasta ${quote.validUntil}.`}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions: One prominent Download button + Two secondary actions */}
        <div className="p-4 sm:p-5 border-t border-[#E4E2DA] bg-white space-y-2.5 shrink-0">
          {/* Dominant Primary Button: Full width, solid orange */}
          <button
            type="button"
            id="btn-download-pdf-primary"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#FF8407] hover:bg-[#E07300] text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <FileDown className="w-5 h-5 text-white" />
            <span>{downloading ? (currentLang === 'en' ? 'Generating PDF...' : 'Generando PDF...') : (currentLang === 'en' ? 'Download PDF' : 'Descargar PDF')}</span>
          </button>

          {/* Secondary Actions in 2 Columns */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              id="btn-copy-quote-text"
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl text-xs font-bold border border-[#E4E2DA] hover:border-[#181818] bg-[#FAFAFA] text-[#181818] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#6B6A63]" />}
              <span>{copied ? (currentLang === 'en' ? 'Copied!' : '¡Copiado!') : (currentLang === 'en' ? 'Copy Text' : 'Copiar Texto')}</span>
            </button>

            <button
              type="button"
              id="btn-share-quote-whatsapp"
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{currentLang === 'en' ? 'WhatsApp' : 'WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
