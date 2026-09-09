import React, { useState } from 'react';
import { Quotation, AppSettings, Language } from '../types';
import { formatCurrency } from '../utils/calculations';
import { generateQuotePDF, openWhatsAppShare } from '../utils/pdfGenerator';
import { 
  History, 
  Search, 
  FileDown, 
  MessageSquare, 
  Trash2, 
  X, 
  RotateCcw, 
  Calendar, 
  User 
} from 'lucide-react';
import { translations } from '../utils/translations';

interface QuotesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: Quotation[];
  settings: AppSettings;
  onLoadQuote: (quote: Quotation) => void;
  onDeleteQuote: (quoteId: string) => void;
  onClearHistory: () => void;
  language?: Language;
}

export const QuotesHistoryModal: React.FC<QuotesHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  settings,
  onLoadQuote,
  onDeleteQuote,
  onClearHistory,
  language = 'en'
}) => {
  const currentLang: Language = language === 'es' ? 'es' : 'en';
  const t = translations[currentLang];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(q => 
    q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.client.phone && q.client.phone.includes(searchTerm))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto pt-3 sm:pt-4">
      <div 
        className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-[#E5E5E5] overflow-hidden my-0 sm:my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E5E5] bg-black text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {t.historyModalTitle}
              </h2>
              <p className="text-[11px] text-[#8C8C8C]">
                {history.length} {t.historySubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors cursor-pointer uppercase tracking-wider font-bold"
              >
                {t.clearHistoryBtn}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md hover:bg-zinc-800 text-[#8C8C8C] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#F9F9F9] border-b border-[#E5E5E5] shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchHistoryPlaceholder}
              className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg pl-9 pr-3 py-2 outline-none font-medium"
            />
          </div>
        </div>

        {/* Quotes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs text-[#8C8C8C] font-medium">{t.noQuotesYet}</p>
              <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                {t.noQuotesSubtitle}
              </p>
            </div>
          ) : (
            filteredHistory.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-[#E5E5E5] hover:border-black bg-white transition-all shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5 rounded">
                      #{q.quoteNumber}
                    </span>
                    <span className="text-xs text-[#8C8C8C] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8C8C8C]" />
                      {q.date}
                    </span>
                  </div>

                  <span className="text-base font-bold text-[#FF8407] font-mono">
                    {formatCurrency(q.total)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 pt-1 border-t border-[#E5E5E5]">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#8C8C8C]" />
                      <h4 className="text-xs sm:text-sm font-bold text-black">
                        {q.client.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                      {q.items.length} {t.itemsWord} • {t.validUntil} {q.validUntil}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadQuote(q);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                      title={language === 'en' ? 'Load quote to cart' : 'Cargar esta cotización al carrito'}
                    >
                      <RotateCcw className="w-3 h-3 text-[#FF8407]" />
                      <span>{t.loadQuoteBtn}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const doc = generateQuotePDF(q, settings, currentLang);
                        doc.save(`QuickSurfaces_${q.quoteNumber}.pdf`);
                      }}
                      className="p-1.5 rounded-lg border border-[#E5E5E5] hover:border-black text-black hover:bg-zinc-50 transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openWhatsAppShare(q, undefined, currentLang)}
                      className="p-1.5 rounded-lg border border-[#E5E5E5] hover:border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Send WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteQuote(q.id)}
                      className="p-1.5 rounded-lg text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete quote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
