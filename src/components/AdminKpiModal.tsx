import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Quotation, Language, QuoteStatus, ProductCategory } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  BarChart3,
  X,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  TrendingUp,
  Award,
  Layers,
  Truck,
  CreditCard,
  Users,
  Download,
  DollarSign,
  Percent,
  ChevronDown,
  Check
} from 'lucide-react';

interface AdminKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: Quotation[];
  onUpdateQuoteStatus?: (quoteId: string, newStatus: QuoteStatus) => void;
  language?: Language;
}

type DatePreset = 'all' | 'today' | '7d' | '30d' | 'month' | 'year' | 'custom';

function parseQuoteDate(q: Quotation): Date {
  if (q.createdAt) {
    const parsed = new Date(q.createdAt);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (q.date) {
    const parsed = new Date(q.date);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (q.id && q.id.startsWith('quote-')) {
    const ts = parseInt(q.id.replace('quote-', ''), 10);
    if (!isNaN(ts) && ts > 1000000000000) {
      return new Date(ts);
    }
  }
  return new Date();
}

const CATEGORY_LABELS: Record<ProductCategory, { es: string; en: string }> = {
  piso: { es: 'Pisos SPC / Laminados', en: 'SPC / Laminate Flooring' },
  rodapie: { es: 'Rodapiés (Baseboards)', en: 'Baseboards' },
  escalones: { es: 'Escalones & Contrahuellas', en: 'Stair Treads & Risers' },
  perfiles: { es: 'Perfiles / Molduras', en: 'Profiles & Trims' },
  wall_panels: { es: 'Wall Panels (WPC)', en: 'Wall Panels (WPC)' },
  underlayment: { es: 'Underlayment / Manta', en: 'Underlayment' },
  otros: { es: 'Instalación / Otros', en: 'Installation / Custom' }
};

const DATE_PRESET_OPTIONS: { id: DatePreset; es: string; en: string }[] = [
  { id: 'all', es: 'Todo el historial', en: 'All time' },
  { id: 'today', es: 'Hoy', en: 'Today' },
  { id: '7d', es: 'Últimos 7 días', en: 'Last 7 days' },
  { id: '30d', es: 'Últimos 30 días', en: 'Last 30 days' },
  { id: 'month', es: 'Este mes', en: 'This month' },
  { id: 'year', es: 'Este año', en: 'This year' },
  { id: 'custom', es: 'Por fecha (rango)', en: 'Custom date range' }
];

export const AdminKpiModal: React.FC<AdminKpiModalProps> = ({
  isOpen,
  onClose,
  history,
  onUpdateQuoteStatus,
  language = 'es'
}) => {
  const isEn = language === 'en';

  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'salespeople' | 'products' | 'quotes'>('overview');

  // Collapsed filter menus state ('period' | 'salesperson' | null)
  const [openFilterMenu, setOpenFilterMenu] = useState<'period' | 'salesperson' | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  // Close filter menus when clicking outside on desktop
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenFilterMenu(null);
      }
    }
    if (openFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilterMenu]);

  // Extract unique salespeople from history
  const salespeopleList = useMemo(() => {
    const set = new Set<string>();
    history.forEach((q) => {
      if (q.salespersonName && q.salespersonName.trim()) {
        set.add(q.salespersonName.trim());
      }
    });
    return Array.from(set).sort();
  }, [history]);

  // Filter history by Date & Salesperson
  const filteredQuotes = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    return history.filter((q) => {
      if (selectedSalesperson !== 'all') {
        const sp = (q.salespersonName || '').trim();
        if (sp !== selectedSalesperson) return false;
      }

      if (datePreset === 'all') return true;

      const qDate = parseQuoteDate(q);

      if (datePreset === 'today') {
        return qDate >= startOfToday;
      }
      if (datePreset === '7d') {
        const d7 = new Date(startOfToday);
        d7.setDate(d7.getDate() - 6);
        return qDate >= d7;
      }
      if (datePreset === '30d') {
        const d30 = new Date(startOfToday);
        d30.setDate(d30.getDate() - 29);
        return qDate >= d30;
      }
      if (datePreset === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return qDate >= startOfMonth;
      }
      if (datePreset === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        return qDate >= startOfYear;
      }
      if (datePreset === 'custom') {
        let afterStart = true;
        let beforeEnd = true;
        if (customStartDate) {
          const [y, m, d] = customStartDate.split('-').map(Number);
          const start = new Date(y, m - 1, d, 0, 0, 0, 0);
          afterStart = qDate >= start;
        }
        if (customEndDate) {
          const [y, m, d] = customEndDate.split('-').map(Number);
          const end = new Date(y, m - 1, d, 23, 59, 59, 999);
          beforeEnd = qDate <= end;
        }
        return afterStart && beforeEnd;
      }

      return true;
    });
  }, [history, datePreset, customStartDate, customEndDate, selectedSalesperson]);

  // Comprehensive KPI Calculations
  const kpi = useMemo(() => {
    const totalCount = filteredQuotes.length;

    const approvedQuotes = filteredQuotes.filter((q) => q.status === 'approved');
    const sentQuotes = filteredQuotes.filter((q) => (q.status || 'draft') === 'sent');
    const expiredQuotes = filteredQuotes.filter((q) => q.status === 'expired');
    const draftQuotes = filteredQuotes.filter((q) => !q.status || q.status === 'draft');
    const notClosedQuotes = filteredQuotes.filter((q) => q.status !== 'approved');

    const sumTotal = (arr: Quotation[]) => arr.reduce((acc, q) => acc + (Number(q.total) || 0), 0);
    const sumProducts = (arr: Quotation[]) => arr.reduce((acc, q) => acc + (Number(q.subtotalProducts) || 0), 0);
    const sumTax = (arr: Quotation[]) => arr.reduce((acc, q) => acc + (Number(q.taxAmount) || 0), 0);
    const sumDelivery = (arr: Quotation[]) =>
      arr.reduce((acc, q) => acc + (q.includeDelivery ? Number(q.deliveryCost || 0) : 0), 0);
    const sumInstallation = (arr: Quotation[]) =>
      arr.reduce((acc, q) => acc + (Number(q.installationTotal) || 0), 0);
    const sumCardFee = (arr: Quotation[]) =>
      arr.reduce((acc, q) => acc + (q.payWithCard ? Number(q.cardFeeAmount || 0) : 0), 0);

    const totalQuotedRevenue = sumTotal(filteredQuotes);
    const closedRevenue = sumTotal(approvedQuotes);
    const notClosedRevenue = sumTotal(notClosedQuotes);
    const sentRevenue = sumTotal(sentQuotes);
    const expiredRevenue = sumTotal(expiredQuotes);
    const draftRevenue = sumTotal(draftQuotes);

    const winRateCount = totalCount > 0 ? Number(((approvedQuotes.length / totalCount) * 100).toFixed(1)) : 0;
    const winRateValue = totalQuotedRevenue > 0 ? Number(((closedRevenue / totalQuotedRevenue) * 100).toFixed(1)) : 0;

    const avgQuoteTicket = totalCount > 0 ? totalQuotedRevenue / totalCount : 0;
    const avgClosedTicket = approvedQuotes.length > 0 ? closedRevenue / approvedQuotes.length : 0;

    const quotesWithDelivery = filteredQuotes.filter((q) => q.includeDelivery);
    const quotesWithCard = filteredQuotes.filter((q) => q.payWithCard);

    // Salesperson breakdown
    const spMap = new Map<
      string,
      {
        name: string;
        total: number;
        approved: number;
        notClosed: number;
        sent: number;
        expired: number;
        draft: number;
        quotedAmount: number;
        closedAmount: number;
        notClosedAmount: number;
      }
    >();

    filteredQuotes.forEach((q) => {
      const name = (q.salespersonName || 'Sin Asignar').trim();
      const curr = spMap.get(name) || {
        name,
        total: 0,
        approved: 0,
        notClosed: 0,
        sent: 0,
        expired: 0,
        draft: 0,
        quotedAmount: 0,
        closedAmount: 0,
        notClosedAmount: 0
      };
      const status = q.status || 'draft';
      const val = Number(q.total) || 0;
      curr.total += 1;
      curr.quotedAmount += val;
      if (status === 'approved') {
        curr.approved += 1;
        curr.closedAmount += val;
      } else {
        curr.notClosed += 1;
        curr.notClosedAmount += val;
        if (status === 'sent') curr.sent += 1;
        else if (status === 'expired') curr.expired += 1;
        else curr.draft += 1;
      }
      spMap.set(name, curr);
    });

    const salespeopleStats = Array.from(spMap.values()).sort(
      (a, b) => b.closedAmount - a.closedAmount || b.quotedAmount - a.quotedAmount
    );

    // Product Category breakdown
    const catMap = new Map<
      ProductCategory,
      {
        category: ProductCategory;
        itemsCount: number;
        quotedSubtotal: number;
        closedSubtotal: number;
      }
    >();

    (['piso', 'rodapie', 'escalones', 'perfiles', 'wall_panels', 'underlayment', 'otros'] as ProductCategory[]).forEach(
      (cat) => {
        catMap.set(cat, { category: cat, itemsCount: 0, quotedSubtotal: 0, closedSubtotal: 0 });
      }
    );

    const prodMap = new Map<
      string,
      {
        name: string;
        category: string;
        timesQuoted: number;
        timesClosed: number;
        quotedRevenue: number;
        closedRevenue: number;
      }
    >();

    filteredQuotes.forEach((q) => {
      const isApproved = q.status === 'approved';
      (q.items || []).forEach((item) => {
        const cat = (item.category || 'otros') as ProductCategory;
        const cEntry = catMap.get(cat) || {
          category: cat,
          itemsCount: 0,
          quotedSubtotal: 0,
          closedSubtotal: 0
        };
        const sub = Number(item.subtotal) || 0;
        cEntry.itemsCount += 1;
        cEntry.quotedSubtotal += sub;
        if (isApproved) {
          cEntry.closedSubtotal += sub;
        }
        catMap.set(cat, cEntry);

        const pKey = item.productName || 'Producto';
        const pEntry = prodMap.get(pKey) || {
          name: pKey,
          category: cat,
          timesQuoted: 0,
          timesClosed: 0,
          quotedRevenue: 0,
          closedRevenue: 0
        };
        pEntry.timesQuoted += 1;
        pEntry.quotedRevenue += sub;
        if (isApproved) {
          pEntry.timesClosed += 1;
          pEntry.closedRevenue += sub;
        }
        prodMap.set(pKey, pEntry);
      });
    });

    const categoryStats = Array.from(catMap.values()).sort((a, b) => b.quotedSubtotal - a.quotedSubtotal);
    const topProducts = Array.from(prodMap.values())
      .sort((a, b) => b.quotedRevenue - a.quotedRevenue)
      .slice(0, 8);

    // Client Type Breakdown
    const clientTypeMap = new Map<string, { type: string; count: number; closedCount: number; revenue: number }>();
    filteredQuotes.forEach((q) => {
      const cType = q.client?.clientType || (isEn ? 'Homeowner / General' : 'Particular / General');
      const entry = clientTypeMap.get(cType) || { type: cType, count: 0, closedCount: 0, revenue: 0 };
      entry.count += 1;
      if (q.status === 'approved') {
        entry.closedCount += 1;
      }
      entry.revenue += Number(q.total) || 0;
      clientTypeMap.set(cType, entry);
    });
    const clientTypeStats = Array.from(clientTypeMap.values()).sort((a, b) => b.revenue - a.revenue);

    return {
      totalCount,
      approvedCount: approvedQuotes.length,
      notClosedCount: notClosedQuotes.length,
      sentCount: sentQuotes.length,
      expiredCount: expiredQuotes.length,
      draftCount: draftQuotes.length,
      totalQuotedRevenue,
      closedRevenue,
      notClosedRevenue,
      sentRevenue,
      expiredRevenue,
      draftRevenue,
      winRateCount,
      winRateValue,
      avgQuoteTicket,
      avgClosedTicket,
      totalProductsQuoted: sumProducts(filteredQuotes),
      totalProductsClosed: sumProducts(approvedQuotes),
      totalTaxQuoted: sumTax(filteredQuotes),
      totalTaxClosed: sumTax(approvedQuotes),
      totalDeliveryQuoted: sumDelivery(filteredQuotes),
      totalDeliveryClosed: sumDelivery(approvedQuotes),
      totalInstallationQuoted: sumInstallation(filteredQuotes),
      totalInstallationClosed: sumInstallation(approvedQuotes),
      totalCardFeeQuoted: sumCardFee(filteredQuotes),
      totalCardFeeClosed: sumCardFee(approvedQuotes),
      deliveryAdoptionCount: quotesWithDelivery.length,
      cardAdoptionCount: quotesWithCard.length,
      salespeopleStats,
      categoryStats,
      topProducts,
      clientTypeStats
    };
  }, [filteredQuotes, isEn]);

  // Export filtered KPI summary & quotes to CSV
  const handleExportKpiCsv = () => {
    const headers = [
      'Quote Number',
      'Date',
      'Status',
      'Closed (Yes/No)',
      'Client Name',
      'Client Type',
      'Salesperson',
      'Items Count',
      'Products Subtotal',
      'Tax (7%)',
      'Delivery Fee',
      'Installation',
      'Card Fee (3%)',
      'Total USD'
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredQuotes.map((q) => {
      const status = q.status || 'draft';
      const isClosed = status === 'approved' ? 'SI (CERRADA)' : 'NO CERRADA';
      return [
        q.quoteNumber,
        q.date,
        status.toUpperCase(),
        isClosed,
        q.client?.name || '',
        q.client?.clientType || 'General',
        q.salespersonName || '',
        (q.items || []).length,
        (q.subtotalProducts || 0).toFixed(2),
        (q.taxAmount || 0).toFixed(2),
        (q.includeDelivery ? q.deliveryCost || 0 : 0).toFixed(2),
        (q.installationTotal || 0).toFixed(2),
        (q.payWithCard ? q.cardFeeAmount || 0 : 0).toFixed(2),
        (q.total || 0).toFixed(2)
      ]
        .map(escapeCsv)
        .join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QuickSurfaces_KPI_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const activePresetObj = DATE_PRESET_OPTIONS.find((p) => p.id === datePreset) || DATE_PRESET_OPTIONS[0];
  const activePresetLabel = isEn ? activePresetObj.en : activePresetObj.es;
  const activeSalespersonLabel =
    selectedSalesperson === 'all'
      ? isEn
        ? 'All salespeople'
        : 'Todos los vendedores'
      : selectedSalesperson;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#F9F9F8] rounded-2xl w-full max-w-5xl shadow-2xl border border-[#E4E2DA] overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. SINGLE-LINE COMPACT HEADER */}
        <div className="px-4 py-3 bg-[#181818] text-white flex items-center justify-between gap-2 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-wide leading-tight">
              {isEn ? 'KPIs & Metrics' : 'KPIs y Métricas'}
            </h2>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#FF8407] text-white uppercase tracking-wider shrink-0">
              Admin
            </span>
            <span
              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0"
              title={isEn ? 'Analyzed quotes' : 'Cotizaciones analizadas'}
            >
              {kpi.totalCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleExportKpiCsv}
              disabled={filteredQuotes.length === 0}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-[#FF8407] flex items-center justify-center transition-colors cursor-pointer"
              title={isEn ? 'Download CSV' : 'Descargar CSV'}
              aria-label={isEn ? 'Download CSV' : 'Descargar CSV'}
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title={isEn ? 'Close' : 'Cerrar'}
              aria-label={isEn ? 'Close' : 'Cerrar'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. HORIZONTAL SLIDER FILTERS BAR + 3. HORIZONTAL SLIDER TABS */}
        <div ref={filterBarRef} className="bg-white border-b border-[#E4E2DA] shrink-0 space-y-2 py-2.5 px-3.5">
          {/* Period Filter Slider Row */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#9C9A90] shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#FF8407]" />
              <span className="hidden sm:inline">{isEn ? 'Period:' : 'Período:'}</span>
            </span>
            <div className="pill-scroll-row gap-1.5 flex-1">
              {DATE_PRESET_OPTIONS.map((preset) => {
                const isSelected = datePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setDatePreset(preset.id)}
                    className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#181818] text-[#FF8407] border-[#181818] shadow-2xs'
                        : 'bg-[#FAFAFA] text-[#6B6A63] border-[#E4E2DA] hover:bg-[#F2F1EC] hover:text-[#181818]'
                    }`}
                  >
                    {isEn ? preset.en : preset.es}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Salesperson Filter Slider Row */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#9C9A90] shrink-0">
              <Users className="w-3.5 h-3.5 text-[#FF8407]" />
              <span className="hidden sm:inline">{isEn ? 'Seller:' : 'Vendedor:'}</span>
            </span>
            <div className="pill-scroll-row gap-1.5 flex-1">
              <button
                type="button"
                onClick={() => setSelectedSalesperson('all')}
                className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border whitespace-nowrap ${
                  selectedSalesperson === 'all'
                    ? 'bg-[#181818] text-[#FF8407] border-[#181818] shadow-2xs'
                    : 'bg-[#FAFAFA] text-[#6B6A63] border-[#E4E2DA] hover:bg-[#F2F1EC] hover:text-[#181818]'
                }`}
              >
                {isEn ? 'All salespeople' : 'Todos los vendedores'}
              </button>
              {salespeopleList.map((sp) => {
                const isSelected = selectedSalesperson === sp;
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSelectedSalesperson(sp)}
                    className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#181818] text-[#FF8407] border-[#181818] shadow-2xs'
                        : 'bg-[#FAFAFA] text-[#6B6A63] border-[#E4E2DA] hover:bg-[#F2F1EC] hover:text-[#181818]'
                    }`}
                  >
                    {sp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Range Inputs (only shown when 'custom' preset is active) */}
          {datePreset === 'custom' && (
            <div className="pt-1 flex flex-wrap items-center gap-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold text-[#6B6A63] uppercase shrink-0">
                  {isEn ? 'From:' : 'Desde:'}
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-[#FAFAFA] border border-[#E4E2DA] focus:border-[#FF8407] rounded-lg px-2 py-1 text-[#181818]"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold text-[#6B6A63] uppercase shrink-0">
                  {isEn ? 'To:' : 'Hasta:'}
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-[#FAFAFA] border border-[#E4E2DA] focus:border-[#FF8407] rounded-lg px-2 py-1 text-[#181818]"
                />
              </div>

              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="text-[11px] font-bold text-[#FF8407] hover:underline cursor-pointer px-1"
                >
                  {isEn ? 'Clear' : 'Limpiar'}
                </button>
              )}
            </div>
          )}

          {/* 3. HORIZONTAL SLIDER TABS */}
          <div className="pt-2 border-t border-zinc-100 pill-scroll-row gap-1.5">
            {(
              [
                { id: 'overview', es: 'Resumen General & Embudo', en: 'Overview & Funnel', icon: TrendingUp },
                { id: 'salespeople', es: 'Rendimiento por Vendedor', en: 'Salesperson Performance', icon: Users },
                { id: 'products', es: 'Categorías & Productos', en: 'Categories & Products', icon: Layers },
                { id: 'quotes', es: `Cotizaciones (${kpi.totalCount})`, en: `Quotes (${kpi.totalCount})`, icon: FileText }
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 snap-start px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#FF8407] text-white shadow-2xs border border-[#FF8407]'
                      : 'bg-[#FAFAFA] text-[#6B6A63] hover:bg-[#F2F1EC] hover:text-[#181818] border border-[#E4E2DA]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{isEn ? tab.en : tab.es}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body (Extra bottom padding so last card breathes without any footer button) */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 pb-6 space-y-4">
          {/* 6. 2-COLUMN KPI CARDS GRID (Equal size, Icon, Short Label, Big Number, Max 1 Secondary Datum) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* KPI 1: Total Quotes */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E4E2DA] shadow-2xs flex flex-col justify-between min-h-[104px]">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] leading-tight">
                  {isEn ? 'Total Quotes' : 'Total Cotizaciones'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-zinc-100 text-[#181818] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-[#181818] block leading-none">
                  {kpi.totalCount}
                </span>
              </div>
              <span className="text-[11px] font-bold font-mono text-[#6B6A63] truncate block">
                {formatCurrency(kpi.totalQuotedRevenue)}
              </span>
            </div>

            {/* KPI 2: Closed / Approved */}
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-300 shadow-2xs flex flex-col justify-between min-h-[104px]">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 leading-tight">
                  {isEn ? 'Closed' : 'Cerradas'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800 block leading-none">
                  {kpi.approvedCount}
                </span>
              </div>
              <span className="text-[11px] font-black font-mono text-emerald-700 truncate block">
                {formatCurrency(kpi.closedRevenue)}
              </span>
            </div>

            {/* KPI 3: Not Closed */}
            <div className="bg-red-50/60 p-3.5 rounded-xl border border-red-200 shadow-2xs flex flex-col justify-between min-h-[104px]">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 leading-tight">
                  {isEn ? 'Not Closed' : 'No Cerradas'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-red-800 block leading-none">
                  {kpi.notClosedCount}
                </span>
              </div>
              <span className="text-[11px] font-bold font-mono text-red-700 truncate block">
                {formatCurrency(kpi.notClosedRevenue)}
              </span>
            </div>

            {/* KPI 4: Close Rate */}
            <div className="bg-[#181818] text-white p-3.5 rounded-xl border border-zinc-800 shadow-2xs flex flex-col justify-between min-h-[104px]">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 leading-tight">
                  {isEn ? 'Close Rate' : 'Tasa de Cierre'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FF8407] text-white flex items-center justify-center shrink-0">
                  <Percent className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-[#FF8407] block leading-none">
                  {kpi.winRateCount}%
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-300 truncate block">
                {kpi.winRateValue}% {isEn ? 'of $ vol.' : 'del monto $'}
              </span>
            </div>

            {/* KPI 5: Avg Ticket */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E4E2DA] shadow-2xs flex flex-col justify-between min-h-[104px]">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] leading-tight">
                  {isEn ? 'Avg. Ticket' : 'Ticket Promedio'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#FF8407] flex items-center justify-center shrink-0">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <span className="text-lg sm:text-xl font-black font-mono text-[#181818] block leading-none truncate">
                  {formatCurrency(kpi.avgQuoteTicket)}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-bold truncate block">
                {isEn ? 'Closed:' : 'Cerrado:'} {formatCurrency(kpi.avgClosedTicket)}
              </span>
            </div>

            {/* KPI 6: Follow-up / Sent */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E4E2DA] shadow-2xs flex flex-col justify-between min-h-[104px]">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] leading-tight">
                  {isEn ? 'In Follow-up' : 'En Seguimiento'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-[#181818] block leading-none">
                  {kpi.sentCount}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#6B6A63] truncate block">
                {formatCurrency(kpi.sentRevenue)}
              </span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & FUNNEL */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Pipeline Status Bar + 2-Column Status Cards */}
              <div className="bg-white p-4 rounded-xl border border-[#E4E2DA] shadow-2xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#181818]">
                  {isEn ? 'Pipeline by Status' : 'Embudo por Estado'}
                </h3>

                {kpi.totalCount > 0 && (
                  <div className="h-3 w-full rounded-lg overflow-hidden bg-zinc-100 flex">
                    {kpi.approvedCount > 0 && (
                      <div
                        style={{ width: `${(kpi.approvedCount / kpi.totalCount) * 100}%` }}
                        className="bg-emerald-600 h-full transition-all"
                      />
                    )}
                    {kpi.sentCount > 0 && (
                      <div
                        style={{ width: `${(kpi.sentCount / kpi.totalCount) * 100}%` }}
                        className="bg-zinc-600 h-full transition-all"
                      />
                    )}
                    {kpi.expiredCount > 0 && (
                      <div
                        style={{ width: `${(kpi.expiredCount / kpi.totalCount) * 100}%` }}
                        className="bg-red-600 h-full transition-all"
                      />
                    )}
                    {kpi.draftCount > 0 && (
                      <div
                        style={{ width: `${(kpi.draftCount / kpi.totalCount) * 100}%` }}
                        className="bg-blue-500 h-full transition-all"
                      />
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        {isEn ? 'Approved' : 'Aprobadas'}
                      </span>
                      <span className="font-mono text-sm font-black">{kpi.approvedCount}</span>
                    </div>
                    <p className="font-mono font-bold text-xs text-emerald-800 mt-1">
                      {formatCurrency(kpi.closedRevenue)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-300">
                    <div className="flex items-center justify-between font-bold text-zinc-900">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
                        {isEn ? 'Sent' : 'Enviadas'}
                      </span>
                      <span className="font-mono text-sm font-black">{kpi.sentCount}</span>
                    </div>
                    <p className="font-mono font-bold text-xs text-zinc-800 mt-1">
                      {formatCurrency(kpi.sentRevenue)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center justify-between font-bold text-red-900">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                        {isEn ? 'Expired' : 'Vencidas'}
                      </span>
                      <span className="font-mono text-sm font-black">{kpi.expiredCount}</span>
                    </div>
                    <p className="font-mono font-bold text-xs text-red-800 mt-1">
                      {formatCurrency(kpi.expiredRevenue)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between font-bold text-blue-900">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        {isEn ? 'Drafts' : 'Borradores'}
                      </span>
                      <span className="font-mono text-sm font-black">{kpi.draftCount}</span>
                    </div>
                    <p className="font-mono font-bold text-xs text-blue-800 mt-1">
                      {formatCurrency(kpi.draftRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial & Services Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Financial Breakdown: Quoted vs Closed */}
                <div className="bg-white p-4 rounded-xl border border-[#E4E2DA] shadow-2xs space-y-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#181818] flex items-center gap-2 pb-2 border-b border-[#E4E2DA]">
                    <DollarSign className="w-4 h-4 text-[#FF8407]" />
                    <span>{isEn ? 'Financial Breakdown' : 'Desglose Financiero'}</span>
                  </h3>

                  <div className="space-y-1.5 text-xs">
                    <div className="grid grid-cols-3 font-bold text-[10px] uppercase text-[#9C9A90] pb-1 border-b border-zinc-100">
                      <span>{isEn ? 'Concept' : 'Concepto'}</span>
                      <span className="text-right">{isEn ? 'Quoted' : 'Cotizado'}</span>
                      <span className="text-right text-emerald-700">{isEn ? 'Closed' : 'Cerrado'}</span>
                    </div>

                    <div className="grid grid-cols-3 py-1 border-b border-zinc-100">
                      <span className="font-semibold text-[#181818]">{isEn ? 'Materials' : 'Materiales'}</span>
                      <span className="text-right font-mono">{formatCurrency(kpi.totalProductsQuoted)}</span>
                      <span className="text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(kpi.totalProductsClosed)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 py-1 border-b border-zinc-100">
                      <span className="font-semibold text-[#181818]">{isEn ? 'Tax (7%)' : 'Impuesto (7%)'}</span>
                      <span className="text-right font-mono">{formatCurrency(kpi.totalTaxQuoted)}</span>
                      <span className="text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(kpi.totalTaxClosed)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 py-1 border-b border-zinc-100">
                      <span className="font-semibold text-[#181818]">
                        Delivery ({kpi.deliveryAdoptionCount})
                      </span>
                      <span className="text-right font-mono">{formatCurrency(kpi.totalDeliveryQuoted)}</span>
                      <span className="text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(kpi.totalDeliveryClosed)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 py-1 border-b border-zinc-100">
                      <span className="font-semibold text-[#181818]">{isEn ? 'Installation' : 'Instalación'}</span>
                      <span className="text-right font-mono">{formatCurrency(kpi.totalInstallationQuoted)}</span>
                      <span className="text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(kpi.totalInstallationClosed)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 py-1 border-b border-zinc-100">
                      <span className="font-semibold text-[#181818]">
                        {isEn ? 'Card (+3%)' : 'Tarjeta (+3%)'} ({kpi.cardAdoptionCount})
                      </span>
                      <span className="text-right font-mono">{formatCurrency(kpi.totalCardFeeQuoted)}</span>
                      <span className="text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(kpi.totalCardFeeClosed)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 pt-1.5 font-black text-xs sm:text-sm">
                      <span className="text-[#181818]">TOTAL</span>
                      <span className="text-right font-mono text-[#181818]">
                        {formatCurrency(kpi.totalQuotedRevenue)}
                      </span>
                      <span className="text-right font-mono text-emerald-700">
                        {formatCurrency(kpi.closedRevenue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Segments & Services Adoption in 2-col cards */}
                <div className="bg-white p-4 rounded-xl border border-[#E4E2DA] shadow-2xs space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#181818] flex items-center gap-2 pb-2 border-b border-[#E4E2DA]">
                    <Award className="w-4 h-4 text-[#FF8407]" />
                    <span>{isEn ? 'Services & Client Types' : 'Servicios y Tipos de Cliente'}</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E2DA] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#6B6A63]">
                          {isEn ? 'With Delivery' : 'Con Delivery'}
                        </span>
                        <Truck className="w-4 h-4 text-[#FF8407] shrink-0" />
                      </div>
                      <span className="font-mono font-black text-lg text-[#181818] block">
                        {kpi.deliveryAdoptionCount}
                      </span>
                      <span className="text-[11px] font-mono text-[#6B6A63] block">
                        {kpi.totalCount > 0 ? Math.round((kpi.deliveryAdoptionCount / kpi.totalCount) * 100) : 0}%{' '}
                        {isEn ? 'of quotes' : 'del total'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E2DA] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#6B6A63]">
                          {isEn ? 'Card (+3%)' : 'Pago Tarjeta'}
                        </span>
                        <CreditCard className="w-4 h-4 text-[#FF8407] shrink-0" />
                      </div>
                      <span className="font-mono font-black text-lg text-[#181818] block">
                        {kpi.cardAdoptionCount}
                      </span>
                      <span className="text-[11px] font-mono text-[#6B6A63] block">
                        {kpi.totalCount > 0 ? Math.round((kpi.cardAdoptionCount / kpi.totalCount) * 100) : 0}%{' '}
                        {isEn ? 'of quotes' : 'del total'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                      {isEn ? 'By Client Type' : 'Por Tipo de Cliente'}
                    </span>
                    {kpi.clientTypeStats.length === 0 ? (
                      <p className="text-xs text-[#6B6A63]">{isEn ? 'No data' : 'Sin datos'}</p>
                    ) : (
                      <div className="space-y-1.5">
                        {kpi.clientTypeStats.map((ct) => (
                          <div
                            key={ct.type}
                            className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E4E2DA]"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-[#181818]">{ct.type}</span>
                              <span className="text-[11px] text-[#6B6A63] ml-1.5">
                                ({ct.closedCount}/{ct.count} {isEn ? 'closed' : 'cerradas'})
                              </span>
                            </div>
                            <span className="font-mono font-bold text-[#181818] shrink-0">
                              {formatCurrency(ct.revenue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SALESPEOPLE PERFORMANCE */}
          {activeTab === 'salespeople' && (
            <div className="bg-white p-4 rounded-xl border border-[#E4E2DA] shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#181818]">
                {isEn ? 'Salesperson Performance' : 'Rendimiento por Vendedor'}
              </h3>

              {kpi.salespeopleStats.length === 0 ? (
                <p className="text-xs text-[#6B6A63] py-6 text-center">
                  {isEn ? 'No quotes in selected period.' : 'Sin cotizaciones en el período seleccionado.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {kpi.salespeopleStats.map((sp) => {
                    const winRate = sp.total > 0 ? ((sp.approved / sp.total) * 100).toFixed(1) : '0.0';
                    return (
                      <div
                        key={sp.name}
                        className="p-3.5 rounded-xl border border-[#E4E2DA] bg-[#FAFAFA] space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E4E2DA]">
                          <span className="font-black text-sm text-[#181818] truncate">{sp.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#181818] text-[#FF8407] font-mono text-xs font-black shrink-0">
                            {winRate}% {isEn ? 'Win' : 'Cierre'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2.5 rounded-lg border border-[#E4E2DA]">
                            <span className="text-[10px] font-bold uppercase text-[#6B6A63] block">
                              {isEn ? 'Quotes Made' : 'Cotizadas'}
                            </span>
                            <span className="font-mono font-black text-base text-[#181818] block">{sp.total}</span>
                            <span className="font-mono text-[11px] text-[#6B6A63] block">
                              {formatCurrency(sp.quotedAmount)}
                            </span>
                          </div>

                          <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                            <span className="text-[10px] font-bold uppercase text-emerald-900 block">
                              {isEn ? 'Closed' : 'Cerradas'}
                            </span>
                            <span className="font-mono font-black text-base text-emerald-800 block">
                              {sp.approved}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-emerald-700 block">
                              {formatCurrency(sp.closedAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCT CATEGORIES & TOP PRODUCTS */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Category Breakdown */}
              <div className="bg-white p-4 rounded-xl border border-[#E4E2DA] shadow-2xs space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#181818] pb-2 border-b border-[#E4E2DA]">
                  {isEn ? 'By Product Category' : 'Por Categoría de Producto'}
                </h3>
                <div className="space-y-2 text-xs">
                  {kpi.categoryStats.map((c) => (
                    <div
                      key={c.category}
                      className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E4E2DA] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-[#181818] block truncate">
                          {isEn ? CATEGORY_LABELS[c.category]?.en : CATEGORY_LABELS[c.category]?.es}
                        </span>
                        <span className="text-[11px] text-[#6B6A63]">
                          {c.itemsCount} {isEn ? 'items' : 'líneas'}
                        </span>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <span className="font-bold text-[#181818] block">{formatCurrency(c.quotedSubtotal)}</span>
                        <span className="text-[11px] font-bold text-emerald-700 block">
                          {isEn ? 'Closed:' : 'Cerrado:'} {formatCurrency(c.closedSubtotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Quoted Products */}
              <div className="bg-white p-4 rounded-xl border border-[#E4E2DA] shadow-2xs space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#181818] pb-2 border-b border-[#E4E2DA]">
                  {isEn ? 'Top Quoted Products' : 'Productos Más Cotizados'}
                </h3>
                {kpi.topProducts.length === 0 ? (
                  <p className="text-xs text-[#6B6A63] py-6 text-center">
                    {isEn ? 'No product data in period.' : 'Sin datos de productos en el período.'}
                  </p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {kpi.topProducts.map((p, idx) => (
                      <div
                        key={p.name}
                        className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E4E2DA] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#181818] text-[#FF8407] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-[#181818] truncate">{p.name}</span>
                          </div>
                          <span className="text-[11px] text-[#6B6A63] block mt-0.5">
                            {p.timesQuoted} {isEn ? 'quoted' : 'cotiz.'} • {p.timesClosed}{' '}
                            {isEn ? 'closed' : 'cerradas'}
                          </span>
                        </div>
                        <div className="text-right font-mono shrink-0">
                          <span className="font-bold text-[#181818] block">{formatCurrency(p.quotedRevenue)}</span>
                          <span className="text-[11px] font-bold text-emerald-700 block">
                            {formatCurrency(p.closedRevenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: QUOTES IN SELECTED PERIOD */}
          {activeTab === 'quotes' && (
            <div className="bg-white p-4 rounded-xl border border-[#E4E2DA] shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#181818] pb-2 border-b border-[#E4E2DA]">
                {isEn ? 'Quotes in Period' : 'Cotizaciones del Período'}
              </h3>

              {filteredQuotes.length === 0 ? (
                <p className="text-xs text-[#6B6A63] py-8 text-center">
                  {isEn ? 'No quotes match the current filter.' : 'No hay cotizaciones con el filtro actual.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredQuotes.map((q) => {
                    const st = q.status || 'draft';
                    return (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl border border-[#E4E2DA] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-[#FF8407]">#{q.quoteNumber}</span>
                            <span className="font-bold text-[#181818] truncate">{q.client?.name}</span>
                            <span className="text-[11px] text-[#6B6A63]">{q.date}</span>
                          </div>
                          <span className="text-[11px] text-[#6B6A63] block">
                            {isEn ? 'Seller:' : 'Vendedor:'} {q.salespersonName || '—'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200/70">
                          <span className="font-mono font-black text-sm text-[#181818]">
                            {formatCurrency(q.total)}
                          </span>

                          {onUpdateQuoteStatus ? (
                            <select
                              value={st}
                              onChange={(e) => onUpdateQuoteStatus(q.id, e.target.value as QuoteStatus)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer outline-none ${
                                st === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : st === 'expired'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : st === 'sent'
                                  ? 'bg-zinc-100 text-zinc-800 border-zinc-300'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}
                            >
                              <option value="approved">{isEn ? '✓ Closed' : '✓ Cerrada'}</option>
                              <option value="sent">{isEn ? '• Sent' : '• Enviada'}</option>
                              <option value="expired">{isEn ? '✕ Expired' : '✕ Vencida'}</option>
                              <option value="draft">{isEn ? 'Draft' : 'Borrador'}</option>
                            </select>
                          ) : (
                            <span className="font-bold uppercase text-[10px]">{st}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
