import React from 'react';
import { ProductCategory, Language } from '../types';
import { 
  Layers, 
  Ruler, 
  CornerDownRight, 
  MoveUpRight,
  LayoutGrid,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { translations } from '../utils/translations';

interface CategoryTabsProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenCustomItem?: () => void;
  itemCounts?: Record<ProductCategory, number>;
  matchCounts?: Record<ProductCategory, number>;
  isSearching?: boolean;
  language?: Language;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  itemCounts = { piso: 0, rodapie: 0, perfiles: 0, escalones: 0, wall_panels: 0, underlayment: 0, otros: 0 },
  matchCounts,
  isSearching = false,
  language = 'en'
}) => {
  const t = translations[language];

  const categories: Array<{
    id: ProductCategory;
    name: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    isCustom?: boolean;
  }> = [
    {
      id: 'piso',
      name: language === 'en' ? 'Flooring' : 'Piso',
      sublabel: 'SPC • Laminado',
      icon: Layers
    },
    {
      id: 'rodapie',
      name: language === 'en' ? 'Baseboard' : 'Rodapié',
      sublabel: '16 ft strips',
      icon: Ruler
    },
    {
      id: 'perfiles',
      name: language === 'en' ? 'Profiles & Trims' : 'Perfiles',
      sublabel: 'Transiciones',
      icon: CornerDownRight
    },
    {
      id: 'escalones',
      name: language === 'en' ? 'Stair Treads' : 'Escaleras',
      sublabel: 'Paquete peldaños',
      icon: MoveUpRight
    },
    {
      id: 'wall_panels',
      name: 'Wall Panels',
      sublabel: language === 'en' ? 'Fluted & Slat' : 'Pared Acústica',
      icon: LayoutGrid
    },
    {
      id: 'underlayment',
      name: 'Underlayment',
      sublabel: language === 'en' ? 'Rolls & Foam' : 'Aislantes y Vapor',
      icon: ShieldCheck
    },
    {
      id: 'otros',
      name: language === 'en' ? 'Custom Item / Labor' : 'Custom Item / Labor',
      sublabel: language === 'en' ? 'Labor & Services' : 'Mano de obra • Extra',
      icon: Wrench,
      isCustom: true
    }
  ];

  const sliderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const activeChip = document.getElementById(`cat-chip-${activeCategory}`);
    if (activeChip && sliderRef.current) {
      activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeCategory]);

  return (
    <div className="w-full">
      {/* Single-row horizontal slider for all categories (Flooring, Baseboard, Profiles, Stairs, Wall Panels, Underlayment, Custom Labor) */}
      <div
        ref={sliderRef}
        className="flex flex-nowrap items-stretch gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 px-0.5"
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const isCustom = cat.isCustom || false;
          const count = itemCounts[cat.id] || 0;
          const matchCount = matchCounts ? (matchCounts[cat.id] || 0) : 0;
          const isFadedOut = isSearching && matchCount === 0 && !isActive;

          // Distinct styling for custom category vs standard catalog
          const buttonStyle = isActive
            ? 'bg-[#FF8407] border-[#FF8407] text-white shadow-md shadow-[#FF8407]/20 ring-2 ring-[#FF8407]/30'
            : isCustom
            ? 'bg-amber-50/90 hover:bg-amber-100/90 border-amber-300 text-amber-950 shadow-2xs'
            : isFadedOut
            ? 'bg-[#F9F8F5] opacity-60 hover:opacity-100 hover:bg-[#F2F1EC] border-[#EAE8E1] text-[#9C9A90] hover:text-[#181818]'
            : 'bg-[#F2F1EC] hover:bg-[#EAE8E1] border-[#E4E2DA] text-[#6B6A63] hover:text-[#181818]';

          const iconContainerStyle = isActive
            ? 'bg-black/20 text-white'
            : isCustom
            ? 'bg-amber-500/20 text-amber-700 shadow-2xs'
            : 'bg-white text-[#181818] shadow-2xs';

          const iconStyle = isActive
            ? 'text-white'
            : isCustom
            ? 'text-amber-600'
            : 'text-[#FF8407]';

          return (
            <button
              key={cat.id}
              type="button"
              id={`cat-chip-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 snap-start flex items-center justify-between gap-2.5 px-3.5 py-2.5 sm:py-3 rounded-xl text-left transition-all duration-150 cursor-pointer border select-none min-w-[155px] sm:min-w-[172px] ${buttonStyle}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${iconContainerStyle}`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconStyle}`} />
                </div>
                <div className="min-w-0">
                  <span className={`text-xs sm:text-sm font-bold block leading-tight whitespace-nowrap ${
                    isActive ? 'text-white' : isCustom ? 'text-amber-950' : 'text-[#181818]'
                  }`}>
                    {cat.name}
                  </span>
                  <span className={`text-[10px] block leading-snug whitespace-nowrap mt-0.5 ${
                    isActive ? 'text-white/80' : isCustom ? 'text-amber-800/80 font-medium' : 'text-[#9C9A90]'
                  }`}>
                    {isSearching ? `${matchCount} ${language === 'en' ? 'matches' : 'coincidencias'}` : cat.sublabel}
                  </span>
                </div>
              </div>

              {/* Badges */}
              {isSearching ? (
                matchCount > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-black rounded-full shrink-0 flex items-center justify-center ${
                      isActive
                        ? 'bg-white text-[#FF8407] shadow-2xs'
                        : isCustom
                        ? 'bg-amber-600 text-white'
                        : 'bg-[#181818] text-white'
                    }`}
                    title={`${matchCount} ${language === 'en' ? 'products found' : 'productos encontrados'}`}
                  >
                    {matchCount}
                  </span>
                )
              ) : (
                count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-black rounded-full shrink-0 flex items-center justify-center ${
                      isActive
                        ? 'bg-white text-[#FF8407] shadow-2xs'
                        : isCustom
                        ? 'bg-amber-700 text-white'
                        : 'bg-[#181818] text-white'
                    }`}
                    title={`${count} items in quote`}
                  >
                    {count}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

