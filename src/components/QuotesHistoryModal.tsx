import React, { useState, useRef, useEffect } from 'react';
import { Quotation, AppSettings, Language, QuoteStatus } from '../types';
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
  User,
  Copy,
  CheckCircle2,
  Send,
  AlertOctagon,
  ChevronDown,
  Check
} from 'lucide-react';
import { translations } from '../utils/translations';

interface QuotesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: Quotation[];
  settings: AppSettings;
  onLoadQuote: (quote: Quotation) => void;
  onDuplicateQuote: (quote: Quotation) => void;
  onUpdateQuoteStatus?: (quoteId: string, newStatus: QuoteStatus) => void;
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
  onDuplicateQuote,
  onUpdateQuoteStatus,
  onDeleteQuote,
  onClearHistory,
  language = 'en'
}) => {
  const currentLang: Language = language === 'es' ? 'es' : 'en';
  const t = translations[currentLang];
  const isEn = currentLang === 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Close status dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setOpenStatusMenuId(null);
      }
    }
    if (openStatusMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openStatusMenuId]);

  if (!isOpen) return null;

  // Status visual definition
  const getStatusConfig = (status?: QuoteStatus) => {
    switch (status) {
      case 'approved':
        return {
          label: isEn ? 'Approved' : 'Aprobada',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-300',
          dot: 'bg-emerald-500',
          icon: CheckCircle2
        };
      case 'sent':
        return {
          label: isEn ? 'Sent' : 'Enviada',
          bg: 'bg-zinc-100',
          text: 'text-zinc-700',
          border: 'border-zinc-300',
          dot: 'bg-zinc-500',
          icon: Send
        };
      case 'expired':
        return {
          label: isEn ? 'Expired' : 'Vencida',
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-300',
          dot: 'bg-red-500',
          icon: AlertOctagon
        };
      case 'draft':
      default:
        return {
          label: isEn ? 'Draft' : 'Borrador',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          dot: 'bg-blue-500',
          icon: History
        };
    }
  };

  const statusOptions: { status: QuoteStatus; label: string; desc: string; color: string }[] = [
    {
      status: 'sent',
      label: isEn ? 'Sent' : 'Enviada',
      desc: isEn ? 'Sent to customer (follow-up)' : 'Enviada al cliente (en seguimiento)',
      color: 'text-zinc-700'
    },
    {
      status: 'approved',
      label: isEn ? 'Approved' : 'Aprobada',
      desc: isEn ? 'Customer accepted the quote' : 'Cliente aceptó la cotización',
      color: 'text-emerald-700'
    },
    {
      status: 'expired',
      label: isEn ? 'Expired' : 'Vencida',
      desc: isEn ? 'Validity date passed or declined' : 'Venció el plazo o declinada',
      color: 'text-red-700'
    },
    {
      status: 'draft',
      label: isEn ? 'Draft' : 'Borrador',
      desc: isEn ? 'In progress / not sent' : 'En edición / no enviada aún',
      color: 'text-blue-700'
    }
  ];

  // Filtering
  const filteredHistory = history.filter(q => {
    const effectiveStatus: QuoteStatus = q.status || 'draft';
    const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesSearch = 
      q.quoteNumber.toLowerCase().includes(term) ||
      q.client.name.toLowerCase().includes(term) ||
      (q.client.phone && q.client.phone.includes(term)) ||
      (q.salespersonName && q.salespersonName.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  // Counts for filter pills
  const counts = {
    all: history.length,
    sent: history.filter(q => (q.status || 'draft') === 'sent').length,
    approved: history.filter(q => (q.status || 'draft') === 'approved').length,
    expired: history.filter(q => (q.status || 'draft') === 'expired').length,
    draft: history.filter(q => (q.status || 'draft') === 'draft').length
  };

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
              <p className="text-[11px] text-[#8C8C8C] flex items-center gap-1.5 mt-0.5">
                <span>{history.length} {t.historySubtitle}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {currentLang === 'en' ? 'Cloud Firestore Synced' : 'En la nube (Firestore)'}
                </span>
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

        {/* Search Bar & Status Filter Tabs */}
        <div className="p-3 bg-[#F9F9F9] border-b border-[#E5E5E5] shrink-0 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchHistoryPlaceholder}
              className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg pl-9 pr-3 py-2 outline-none font-medium"
            />
          </div>

          {/* Status Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 border ${
                statusFilter === 'all'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {isEn ? 'All' : 'Todas'} ({counts.all})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('sent')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                statusFilter === 'sent'
                  ? 'bg-zinc-800 text-white border-zinc-800'
                  : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <span>{isEn ? 'Sent' : 'Enviadas'} ({counts.sent})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{isEn ? 'Approved' : 'Aprobadas'} ({counts.approved})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('expired')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                statusFilter === 'expired'
                  ? 'bg-red-700 text-white border-red-700'
                  : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{isEn ? 'Expired' : 'Vencidas'} ({counts.expired})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                statusFilter === 'draft'
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{isEn ? 'Draft' : 'Borradores'} ({counts.draft})</span>
            </button>
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
            filteredHistory.map((q) => {
              const currentStatus: QuoteStatus = q.status || 'draft';
              const statusCfg = getStatusConfig(currentStatus);
              const isStatusMenuOpen = openStatusMenuId === q.id;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-[#E5E5E5] hover:border-black bg-white transition-all shadow-2xs space-y-3"
                >
                  {/* Top Row: Quote Number, Date, Status Pill Selector, and Total */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5 rounded">
                        #{q.quoteNumber}
                      </span>

                      {/* Interactive Status Selector Pill */}
                      <div className="relative" ref={isStatusMenuOpen ? statusMenuRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setOpenStatusMenuId(prev => prev === q.id ? null : q.id)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          title={isEn ? 'Click to change status' : 'Clic para cambiar estado de seguimiento'}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                          <span>{statusCfg.label}</span>
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>

                        {/* Status Dropdown Menu */}
                        {isStatusMenuOpen && (
                          <div className="absolute left-0 top-7 w-52 bg-white border border-[#E5E5E5] rounded-xl shadow-xl p-1.5 z-40 space-y-1 text-xs animate-in fade-in duration-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8C8C] px-2 py-1 block">
                              {isEn ? 'Update Status' : 'Cambiar Estado'}
                            </span>
                            {statusOptions.map(opt => {
                              const isSelected = currentStatus === opt.status;
                              return (
                                <button
                                  key={opt.status}
                                  type="button"
                                  onClick={() => {
                                    onUpdateQuoteStatus?.(q.id, opt.status);
                                    setOpenStatusMenuId(null);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected ? 'bg-zinc-100 font-bold' : 'hover:bg-zinc-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      opt.status === 'sent' ? 'bg-zinc-500' :
                                      opt.status === 'approved' ? 'bg-emerald-500' :
                                      opt.status === 'expired' ? 'bg-red-500' : 'bg-blue-500'
                                    }`} />
                                    <span className={opt.color}>{opt.label}</span>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <span className="text-xs text-[#8C8C8C] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#8C8C8C]" />
                        {q.date}
                      </span>
                    </div>

                    <span className="text-base font-bold text-[#FF8407] font-mono">
                      {formatCurrency(q.total)}
                    </span>
                  </div>

                  {/* Middle Info & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1 border-t border-[#E5E5E5]">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#8C8C8C]" />
                        <h4 className="text-xs sm:text-sm font-bold text-black">
                          {q.client.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                        {q.items.length} {t.itemsWord} • {t.validUntil} {q.validUntil}
                        {q.salespersonName && ` • Rep: ${q.salespersonName}`}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      {/* Action: Continuar cotización */}
                      <button
                        type="button"
                        onClick={() => {
                          onLoadQuote(q);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                        title={isEn ? 'Load quote to cart' : 'Cargar esta cotización al carrito'}
                      >
                        <RotateCcw className="w-3 h-3 text-[#FF8407]" />
                        <span>{t.loadQuoteBtn}</span>
                      </button>

                      {/* Action: Duplicar (Requirement 2) */}
                      <button
                        type="button"
                        onClick={() => {
                          onDuplicateQuote(q);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#F2F1EC] text-[#181818] hover:bg-[#E4E2DA] border border-[#E4E2DA] transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                        title={isEn ? 'Create editable copy with new quote #' : 'Crear copia editable con nuevo número de cotización'}
                      >
                        <Copy className="w-3 h-3 text-[#FF8407]" />
                        <span>{isEn ? 'Duplicate' : 'Duplicar'}</span>
                      </button>

                      {/* Action: Descargar PDF */}
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

                      {/* Action: WhatsApp */}
                      <button
                        type="button"
                        onClick={() => openWhatsAppShare(q, undefined, currentLang)}
                        className="p-1.5 rounded-lg border border-[#E5E5E5] hover:border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Send WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Action: Delete */}
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
