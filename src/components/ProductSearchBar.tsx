import React, { useRef } from 'react';
import { ProductCategory, Language } from '../types';
import { Search, X, Layers, Ruler, CornerDownRight, MoveUpRight, LayoutGrid, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { getCategoryDisplayName } from '../utils/productSearch';

interface ProductSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  totalProductsCount: number;
  totalMatchesCount: number;
  matchesInActiveCategory: number;
  activeCategory: ProductCategory;
  categoryMatchCounts: Record<ProductCategory, number>;
  onSelectCategory: (cat: ProductCategory) => void;
  onViewAllResults?: () => void;
  isViewingAllResults?: boolean;
  language?: Language;
}

const CATEGORY_ICONS: Record<ProductCategory, React.ComponentType<{ className?: string }>> = {
  piso: Layers,
  rodapie: Ruler,
  perfiles: CornerDownRight,
  escalones: MoveUpRight,
  wall_panels: LayoutGrid,
  underlayment: ShieldCheck,
  otros: Sparkles
};

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onClear,
  totalProductsCount,
  totalMatchesCount,
  matchesInActiveCategory,
  activeCategory,
  categoryMatchCounts,
  onSelectCategory,
  onViewAllResults,
  isViewingAllResults = false,
  language = 'es'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isSearching = searchTerm.trim().length > 0;

  // Find other categories that have matches (excluding current activeCategory)
  const otherCategoriesWithMatches = (Object.entries(categoryMatchCounts) as [ProductCategory, number][])
    .filter(([cat, count]) => cat !== activeCategory && Number(count) > 0)
    .map(([cat, count]) => ({
      category: cat,
      count: Number(count)
    }));

  const otherMatchesCount = otherCategoriesWithMatches.reduce((acc: number, curr) => acc + curr.count, 0);

  const handleClear = () => {
    onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Search Bar Input Container */}
      <div className="relative flex items-center w-full">
        {/* Neutral Gray/Black Magnifying Glass Icon (Non-orange) */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-[#6B6A63]">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          id="main-product-search-input"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            language === 'en'
              ? 'Search product... (e.g. Pulse Select, Baseboard, T-Molding...)'
              : 'Buscar producto... (ej. Pulse Select, Rodapié, T-Molding...)'
          }
          className="w-full bg-white border border-[#E4E2DA] hover:border-[#181818]/40 focus:border-[#181818] focus:ring-1 focus:ring-[#181818]/15 rounded-xl pl-10 pr-24 sm:pr-32 py-2.5 text-xs sm:text-sm text-[#181818] placeholder-[#9C9A90] transition-all shadow-2xs outline-none"
        />

        {/* Right Action Icons & Match Counter */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isSearching && (
            <>
              {/* Badge with count */}
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F2F1EC] text-[#181818] border border-[#E4E2DA]">
                {totalMatchesCount} {language === 'en' ? (totalMatchesCount === 1 ? 'result' : 'results') : (totalMatchesCount === 1 ? 'resultado' : 'resultados')}
              </span>

              {/* Clear button */}
              <button
                type="button"
                id="btn-clear-product-search"
                onClick={handleClear}
                className="p-1 rounded-md text-[#9C9A90] hover:text-[#181818] hover:bg-zinc-100 transition-colors cursor-pointer"
                title={language === 'en' ? 'Clear search' : 'Limpiar búsqueda'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cross-Category Discovery Pill Bar (shown only when searching and matches exist in other categories) */}
      {isSearching && otherMatchesCount > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 bg-[#F9F8F5] rounded-xl border border-[#EAE8E1] text-xs">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-[#6B6A63] text-[11px] font-medium shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#181818]" />
              {matchesInActiveCategory > 0
                ? (language === 'en' ? 'Also found in:' : 'También se encontraron en:')
                : (language === 'en' ? 'Found in other categories:' : 'Se encontraron en otras categorías:')
              }
            </span>

            {/* Category switch chips */}
            {otherCategoriesWithMatches.map(({ category, count }) => {
              const Icon = CATEGORY_ICONS[category];
              const catName = getCategoryDisplayName(category, language as Language);
              return (
                <button
                  key={category}
                  type="button"
                  id={`btn-jump-to-cat-${category}`}
                  onClick={() => onSelectCategory(category)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white hover:bg-zinc-50 border border-[#E4E2DA] hover:border-[#181818] text-[11px] font-bold text-[#181818] shadow-2xs transition-colors cursor-pointer"
                >
                  <Icon className="w-3 h-3 text-[#6B6A63]" />
                  <span>{catName}</span>
                  <span className="bg-[#F2F1EC] text-[#181818] px-1 py-0.2 rounded text-[10px] font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Toggle to view all categories matching in one place */}
          {onViewAllResults && (
            <button
              type="button"
              id="btn-toggle-view-all-search"
              onClick={onViewAllResults}
              className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isViewingAllResults
                  ? 'bg-[#181818] text-white shadow-2xs'
                  : 'bg-white text-[#181818] border border-[#E4E2DA] hover:border-[#181818]'
              }`}
            >
              {isViewingAllResults
                ? (language === 'en' ? 'Back to Category' : 'Volver a Categoría')
                : (language === 'en' ? `View All (${totalMatchesCount})` : `Ver Todos (${totalMatchesCount})`)
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
};
