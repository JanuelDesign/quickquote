import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, ProductColor, ProductCategory, Language } from '../types';
import {
  Search,
  X,
  Layers,
  Ruler,
  CornerDownRight,
  MoveUpRight,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import { matchesProductSearch, getMatchingColorsForProduct, getCategoryDisplayName } from '../utils/productSearch';
import { formatCurrency } from '../utils/calculations';

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
  products?: Product[];
  onSelectProduct?: (product: Product, color?: ProductColor) => void;
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

const ALL_CATEGORIES: ProductCategory[] = [
  'piso',
  'rodapie',
  'perfiles',
  'escalones',
  'wall_panels',
  'underlayment',
  'otros'
];

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onClear,
  totalProductsCount,
  products = [],
  onSelectProduct,
  language = 'es'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQuery, setModalQuery] = useState('');
  const [modalCategoryFilter, setModalCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const modalInputRef = useRef<HTMLInputElement>(null);

  const isEn = language === 'en';

  // Sync external searchTerm if changed
  useEffect(() => {
    if (searchTerm && !isModalOpen) {
      setModalQuery(searchTerm);
    }
  }, [searchTerm, isModalOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 40);
    }
  }, [isModalOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const filteredModalProducts = useMemo(() => {
    const q = modalQuery.trim();
    return products.filter((p) => {
      const matchesCat = modalCategoryFilter === 'all' || p.category === modalCategoryFilter;
      if (!matchesCat) return false;
      if (!q) return true;
      return matchesProductSearch(p, q);
    });
  }, [products, modalQuery, modalCategoryFilter]);

  const modalCategoryCounts = useMemo(() => {
    const q = modalQuery.trim();
    const counts: Record<ProductCategory | 'all', number> = {
      all: 0,
      piso: 0,
      rodapie: 0,
      perfiles: 0,
      escalones: 0,
      wall_panels: 0,
      underlayment: 0,
      otros: 0
    };
    products.forEach((p) => {
      if (!q || matchesProductSearch(p, q)) {
        counts.all += 1;
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products, modalQuery]);

  const handleChooseProduct = (product: Product, chosenColor?: ProductColor) => {
    const matchingColors = modalQuery.trim() ? getMatchingColorsForProduct(product, modalQuery) : [];
    const effectiveColor = chosenColor || matchingColors[0] || product.colors?.[0];
    setIsModalOpen(false);
    setModalQuery('');
    onClear();
    if (onSelectProduct) {
      onSelectProduct(product, effectiveColor);
    }
  };

  const getUnitLabel = (product: Product) => {
    if (product.category === 'piso') return 'sqft';
    if (product.category === 'rodapie') return 'LF';
    if (product.category === 'escalones') return isEn ? 'step' : 'escalón';
    if (product.category === 'underlayment') return isEn ? 'roll' : 'rollo';
    if (product.category === 'wall_panels') return 'panel';
    return isEn ? 'pc' : 'pza';
  };

  return (
    <div className="w-full">
      {/* Search Trigger Bar on Main Screen -> Opens Search Modal */}
      <button
        type="button"
        id="main-product-search-input"
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-white border border-[#E4E2DA] hover:border-[#181818] rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-all shadow-2xs cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Search className="w-4 h-4 text-[#FF8407] shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-xs sm:text-sm text-[#6B6A63] group-hover:text-[#181818] truncate">
            {isEn
              ? 'Search product, color or model to quote directly...'
              : 'Buscar producto, color o modelo para elegir cantidad...'}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#181818] text-[#FF8407] shrink-0">
          <span>{isEn ? 'Search' : 'Buscar'}</span>
          <span className="text-zinc-400 font-mono">({totalProductsCount})</span>
        </span>
      </button>

      {/* FULL PRODUCT SEARCH MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto pt-3 sm:pt-6 animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#F9F9F8] rounded-2xl w-full max-w-3xl shadow-2xl border border-[#E4E2DA] overflow-hidden my-0 sm:my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3.5 bg-[#181818] text-white flex items-center justify-between gap-2 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {isEn ? 'Quick Product & Color Search' : 'Buscador Rápido de Productos'}
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                    {isEn
                      ? 'Select any product or color to jump straight to quantity'
                      : 'Escoge el producto o color y pasa directo a seleccionar la cantidad'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title={isEn ? 'Close' : 'Cerrar'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input + Horizontal Category Slider */}
            <div className="p-3.5 bg-white border-b border-[#E4E2DA] space-y-2.5 shrink-0">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#FF8407] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={modalInputRef}
                  type="text"
                  value={modalQuery}
                  onChange={(e) => {
                    setModalQuery(e.target.value);
                    onSearchChange(e.target.value);
                  }}
                  placeholder={
                    isEn
                      ? 'Type model, color, thickness or SKU (e.g. Euphoric, Oak, Rodapié, 6.5mm)...'
                      : 'Escribe modelo, color, espesor o categoría (ej. Euphoric, Oak, Rodapié, 6.5mm)...'
                  }
                  className="w-full bg-[#FAFAFA] border-2 border-[#181818] focus:border-[#FF8407] rounded-xl pl-10 pr-24 py-2.5 text-xs sm:text-sm font-medium text-[#181818] placeholder-[#9C9A90] outline-none transition-colors"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F2F1EC] text-[#181818] border border-[#E4E2DA]">
                    {filteredModalProducts.length}
                  </span>
                  {modalQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalQuery('');
                        onClear();
                        modalInputRef.current?.focus();
                      }}
                      className="p-1 rounded-md text-[#9C9A90] hover:text-[#181818] hover:bg-zinc-200 cursor-pointer"
                      title={isEn ? 'Clear' : 'Limpiar'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Horizontal Slider */}
              <div className="pill-scroll-row gap-1.5">
                <button
                  type="button"
                  onClick={() => setModalCategoryFilter('all')}
                  className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border whitespace-nowrap ${
                    modalCategoryFilter === 'all'
                      ? 'bg-[#181818] text-[#FF8407] border-[#181818]'
                      : 'bg-[#FAFAFA] text-[#6B6A63] border-[#E4E2DA] hover:bg-[#F2F1EC] hover:text-[#181818]'
                  }`}
                >
                  {isEn ? 'All' : 'Todos'} ({modalCategoryCounts.all})
                </button>

                {ALL_CATEGORIES.map((cat) => {
                  const count = modalCategoryCounts[cat] || 0;
                  if (count === 0 && modalCategoryFilter !== cat) return null;
                  const Icon = CATEGORY_ICONS[cat];
                  const isSelected = modalCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setModalCategoryFilter(cat)}
                      className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer border whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#FF8407] text-white border-[#FF8407] shadow-2xs'
                          : 'bg-[#FAFAFA] text-[#6B6A63] border-[#E4E2DA] hover:bg-[#F2F1EC] hover:text-[#181818]'
                      }`}
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      <span>{getCategoryDisplayName(cat, language as Language)}</span>
                      <span className="font-mono text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Results Body */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5">
              {filteredModalProducts.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E4E2DA] p-8 text-center space-y-2">
                  <Search className="w-7 h-7 text-[#9C9A90] mx-auto" />
                  <p className="text-sm font-bold text-[#181818]">
                    {isEn ? 'No products match your search' : 'No se encontraron productos con esa búsqueda'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setModalQuery('');
                      setModalCategoryFilter('all');
                      onClear();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#181818] text-[#FF8407] text-xs font-bold cursor-pointer"
                  >
                    {isEn ? 'Show all products' : 'Ver todos los productos'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredModalProducts.map((product) => {
                    const Icon = CATEGORY_ICONS[product.category] || Layers;
                    const matchingColors = modalQuery.trim()
                      ? getMatchingColorsForProduct(product, modalQuery)
                      : [];
                    const colorsToDisplay =
                      matchingColors.length > 0 ? matchingColors : product.colors || [];

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleChooseProduct(product)}
                        className="bg-white rounded-xl border border-[#E4E2DA] hover:border-[#FF8407] p-3.5 flex flex-col justify-between gap-2.5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F1EC] text-[#181818] border border-[#E4E2DA] text-[10px] font-bold uppercase">
                              <Icon className="w-3 h-3 text-[#FF8407] shrink-0" />
                              <span>{getCategoryDisplayName(product.category, language as Language)}</span>
                            </span>

                            <div className="text-right shrink-0">
                              <span className="font-mono font-black text-sm text-[#181818]">
                                {formatCurrency(product.basePrice)}
                              </span>
                              <span className="text-[10px] font-semibold text-[#6B6A63] ml-0.5">
                                / {getUnitLabel(product)}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-[#181818] group-hover:text-[#FF8407] transition-colors leading-snug">
                            {product.name}
                          </h4>

                          <p className="text-[11px] text-[#6B6A63] leading-snug">
                            {[
                              product.sqftPerBox ? `${product.sqftPerBox} sqft/caja` : null,
                              product.stripLengthFeet ? `${product.stripLengthFeet} ft/tira` : null,
                              product.thickness,
                              product.size
                            ]
                              .filter(Boolean)
                              .join(' • ')}
                          </p>
                        </div>

                        {/* Interactive Color Chips: clicking a color selects that exact color and jumps to Quantity */}
                        {colorsToDisplay.length > 0 && (
                          <div
                            className="pt-2 border-t border-[#F2F1EC] space-y-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[10px] font-bold uppercase text-[#9C9A90] block">
                              {matchingColors.length > 0
                                ? isEn
                                  ? `Matching finishes (${matchingColors.length}) — tap to choose:`
                                  : `Colores encontrados (${matchingColors.length}) — toca para elegir:`
                                : isEn
                                ? `Available finishes (${colorsToDisplay.length}) — tap to choose:`
                                : `Colores disponibles (${colorsToDisplay.length}) — toca para elegir:`}
                            </span>
                            <div className="pill-scroll-row gap-1.5 py-0.5">
                              {colorsToDisplay.map((color) => {
                                const isHighlighted = matchingColors.some(
                                  (mc) => mc.code === color.code && mc.name === color.name
                                );
                                return (
                                  <button
                                    key={`${product.id}-${color.code}-${color.name}`}
                                    type="button"
                                    onClick={() => handleChooseProduct(product, color)}
                                    className={`shrink-0 snap-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                                      isHighlighted
                                        ? 'bg-[#181818] text-[#FF8407] border-[#181818]'
                                        : 'bg-[#FAFAFA] hover:bg-[#181818] text-[#181818] hover:text-white border-[#E4E2DA]'
                                    }`}
                                  >
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                      style={{ backgroundColor: color.hex || '#ccc' }}
                                    />
                                    <span>{color.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-[#F2F1EC] flex items-center justify-between text-[11px] font-bold text-[#FF8407]">
                          <span>
                            {isEn ? 'Select & enter quantity' : 'Seleccionar e ingresar cantidad'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
