import React from 'react';
import { ProductCategory, Language } from '../types';
import { 
  Layers, 
  Ruler, 
  CornerDownRight, 
  MoveUpRight
} from 'lucide-react';
import { translations } from '../utils/translations';

interface CategoryTabsProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenCustomItem: () => void;
  itemCounts?: Record<ProductCategory, number>;
  language?: Language;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenCustomItem,
  itemCounts = { piso: 0, rodapie: 0, perfiles: 0, escalones: 0, otros: 0 },
  language = 'en'
}) => {
  const t = translations[language];

  const tabs = [
    {
      id: 'piso' as ProductCategory,
      label: t.tabFloors,
      sublabel: t.tabFloorsSub,
      icon: Layers
    },
    {
      id: 'rodapie' as ProductCategory,
      label: t.tabBaseboard,
      sublabel: t.tabBaseboardSub,
      icon: Ruler
    },
    {
      id: 'perfiles' as ProductCategory,
      label: t.tabProfiles,
      sublabel: t.tabProfilesSub,
      icon: CornerDownRight
    },
    {
      id: 'escalones' as ProductCategory,
      label: t.tabStairs,
      sublabel: t.tabStairsSub,
      icon: MoveUpRight
    }
  ];

  return (
    <div className="bg-white border-b border-[#E5E5E5] px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Segmented Category Pill Container */}
        <div className="bg-[#F3F4F6] p-1 rounded-xl flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            const count = itemCounts[tab.id] || 0;

            return (
              <button
                key={tab.id}
                id={`tab-category-${tab.id}`}
                onClick={() => onSelectCategory(tab.id)}
                className={`flex-1 min-w-[100px] sm:min-w-[125px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-transparent text-[#8C8C8C] hover:text-black hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF8407]' : 'text-[#8C8C8C]'}`} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-[#FF8407] text-white' : 'bg-black text-white'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Product / Service Action */}
        <button
          id="btn-add-custom-item-tab"
          onClick={onOpenCustomItem}
          className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-black hover:bg-black hover:text-white border border-[#E5E5E5] hover:border-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Add custom product, installation labor or specialty fee"
        >
          <span className="text-[#FF8407] font-black text-sm">+</span>
          <span>{t.customProductTabBtn}</span>
        </button>
      </div>
    </div>
  );
};
