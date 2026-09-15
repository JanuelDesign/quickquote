import React from 'react';
import { Product, ProductCategory, Language } from '../types';
import { 
  Layers, 
  Ruler, 
  CornerDownRight, 
  MoveUpRight, 
  LayoutGrid, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  ArrowRight,
  PackageSearch,
  RotateCcw
} from 'lucide-react';
import { getCategoryDisplayName } from '../utils/productSearch';
import { formatCurrency } from '../utils/calculations';

interface CrossCategorySearchResultsProps {
  searchTerm: string;
  products: Product[];
  activeCategory: ProductCategory;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (category: ProductCategory) => void;
  onClearSearch: () => void;
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

const CATEGORY_COLORS: Record<ProductCategory, { bg: string; text: string; border: string }> = {
  piso: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  rodapie: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  perfiles: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  escalones: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  wall_panels: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  underlayment: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  otros: { bg: 'bg-zinc-100', text: 'text-zinc-800', border: 'border-zinc-300' }
};

export const CrossCategorySearchResults: React.FC<CrossCategorySearchResultsProps> = ({
  searchTerm,
  products,
  activeCategory,
  onSelectProduct,
  onSelectCategory,
  onClearSearch,
  language = 'es'
}) => {
  const currentLang: Language = language === 'en' ? 'en' : 'es';
  const activeCategoryName = getCategoryDisplayName(activeCategory, currentLang);

  // If completely empty results across all categories
  if (products.length === 0) {
    return (
      <div 
        id="search-empty-state" 
        className="bg-white rounded-xl p-8 sm:p-12 border border-[#E4E2DA] shadow-xs text-center space-y-4 animate-fadeIn"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#F2F1EC] text-[#6B6A63] flex items-center justify-center mx-auto shadow-2xs">
          <PackageSearch className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-base sm:text-lg font-bold text-[#181818]">
            {language === 'en'
              ? `No products found for "${searchTerm}"`
              : `No se encontraron productos para "${searchTerm}"`}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B6A63]">
            {language === 'en'
              ? 'Check the spelling, or try searching by collection, thickness, color, or category.'
              : 'Verifica la ortografía o intenta buscar por colección, espesor, color o categoría.'}
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            id="btn-empty-clear-search"
            onClick={onClearSearch}
            className="px-4 py-2 bg-[#181818] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Clear search' : 'Limpiar búsqueda'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Notice Card explaining cross-category discovery */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F2F1EC] text-[#181818] flex items-center justify-center font-bold shrink-0">
              <Search className="w-4 h-4 text-[#6B6A63]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#181818] leading-tight">
                {language === 'en'
                  ? `Found ${products.length} product${products.length > 1 ? 's' : ''} matching "${searchTerm}"`
                  : `Se encontraron ${products.length} producto${products.length > 1 ? 's' : ''} para "${searchTerm}"`}
              </h3>
              <p className="text-xs text-[#6B6A63] mt-0.5">
                {language === 'en'
                  ? `Showing results from all categories. Select any product below to begin quoting:`
                  : `Mostrando resultados en el catálogo. Selecciona un producto para cotizar:`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearSearch}
            className="text-xs text-[#6B6A63] hover:text-[#181818] underline font-medium cursor-pointer self-start sm:self-auto"
          >
            {language === 'en' ? 'Clear search' : 'Limpiar búsqueda'}
          </button>
        </div>
      </div>

      {/* Grid of Matching Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {products.map((product) => {
          const Icon = CATEGORY_ICONS[product.category] || Sparkles;
          const catStyle = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.otros;
          const catLabel = getCategoryDisplayName(product.category, currentLang);

          return (
            <div
              key={product.id}
              id={`search-card-${product.id}`}
              className="bg-white rounded-xl p-4 sm:p-4.5 border border-[#E4E2DA] hover:border-[#181818]/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Header: Category Badge & Price */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{catLabel}</span>
                  </span>

                  <div className="text-right">
                    <span className="text-sm font-black text-[#181818]">
                      {formatCurrency(product.basePrice)}
                    </span>
                    <span className="text-[11px] text-[#6B6A63] font-medium ml-1">
                      /{product.priceUnit}
                    </span>
                  </div>
                </div>

                {/* Product Title & Subcategory */}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#181818] group-hover:text-black leading-snug">
                    {product.name}
                  </h4>
                  {product.subcategory && (
                    <p className="text-xs text-[#6B6A63] font-medium mt-0.5">
                      {product.subcategory}
                    </p>
                  )}
                </div>

                {/* Specs and details */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B6A63]">
                  {product.thickness && (
                    <span className="bg-[#F2F1EC] px-2 py-0.5 rounded-md font-semibold text-[#181818]">
                      {product.thickness}
                    </span>
                  )}
                  {product.wearLayer && (
                    <span className="bg-[#F2F1EC] px-2 py-0.5 rounded-md text-[#6B6A63]">
                      Cap: {product.wearLayer}
                    </span>
                  )}
                  {product.size && (
                    <span className="bg-[#F2F1EC] px-2 py-0.5 rounded-md text-[#6B6A63]">
                      {product.size}
                    </span>
                  )}
                  {product.yieldPerUnit && (
                    <span className="bg-[#F2F1EC] px-2 py-0.5 rounded-md text-[#6B6A63]">
                      {product.yieldPerUnit}
                    </span>
                  )}
                  {product.stripLengthFeet && (
                    <span className="bg-[#F2F1EC] px-2 py-0.5 rounded-md text-[#6B6A63]">
                      {product.stripLengthFeet} ft
                    </span>
                  )}
                </div>

                {/* Color swatches preview if any */}
                {product.colors && product.colors.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-[#9C9A90] uppercase font-bold block mb-1">
                      {product.colors.length} {language === 'en' ? 'finishes available' : 'acabados disponibles'}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.colors.slice(0, 6).map((c) => (
                        <div
                          key={c.code}
                          title={`${c.code} - ${c.name}`}
                          className="w-5 h-5 rounded-md border border-[#E4E2DA] shadow-2xs shrink-0"
                          style={{ backgroundColor: c.hex || '#ccc' }}
                        />
                      ))}
                      {product.colors.length > 6 && (
                        <span className="text-[10px] text-[#6B6A63] font-bold">
                          +{product.colors.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Cotizar / Seleccionar */}
              <div className="pt-4 mt-2 border-t border-[#F2F1EC]">
                <button
                  type="button"
                  id={`btn-select-searched-${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  className="w-full py-2 px-3 bg-[#181818] hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group-hover:bg-[#FF8407]"
                >
                  <span>{language === 'en' ? 'Select & Quote' : 'Seleccionar y Cotizar'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
