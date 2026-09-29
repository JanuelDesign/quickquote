import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  MoreHorizontal, 
  Plus, 
  History, 
  Settings2, 
  UserCheck,
  FileText,
  Globe,
  LogOut,
  ShieldCheck,
  Mail,
  User as UserIcon,
  X
} from 'lucide-react';
import { Client, Language, UserProfile } from '../types';
import { translations } from '../utils/translations';
import { QuickSurfacesLogo } from './QuickSurfacesLogo';

interface HeaderProps {
  quoteNumber: string;
  client?: Client | null;
  clientName?: string;
  itemCount?: number;
  cartTotal?: number;
  currentUser: UserProfile;
  language: Language;
  onToggleLanguage: (lang?: Language) => void;
  onOpenClientModal: () => void;
  onOpenHistoryModal?: () => void;
  onOpenPriceListModal?: () => void;
  onOpenHistory?: () => void;
  onOpenPriceManager?: () => void;
  onOpenUsersManager?: () => void;
  onNewQuote?: () => void;
  onToggleCart?: () => void;
  onOpenCart?: () => void;
  isCartOpen?: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  quoteNumber,
  client,
  clientName,
  currentUser,
  language,
  onToggleLanguage,
  onOpenClientModal,
  onOpenHistoryModal,
  onOpenPriceListModal,
  onOpenHistory,
  onOpenPriceManager,
  onOpenUsersManager,
  onNewQuote,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isEn = language === 'en';
  const t = translations[language];

  // Granular independent permissions
  const isAdmin = currentUser.role === 'admin';
  const canManageCatalog = isAdmin || currentUser.canManageCatalog === true;
  const canManageUsers = isAdmin || currentUser.canManageUsers === true;

  const activeClientName = client?.name || clientName;

  // Handlers for menu actions that also close the menu
  const handleHistoryClick = () => {
    setIsMenuOpen(false);
    if (onOpenHistory) onOpenHistory();
    else if (onOpenHistoryModal) onOpenHistoryModal();
  };

  const handlePriceManagerClick = () => {
    setIsMenuOpen(false);
    if (onOpenPriceManager) onOpenPriceManager();
    else if (onOpenPriceListModal) onOpenPriceListModal();
  };

  const handleUsersManagerClick = () => {
    setIsMenuOpen(false);
    if (onOpenUsersManager) onOpenUsersManager();
  };

