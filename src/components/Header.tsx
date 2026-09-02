import React from 'react';
import { 
  Plus, 
  ShoppingBag, 
  Users, 
  History, 
  Settings2, 
  Globe,
  Check
} from 'lucide-react';
import { Client, Language } from '../types';
import { formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { QuickSurfacesLogo } from './QuickSurfacesLogo';

interface HeaderProps {
  quoteNumber: string;
  client: Client | null;
  itemCount: number;
  totalAmount: number;
  salespersonName?: string;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onOpenClientModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenPriceListModal: () => void;
  onNewQuote: () => void;
  onToggleCart: () => void;
  isCartOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  quoteNumber,
  client,
  itemCount,
  totalAmount,
  salespersonName = 'Esteban Gavotti',
  language,
  onToggleLanguage,
  onOpenClientModal,
  onOpenHistoryModal,
  onOpenPriceListModal,
  onNewQuote,
  onToggleCart
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] shadow-xs">
      {/* Top micro bar */}
      <div className="bg-[#000000] text-white px-4 sm:px-8 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FF8407] animate-pulse"></span>
          <span className="text-gray-300 font-semibold tracking-tight">QuickQuote Studio</span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="text-[#8C8C8C] hidden sm:inline text-[11px] uppercase tracking-[1px]">
            {t.appSubtitle}
          </span>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Bilingual Language Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-0.5">
            <button
              id="lang-btn-en"
              type="button"
              onClick={() => onToggleLanguage('en')}
              className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#FF8407] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              id="lang-btn-es"
              type="button"
              onClick={() => onToggleLanguage('es')}
              className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                language === 'es'
                  ? 'bg-[#FF8407] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ES
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#8C8C8C] text-[10px] uppercase tracking-wider hidden xs:inline">
              {t.quoteNumberLabel}
            </span>
            <span className="font-mono text-[#FF8407] font-bold">
              #{quoteNumber || 'QS-2026-DRAFT'}
            </span>
          </div>

          <button 
            id="btn-new-quote"
            onClick={onNewQuote}
            className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 hover:border-zinc-500 cursor-pointer text-[11px] font-medium"
            title="Start new blank quote"
          >
            <Plus className="w-3 h-3 text-[#FF8407]" />
            <span className="hidden sm:inline">{t.newQuoteBtn}</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <QuickSurfacesLogo className="h-9 sm:h-10 w-auto text-black cursor-pointer hover:opacity-95 transition-opacity" />
          <div className="hidden sm:block border-l border-zinc-200 pl-3">
            <span className="text-[11px] font-black uppercase tracking-[1.5px] text-[#FF8407] block leading-none">
              QuickQuote Studio
            </span>
            <p className="text-[10px] tracking-wider uppercase text-zinc-500 font-semibold mt-0.5">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* Client quick selector widget (Desktop) */}
        <div className="flex-1 max-w-xs hidden md:block">
          <button
            id="btn-select-client-header"
            onClick={onOpenClientModal}
            className={`w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
              client 
                ? 'bg-zinc-50 border-[#FF8407]/50 hover:border-[#FF8407]' 
                : 'bg-[#F9F9F9] border-[#E5E5E5] hover:bg-zinc-100 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                client ? 'bg-black text-[#FF8407]' : 'bg-zinc-200 text-zinc-600'
              }`}>
                {client ? client.name.charAt(0).toUpperCase() : <Users className="w-3.5 h-3.5" />}
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase tracking-[0.5px] text-[#8C8C8C] block -mb-0.5">
                  {t.clientLabel}
                </span>
                <p className="text-xs font-bold text-black truncate">
                  {client ? client.name : t.selectClient}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#FF8407] shrink-0 uppercase tracking-wider ml-1">
              {client ? t.changeClient : t.assignClient}
            </span>
          </button>
        </div>

        {/* Salesperson & Top Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Salesperson indicator in desktop */}
          <div className="hidden lg:flex flex-col items-end pr-2 border-r border-[#E5E5E5]">
            <span className="text-[10px] uppercase tracking-[1px] text-[#8C8C8C] font-semibold">
              {t.salesperson}
            </span>
            <span className="text-xs font-bold text-black">{salespersonName}</span>
          </div>

          {/* Mobile Client selector button */}
          <button
            id="btn-select-client-mobile"
            onClick={onOpenClientModal}
            className={`md:hidden p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
              client 
                ? 'bg-black text-white border-black' 
                : 'bg-white border-[#E5E5E5] text-zinc-800'
            }`}
            title="Select Client"
          >
            <Users className="w-4 h-4 text-[#FF8407]" />
            <span className="max-w-[70px] truncate font-bold">
              {client ? client.name.split(' ')[0] : t.clientLabel}
            </span>
          </button>

          {/* History Button */}
          <button
            id="btn-open-history"
            onClick={onOpenHistoryModal}
            className="p-2 sm:px-3 sm:py-2 rounded-lg border border-[#E5E5E5] bg-white text-zinc-800 hover:bg-zinc-50 hover:text-black hover:border-zinc-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Quotation History"
          >
            <History className="w-4 h-4 text-[#8C8C8C]" />
            <span className="hidden sm:inline">{language === 'en' ? 'History' : 'Historial'}</span>
          </button>

          {/* Price List & Database Sync Button */}
          <button
            id="btn-open-pricelist"
            onClick={onOpenPriceListModal}
            className="p-2 sm:px-3 sm:py-2 rounded-lg border border-[#E5E5E5] bg-white text-zinc-800 hover:bg-zinc-50 hover:text-black hover:border-zinc-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Catalog, Pricing & Database Sync"
          >
            <Settings2 className="w-4 h-4 text-[#8C8C8C]" />
            <span className="hidden sm:inline">{language === 'en' ? 'Prices & DB' : 'Precios & BD'}</span>
          </button>

          {/* Cart / Quotation Trigger Button */}
          <button
            id="btn-toggle-cart"
            onClick={onToggleCart}
            className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-xs ${
              itemCount > 0
                ? 'bg-[#FF8407] text-white hover:bg-[#E07300] active:scale-95 shadow-[0_4px_12px_rgba(255,132,7,0.25)]'
                : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-white">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-medium">
              {language === 'en' ? 'Quote' : 'Cotización'}
            </span>
            <span className="font-bold font-mono">
              {formatCurrency(totalAmount)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
