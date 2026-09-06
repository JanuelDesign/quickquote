import React from 'react';
import { ProductCategory, Language } from '../types';
import { 
  Layers, 
  Ruler, 
  CornerDownRight, 
  MoveUpRight,
  LayoutGrid,
  ShieldCheck
} from 'lucide-react';
import { translations } from '../utils/translations';

interface CategoryTabsProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenCustomItem?: () => void;
  itemCounts?: Record<ProductCategory, number>;
  language?: Language;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  itemCounts = { piso: 0, rodapie: 0, perfiles: 0, escalones: 0, wall_panels: 0, underlayment: 0, otros: 0 },
  language = 'en'
}) => {
  const t = translations[language];

  const categories: Array<{
    id: ProductCategory;
    name: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
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
    }
  ];

  return (
    <div className="w-full">
      {/* 2-col on mobile, 3-col on sm/md, 6-col on lg screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count = itemCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              type="button"
              id={`cat-chip-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-left transition-all duration-150 cursor-pointer border select-none ${
                isActive
                  ? 'bg-[#FF8407] border-[#FF8407] text-white shadow-md shadow-[#FF8407]/20 ring-2 ring-[#FF8407]/30'
                  : 'bg-[#F2F1EC] hover:bg-[#EAE8E1] border-[#E4E2DA] text-[#6B6A63] hover:text-[#181818]'
              }`}
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-black/20 text-white' : 'bg-white text-[#181818] shadow-2xs'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-[#FF8407]'}`} />
                </div>
                <div className="truncate min-w-0">
                  <span className={`text-xs sm:text-sm font-bold block truncate leading-tight ${
                    isActive ? 'text-white' : 'text-[#181818]'
                  }`}>
                    {cat.name}
                  </span>
                  <span className={`text-[10px] block truncate mt-0.5 ${
                    isActive ? 'text-white/80' : 'text-[#9C9A90]'
                  }`}>
                    {cat.sublabel}
                  </span>
                </div>
              </div>

              {count > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-black rounded-full shrink-0 flex items-center justify-center ${
                    isActive
                      ? 'bg-white text-[#FF8407] shadow-2xs'
                      : 'bg-[#181818] text-white'
                  }`}
                  title={`${count} items in quote`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