  const handleNewQuoteClick = () => {
    setIsMenuOpen(false);
    if (onNewQuote) onNewQuote();
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAFA] border-b border-[#E4E2DA]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 cursor-pointer select-none shrink-0" onClick={handleNewQuoteClick}>
              <QuickSurfacesLogo className="h-6 sm:h-7 w-auto text-[#181818]" />
            </div>

            <div className="hidden md:flex flex-col border-l border-[#E4E2DA] pl-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] font-mono">
                QUICKQUOTE
              </span>
              <span className="text-[11px] font-semibold text-[#6B6A63]">
                {t.brandSubtitle}
              </span>
            </div>
          </div>

          {/* Right Controls: Only the More Options (···) button */}
          <div className="flex items-center shrink-0">
            {/* More options (···) icon button */}
            <button
              id="btn-header-menu"
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                isMenuOpen 
                  ? 'bg-[#181818] text-white border-[#181818]' 
                  : 'bg-white border-[#E4E2DA] text-[#6B6A63] hover:bg-[#F2F1EC] hover:text-[#181818]'
              }`}
              title={isEn ? 'More options & user' : 'Más opciones y usuario'}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL MODAL / BOTTOM SHEET (Replaces corner floating card on mobile) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            id="header-modal-panel"
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl border border-[#E4E2DA] overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="px-5 py-4 bg-[#181818] text-white flex items-center justify-between border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center font-bold">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {isEn ? 'Menu & Session' : 'Menú Principal & Sesión'}
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    QuickSurfaces Sales Terminal
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                id="btn-close-header-modal"
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isEn ? 'Close' : 'Cerrar'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs text-[#181818]">
              {/* Active Session User Card */}
              <div className="bg-[#181818] text-white p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center font-bold text-base shrink-0">
                  {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white text-sm truncate">
                      {currentUser.displayName}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shrink-0 ${
                      isAdmin ? 'bg-[#FF8407] text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {isAdmin ? 'ADMIN' : 'VENDEDOR'}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono truncate block mt-0.5">
                    {currentUser.email}
                  </span>
                  {currentUser.phone && (
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      {currentUser.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Quote Number & Status */}
              <div className="bg-[#F2F1EC] p-3 rounded-xl flex items-center justify-between border border-[#E4E2DA]">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#FF8407]" />
                  <div>
                    <span className="text-[10px] text-[#9C9A90] uppercase font-bold block">
                      {isEn ? 'Active Quote' : 'Cotización Activa'}
                    </span>
                    <span className="font-mono font-bold text-black text-xs">
                      #{quoteNumber || 'QS-2026-014'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#181818] text-[#FF8407] uppercase tracking-wider">
                  {isEn ? 'Draft' : 'Borrador'}
                </span>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E4E2DA]">
                <div className="flex items-center gap-2 text-[#6B6A63]">
                  <Globe className="w-4 h-4 text-[#FF8407]" />
                  <span className="font-bold text-xs text-[#181818]">
                    {isEn ? 'System Language' : 'Idioma del Sistema'}
                  </span>
                </div>
                <div className="flex items-center bg-[#F2F1EC] p-1 rounded-lg border border-[#E4E2DA]">
                  <button
                    type="button"
                    onClick={() => onToggleLanguage('en')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      isEn
                        ? 'bg-[#181818] text-[#FF8407] shadow-xs'
                        : 'text-[#6B6A63] hover:text-black'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleLanguage('es')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      !isEn
                        ? 'bg-[#181818] text-[#FF8407] shadow-xs'
                        : 'text-[#6B6A63] hover:text-black'
                    }`}
                  >
                    Español (ES)
                  </button>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-2 border-t border-[#E4E2DA] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] px-1 block mb-1">
                  {isEn ? 'Terminal Navigation' : 'Navegación del Cotizador'}
                </span>

                {onNewQuote && (
                  <button
                    type="button"
                    id="btn-menu-new-quote"
                    onClick={handleNewQuoteClick}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-[#F2F1EC] bg-[#FAFAFA] border border-[#E4E2DA] text-left flex items-center gap-2.5 text-xs font-bold text-[#181818] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#FF8407]" />
                    <span>{isEn ? 'New Blank Quote' : 'Nueva Cotización en Blanco'}</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btn-menu-history"
                  onClick={handleHistoryClick}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-[#F2F1EC] bg-[#FAFAFA] border border-[#E4E2DA] text-left flex items-center gap-2.5 text-xs font-bold text-[#181818] transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4 text-[#6B6A63]" />
                  <span>{isEn ? 'Quotes History' : 'Historial de Cotizaciones'}</span>
                </button>

                {/* Granular Permission: Catalog & Price List (Independent) */}
                {canManageCatalog && (
                  <button
                    type="button"
                    id="btn-menu-prices"
                    onClick={handlePriceManagerClick}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-[#F2F1EC] bg-[#FAFAFA] border border-[#E4E2DA] text-left flex items-center justify-between text-xs font-bold text-[#181818] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings2 className="w-4 h-4 text-[#FF8407]" />
                      <span>{isEn ? 'Catalog & Price List' : 'Catálogo y Lista de Precios'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#FF8407] uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-[#FF8407]/20">
                      EDIT
                    </span>
                  </button>
                )}

                {/* Granular Permission: User Management (Independent) */}
                {canManageUsers && onOpenUsersManager && (
                  <button
                    type="button"
                    id="btn-menu-users"
                    onClick={handleUsersManagerClick}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-[#F2F1EC] bg-[#FAFAFA] border border-[#E4E2DA] text-left flex items-center justify-between text-xs font-bold text-[#181818] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{isEn ? 'User Management' : 'Gestión de Usuarios'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-600 uppercase bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                      ADMIN
                    </span>
                  </button>
                )}
              </div>

              {/* Log Out Button */}
              <div className="pt-3 border-t border-[#E4E2DA]">
                <button
                  type="button"
                  id="btn-menu-logout"
                  onClick={handleLogoutClick}
                  className="w-full px-4 py-3 rounded-xl hover:bg-red-100 bg-red-50 border border-red-200 text-left flex items-center justify-center gap-2 text-xs font-bold text-red-600 transition-colors cursor-pointer uppercase tracking-wider group"
                >
                  <LogOut className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                  <span>{isEn ? 'Sign Out' : 'Cerrar Sesión'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
