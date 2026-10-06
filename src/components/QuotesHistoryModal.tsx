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
  Check,
  BarChart3,
  MoreHorizontal
} from 'lucide-react';
import { translations } from '../utils/translations';
import { FilterPill } from './ui/Badge';

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
  onOpenKpiDashboard?: () => void;
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
  onOpenKpiDashboard,
  language = 'en'
}) => {
  const currentLang: Language = language === 'es' ? 'es' : 'en';
  const t = translations[currentLang];
  const isEn = currentLang === 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const statusMenuRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (statusMenuRef.current && !statusMenuRef.current.contains(target)) {
        setOpenStatusMenuId(null);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(target)) {
        setOpenActionMenuId(null);
        setConfirmDeleteId(null);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(target)) {
        setIsHeaderMenuOpen(false);
        setConfirmClearAll(false);
      }
    }
    if (openStatusMenuId || openActionMenuId || isHeaderMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openStatusMenuId, openActionMenuId, isHeaderMenuOpen]);

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
  const filteredHistory = history.filter((q) => {
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
    sent: history.filter((q) => (q.status || 'draft') === 'sent').length,
    approved: history.filter((q) => (q.status || 'draft') === 'approved').length,
    expired: history.filter((q) => (q.status || 'draft') === 'expired').length,
    draft: history.filter((q) => (q.status || 'draft') === 'draft').length
  };

  const subtitleText = isEn
    ? `${history.length} ${history.length === 1 ? 'saved quote' : 'saved quotes'}. Review or continue any of them.`
    : `${history.length} ${history.length === 1 ? 'cotización guardada' : 'cotizaciones guardadas'}. Revisa o continúa cualquiera de ellas.`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto pt-3 sm:pt-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-[#E5E5E5] overflow-hidden my-0 sm:my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1, 2 & 3. Clean Header: No clipped buttons, clear sentence subtitle, fixed "Sincronizado" status */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] bg-[#181818] text-white shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center shrink-0 mt-0.5">
                <History className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide leading-tight">
                    {t.historyModalTitle}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{isEn ? 'Synced' : 'Sincronizado'}</span>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  {subtitleText}
                </p>
              </div>
            </div>

            {/* Right Action Controls — Never clipped */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onOpenKpiDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenKpiDashboard();
                  }}
                  className="h-8 px-2.5 rounded-lg bg-[#FF8407] hover:bg-[#E07300] text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider shrink-0"
                  title={isEn ? 'Open Admin KPIs' : 'Abrir módulo de KPIs'}
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">KPIs</span>
                </button>
              )}

              {/* Header More Menu (···) for Clear History so it never clips on mobile */}
              {history.length > 0 && (
                <div className="relative" ref={headerMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHeaderMenuOpen((prev) => !prev);
                      setConfirmClearAll(false);
                    }}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title={isEn ? 'More options' : 'Más opciones'}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {isHeaderMenuOpen && (
                    <div className="absolute right-0 top-10 w-60 bg-white text-[#181818] border border-[#E5E5E5] rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in duration-100">
                      {!confirmClearAll ? (
                        <button
                          type="button"
                          onClick={() => setConfirmClearAll(true)}
                          className="w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 transition-colors cursor-pointer text-left"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                          <span>{t.clearHistoryBtn}</span>
                        </button>
                      ) : (
                        <div className="p-2 space-y-2">
                          <p className="text-[11px] font-bold text-[#181818] leading-snug">
                            {isEn
                              ? 'Delete all saved quotes permanently?'
                              : '¿Eliminar todas las cotizaciones guardadas?'}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onClearHistory();
                                setIsHeaderMenuOpen(false);
                                setConfirmClearAll(false);
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              {isEn ? 'Yes, clear' : 'Sí, vaciar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmClearAll(false)}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-[11px] cursor-pointer"
                            >
                              {isEn ? 'Cancel' : 'Cancelar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isEn ? 'Close' : 'Cerrar'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar & 4. Horizontally Scrollable Status Filter Pills */}
        <div className="p-3.5 bg-[#F9F9F9] border-b border-[#E5E5E5] shrink-0 space-y-2.5">
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

          {/* 4. Status Filter Badges using shared FilterPill + wrapping container so no pill is ever cut off */}
          <div className="pill-scroll-row gap-1.5 text-xs">
            <FilterPill
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              activeClassName="bg-black text-white border-black"
              inactiveClassName="bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            >
              {isEn ? 'All' : 'Todas'} ({counts.all})
            </FilterPill>

            <FilterPill
              active={statusFilter === 'sent'}
              onClick={() => setStatusFilter('sent')}
              dotColor="bg-zinc-500"
              activeClassName="bg-zinc-800 text-white border-zinc-800"
              inactiveClassName="bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"
            >
              {isEn ? 'Sent' : 'Enviadas'} ({counts.sent})
            </FilterPill>

            <FilterPill
              active={statusFilter === 'approved'}
              onClick={() => setStatusFilter('approved')}
              dotColor="bg-emerald-500"
              activeClassName="bg-emerald-700 text-white border-emerald-700"
              inactiveClassName="bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
            >
              {isEn ? 'Approved' : 'Aprobadas'} ({counts.approved})
            </FilterPill>

            <FilterPill
              active={statusFilter === 'expired'}
              onClick={() => setStatusFilter('expired')}
              dotColor="bg-red-500"
              activeClassName="bg-red-700 text-white border-red-700"
              inactiveClassName="bg-red-50 text-red-800 border-red-300 hover:bg-red-100"
            >
              {isEn ? 'Expired' : 'Vencidas'} ({counts.expired})
            </FilterPill>

            <FilterPill
              active={statusFilter === 'draft'}
              onClick={() => setStatusFilter('draft')}
              dotColor="bg-blue-500"
              activeClassName="bg-blue-700 text-white border-blue-700"
              inactiveClassName="bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
            >
              {isEn ? 'Drafts' : 'Borradores'} ({counts.draft})
            </FilterPill>
          </div>
        </div>

        {/* Quotes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs text-[#8C8C8C] font-medium">{t.noQuotesYet}</p>
              <p className="text-[11px] text-[#8C8C8C] mt-0.5">{t.noQuotesSubtitle}</p>
            </div>
          ) : (
            filteredHistory.map((q) => {
              const currentStatus: QuoteStatus = q.status || 'draft';
              const statusCfg = getStatusConfig(currentStatus);
              const isStatusMenuOpen = openStatusMenuId === q.id;
              const isActionMenuOpen = openActionMenuId === q.id;
              const isConfirmingDelete = confirmDeleteId === q.id;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-[#E5E5E5] hover:border-black bg-white transition-all shadow-2xs space-y-3"
                >
                  {/* Top Row: Quote Number, Status Pill, Date, Total, and ··· Menu */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5 rounded shrink-0">
                        #{q.quoteNumber}
                      </span>

                      {/* Interactive Status Selector Pill */}
                      <div className="relative" ref={isStatusMenuOpen ? statusMenuRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setOpenStatusMenuId((prev) => (prev === q.id ? null : q.id))}
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
                            {statusOptions.map((opt) => {
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
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        opt.status === 'sent'
                                          ? 'bg-zinc-500'
                                          : opt.status === 'approved'
                                          ? 'bg-emerald-500'
                                          : opt.status === 'expired'
                                          ? 'bg-red-500'
                                          : 'bg-blue-500'
                                      }`}
                                    />
                                    <span className={opt.color}>{opt.label}</span>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <span className="text-xs text-[#8C8C8C] flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3 text-[#8C8C8C]" />
                        {q.date}
                      </span>
                    </div>

                    {/* Right side of Top Row: Total + ··· Card Menu */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-base font-bold text-[#FF8407] font-mono">
                        {formatCurrency(q.total)}
                      </span>

                      {/* 5. Secondary Actions Menu (···) in card corner */}
                      <div className="relative" ref={isActionMenuOpen ? actionMenuRef : undefined}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenActionMenuId((prev) => (prev === q.id ? null : q.id));
                            setConfirmDeleteId(null);
                          }}
                          className="w-8 h-8 rounded-lg border border-[#E5E5E5] hover:border-black bg-[#FAFAFA] hover:bg-zinc-100 text-[#181818] flex items-center justify-center transition-colors cursor-pointer"
                          title={isEn ? 'More actions' : 'Más acciones'}
                          aria-label={isEn ? 'More actions' : 'Más acciones'}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {isActionMenuOpen && (
                          <div className="absolute right-0 top-9 w-56 bg-white border border-[#E5E5E5] rounded-xl shadow-2xl p-1.5 z-40 text-xs space-y-1 animate-in fade-in duration-100">
                            {!isConfirmingDelete ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const doc = generateQuotePDF(q, settings, currentLang);
                                    doc.save(`QuickSurfaces_${q.quoteNumber}.pdf`);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg hover:bg-zinc-100 text-[#181818] font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                                >
                                  <FileDown className="w-4 h-4 text-[#FF8407] shrink-0" />
                                  <span>{isEn ? 'Download PDF' : 'Descargar PDF'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    openWhatsAppShare(q, undefined, currentLang);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg hover:bg-emerald-50 text-emerald-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                                >
                                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>{isEn ? 'Share via WhatsApp' : 'Compartir'}</span>
                                </button>

                                <div className="border-t border-[#E5E5E5] my-1 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(q.id)}
                                    className="w-full px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                                    <span>{isEn ? 'Delete Quote' : 'Eliminar'}</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="p-2 space-y-2">
                                <p className="text-[11px] font-bold text-[#181818] leading-snug">
                                  {isEn
                                    ? `Delete quote #${q.quoteNumber}?`
                                    : `¿Eliminar la cotización #${q.quoteNumber}?`}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteQuote(q.id);
                                      setOpenActionMenuId(null);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    {isEn ? 'Delete' : 'Sí, eliminar'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-[11px] cursor-pointer"
                                  >
                                    {isEn ? 'Cancel' : 'Cancelar'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Client Details + Only 2 Visible Buttons (Continuar Cotización + Duplicar) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E5E5E5]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <User className="w-3.5 h-3.5 text-[#8C8C8C] shrink-0" />
                        <h4 className="text-xs sm:text-sm font-bold text-black leading-snug break-words">
                          {q.client.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                        {q.items.length} {t.itemsWord} • {t.validUntil} {q.validUntil}
                        {q.salespersonName && ` • Rep: ${q.salespersonName}`}
                      </p>
                    </div>

                    {/* 5. Only 2 visible buttons: Primary (Continuar Cotización) & Secondary (Duplicar) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadQuote(q);
                          onClose();
                        }}
                        className="flex-1 sm:flex-initial justify-center px-3 py-2 rounded-lg text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                        title={isEn ? 'Load quote to cart' : 'Cargar esta cotización al carrito'}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#FF8407] shrink-0" />
                        <span className="whitespace-nowrap">{t.loadQuoteBtn}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onDuplicateQuote(q);
                          onClose();
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-[#F2F1EC] text-[#181818] hover:bg-[#E4E2DA] border border-[#E4E2DA] transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
                        title={
                          isEn
                            ? 'Create editable copy with new quote #'
                            : 'Crear copia editable con nuevo número de cotización'
                        }
                      >
                        <Copy className="w-3.5 h-3.5 text-[#FF8407] shrink-0" />
                        <span className="whitespace-nowrap">{isEn ? 'Duplicate' : 'Duplicar'}</span>
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
