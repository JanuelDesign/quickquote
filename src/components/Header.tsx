import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  MoreHorizontal, 
  Plus, 
  History, 
  Settings2, 
  Check, 
  UserCheck,
  FileText,
  Globe,
  FileSpreadsheet
} from 'lucide-react';
import { Client, Language } from '../types';
import { translations } from '../utils/translations';
import { QuickSurfacesLogo } from './QuickSurfacesLogo';

interface HeaderProps {
  quoteNumber: string;
  client?: Client | null;
  clientName?: string;
  itemCount?: number;
  cartTotal?: number;
  salespersonName?: string;
  onSelectSalesperson?: (name: string) => void;
  language: Language;
  onToggleLanguage: (lang?: Language) => void;
  onOpenClientModal: () => void;
  onOpenHistoryModal?: () => void;
  onOpenPriceListModal?: () => void;
  onOpenHistory?: () => void;
  onOpenPriceManager?: () => void;
  onNewQuote?: () => void;
  onToggleCart?: () => void;
  onOpenCart?: () => void;
  isCartOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  quoteNumber,
  client,
  clientName,
  salespersonName = 'Esteban Gavotti',
  onSelectSalesperson,
  language,
  onToggleLanguage,
  onOpenClientModal,
  onOpenHistoryModal,
  onOpenPriceListModal,
  onOpenHistory,
  onOpenPriceManager,
  onNewQuote
}) => {
  const t = translations[language];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeClientName = client?.name || clientName;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleHistoryClick = () => {
    setIsMenuOpen(false);
    if (onOpenHistoryModal) onOpenHistoryModal();
    else if (onOpenHistory) onOpenHistory();
  };

  const handlePriceManagerClick = () => {
    setIsMenuOpen(false);
    if (onOpenPriceListModal) onOpenPriceListModal();
    else if (onOpenPriceManager) onOpenPriceManager();
  };

  const handleNewQuoteClick = () => {
    setIsMenuOpen(false);
    if (onNewQuote) onNewQuote();
  };

  const salesReps = [
    { name: 'Esteban Gavotti', phone: '(305) 555-0199' },
    { name: 'Ruben Valverde', phone: '(305) 555-0188' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4E2DA] shadow-xs w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between gap-3">
        {/* Brand & Logo in a single slim line */}
        <div className="flex items-center gap-2.5 shrink-0">
          <QuickSurfacesLogo className="h-7 sm:h-8 w-auto text-black cursor-pointer hover:opacity-90 transition-opacity" />
          <div className="hidden xs:flex items-center gap-2 border-l border-[#E4E2DA] pl-2.5">
            <span className="text-xs sm:text-sm font-black tracking-tight text-[#181818]">
              Quick<span className="text-[#FF8407]">Quote</span>
            </span>
            <span className="text-[10px] text-[#9C9A90] font-medium hidden md:inline">
              by Quicksurfaces
            </span>
          </div>
        </div>

        {/* Right Action Icons (Salesperson dropdown, Client button & "···" options menu) */}
        <div className="flex items-center gap-2 min-w-0" ref={menuRef}>
          {/* Salesperson Dropdown directly on header */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#F2F1EC] border border-[#E4E2DA] rounded-full px-2.5 py-1 text-xs shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-[#FF8407] shrink-0" />
            <select
              id="header-sales-rep-select"
              value={salespersonName}
              onChange={(e) => {
                if (onSelectSalesperson) {
                  onSelectSalesperson(e.target.value);
                }
              }}
              className="bg-transparent text-xs font-bold text-[#181818] focus:outline-hidden cursor-pointer"
            >
              {salesReps.map((rep) => (
                <option key={rep.name} value={rep.name}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>

          {/* Client icon button */}
          <button
            id="btn-header-client"
            type="button"
            onClick={onOpenClientModal}
            className={`h-9 px-2.5 sm:px-3 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-w-0 max-w-[180px] sm:max-w-[260px] md:max-w-xs ${
              activeClientName
                ? 'bg-[#F2F1EC] border-[#E4E2DA] text-[#181818] hover:border-[#FF8407]'
                : 'bg-white border-[#E4E2DA] text-[#6B6A63] hover:bg-[#F2F1EC]'
            }`}
            title={activeClientName ? `Cliente: ${activeClientName}` : 'Seleccionar cliente'}
          >
            <div className="w-5 h-5 rounded-full bg-[#181818] text-[#FF8407] flex items-center justify-center text-[10px] font-bold shrink-0">
              {activeClientName ? activeClientName.charAt(0).toUpperCase() : <Users className="w-3 h-3" />}
            </div>
            <span className="truncate font-medium min-w-0">
              {activeClientName || (language === 'en' ? 'Client' : 'Cliente')}
            </span>
          </button>

          {/* Direct Google Sheets & Price List Button */}
          <button
            id="btn-header-sheets"
            type="button"
            onClick={() => {
              if (onOpenPriceListModal) onOpenPriceListModal();
              else if (onOpenPriceManager) onOpenPriceManager();
            }}
            className="h-9 px-2.5 sm:px-3 rounded-full border border-[#E4E2DA] bg-white hover:bg-[#F2F1EC] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer text-[#181818]"
            title="Sincronizar Google Sheets & Precios"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline font-medium">Google Sheets</span>
          </button>

          {/* More options (···) icon button */}
          <div className="relative">
            <button
              id="btn-header-menu"
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                isMenuOpen 
                  ? 'bg-[#181818] text-white border-[#181818]' 
                  : 'bg-white border-[#E4E2DA] text-[#6B6A63] hover:bg-[#F2F1EC] hover:text-[#181818]'
              }`}
              title="Más opciones / Configuración"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Menu Panel */}
            {isMenuOpen && (
              <div 
                id="header-dropdown-menu"
                className="absolute right-0 top-11 w-72 sm:w-80 bg-white border border-[#E4E2DA] rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs text-[#181818] space-y-3"
              >
                {/* Quote Number & Status */}
                <div className="bg-[#F2F1EC] p-2.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FF8407]" />
                    <div>
                      <span className="text-[10px] text-[#9C9A90] uppercase font-bold block">
                        {language === 'en' ? 'Quote' : 'Cotización'}
                      </span>
                      <span className="font-mono font-bold text-black text-xs">
                        #{quoteNumber || 'QS-2026-014'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#181818] text-[#FF8407] uppercase tracking-wider">
                    {language === 'en' ? 'Draft' : 'Borrador'}
                  </span>
                </div>

                {/* Sales Representative Dropdown (Esteban Gavotti vs Ruben Valverde) */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#9C9A90] block">
                    {language === 'en' ? 'Sales Representative' : 'Vendedor Asignado'}
                  </label>
                  <div className="relative">
                    <select
                      id="select-sales-rep"
                      value={salespersonName}
                      onChange={(e) => {
                        if (onSelectSalesperson) {
                          onSelectSalesperson(e.target.value);
                        }
                      }}
                      className="w-full bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg px-3 py-2 text-xs font-semibold text-[#181818] focus:outline-hidden focus:border-[#FF8407] cursor-pointer"
                    >
                      {salesReps.map((rep) => (
                        <option key={rep.name} value={rep.name}>
                          {rep.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center justify-between py-1 border-t border-[#E4E2DA]">
                  <div className="flex items-center gap-1.5 text-[#6B6A63]">
                    <Globe className="w-3.5 h-3.5 text-[#FF8407]" />
                    <span className="font-medium text-xs">
                      {language === 'en' ? 'Language' : 'Idioma'}
                    </span>
                  </div>
                  <div className="flex items-center bg-[#F2F1EC] p-0.5 rounded-lg border border-[#E4E2DA]">
                    <button
                      type="button"
                      onClick={() => onToggleLanguage('en')}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        language === 'en'
                          ? 'bg-[#181818] text-[#FF8407]'
                          : 'text-[#6B6A63] hover:text-black'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLanguage('es')}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        language === 'es'
                          ? 'bg-[#181818] text-[#FF8407]'
                          : 'text-[#6B6A63] hover:text-black'
                      }`}
                    >
                      ES
                    </button>
                  </div>
                </div>

                {/* Fast Action Buttons */}
                <div className="pt-2 border-t border-[#E4E2DA] space-y-1">
                  {onNewQuote && (
                    <button
                      type="button"
                      id="btn-menu-new-quote"
                      onClick={handleNewQuoteClick}
                      className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F2F1EC] text-left flex items-center gap-2 text-xs font-medium text-[#181818] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#FF8407]" />
                      <span>{language === 'en' ? 'New Blank Quote' : 'Nueva Cotización en Blanco'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    id="btn-menu-history"
                    onClick={handleHistoryClick}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F2F1EC] text-left flex items-center gap-2 text-xs font-medium text-[#181818] transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4 text-[#6B6A63]" />
                    <span>{language === 'en' ? 'Quotes History' : 'Historial de Cotizaciones'}</span>
                  </button>

                  <button
                    type="button"
                    id="btn-menu-prices"
                    onClick={handlePriceManagerClick}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F2F1EC] text-left flex items-center gap-2 text-xs font-medium text-[#181818] transition-colors cursor-pointer"
                  >
                    <Settings2 className="w-4 h-4 text-[#6B6A63]" />
                    <span>{language === 'en' ? 'Catalog & Price List' : 'Catálogo y Lista de Precios'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
