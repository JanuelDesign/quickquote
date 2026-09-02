import React, { useState } from 'react';
import { Product, ProductColor, Language } from '../types';
import { calculateFloorUnits, formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { 
  Check, 
  Plus, 
  Image as ImageIcon,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';

interface FloorCalculatorProps {
  products: Product[];
  language?: Language;
  onAddToCart: (
    product: Product,
    sqftRequired: number,
    pricePerSqft: number,
    color?: ProductColor,
    notes?: string
  ) => void;
}

export const FloorCalculator: React.FC<FloorCalculatorProps> = ({
  products,
  language = 'en',
  onAddToCart
}) => {
  const t = translations[language];
  const floorProducts = products.filter(p => p.category === 'piso');
  
  const [selectedProduct, setSelectedProduct] = useState<Product>(floorProducts[0] || {} as Product);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    floorProducts[0]?.colors?.[0]
  );
  const [sqftInput, setSqftInput] = useState<string>('350');
  const [pricePerSqft, setPricePerSqft] = useState<number>(floorProducts[0]?.basePrice || 1.49);
  const [notes, setNotes] = useState<string>('');
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Update selection when product changes
  const handleProductChange = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedColor(prod.colors?.[0] || undefined);
    setPricePerSqft(prod.basePrice);
  };

  const sqftNumber = parseFloat(sqftInput) || 0;
  const sqftPerBox = selectedProduct.sqftPerBox || 24.26;
  const { boxesNeeded, totalSqftCovered, wastePercent } = calculateFloorUnits(sqftNumber, sqftPerBox);

  // Price calculations
  const boxUnitPrice = Number((sqftPerBox * pricePerSqft).toFixed(2));
  const subtotal = Number((boxesNeeded * boxUnitPrice).toFixed(2));

  const handleAddSqft = (amount: number) => {
    const current = parseFloat(sqftInput) || 0;
    setSqftInput(Math.max(0, current + amount).toString());
  };

  const handleApplyWaste = (percent: number) => {
    const current = parseFloat(sqftInput) || 0;
    if (current > 0) {
      const withWaste = Math.round(current * (1 + percent / 100));
      setSqftInput(withWaste.toString());
    }
  };

  const handlePriceMarkup = (deltaPerSqft: number) => {
    const newPrice = Math.max(0.1, Number((pricePerSqft + deltaPerSqft).toFixed(2)));
    setPricePerSqft(newPrice);
  };

  const handleAddToCart = () => {
    if (sqftNumber <= 0) return;
    onAddToCart(selectedProduct, sqftNumber, pricePerSqft, selectedColor, notes);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Product Selection Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C]">
            {t.selectModel} ({floorProducts.length})
          </span>
          <span className="text-[11px] font-semibold text-[#8C8C8C]">
            SPC • Laminate • Luxury Vinyl
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {floorProducts.map((product, idx) => {
            const isSelected = selectedProduct.id === product.id;
            const badgeText = idx === 0 ? 'BEST SELLER' : idx === 1 ? 'PREMIUM 6.5MM' : product.thickness || 'SPC';

            return (
              <div
                key={product.id}
                id={`floor-card-${product.id}`}
                onClick={() => handleProductChange(product)}
                className={`bg-white border rounded-xl p-4 flex flex-col justify-between relative transition-all cursor-pointer shadow-2xs group hover:border-black ${
                  isSelected
                    ? 'border-black ring-1 ring-black bg-zinc-50/50'
                    : 'border-[#E5E5E5]'
                }`}
              >
                {/* Badge */}
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider absolute top-3 right-3 ${
                  isSelected ? 'bg-[#FF8407] text-white' : 'bg-black text-white'
                }`}>
                  {badgeText}
                </span>

                <div className="pr-16">
                  <h3 className="text-base font-bold text-black leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#8C8C8C] mt-1">
                    {product.sqftPerBox} sq ft / {t.boxesText.toLowerCase()} • {product.thickness || '5mm'} {product.wearLayer && `• ${product.wearLayer}`}
                  </p>
                </div>

                {/* Color swatches preview */}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex items-center gap-1.5 my-3 pt-2.5 border-t border-[#E5E5E5]">
                    <span className="text-[10px] font-semibold uppercase text-[#8C8C8C]">
                      {language === 'en' ? 'Colors:' : 'Colores:'}
                    </span>
                    <div className="flex items-center -space-x-1">
                      {product.colors.slice(0, 5).map((c, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs shrink-0"
                          style={{ backgroundColor: c.hex }}
                          title={`${c.code} - ${c.name}`}
                        />
                      ))}
                    </div>
                    {product.colors.length > 5 && (
                      <span className="text-[10px] text-[#8C8C8C] font-semibold">
                        +{product.colors.length - 5}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[#E5E5E5]">
                  <div>
                    <span className="text-lg font-bold text-black font-mono">
                      ${product.basePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#8C8C8C] ml-1">/ sq ft</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductChange(product);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF8407] text-white'
                        : 'bg-black text-white hover:bg-zinc-800'
                    }`}
                  >
                    {isSelected ? (language === 'en' ? 'Selected' : 'Seleccionado') : (language === 'en' ? 'Select' : 'Seleccionar')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Color Swatch & Photo Selector */}
      {selectedProduct.colors && selectedProduct.colors.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block">
                {t.selectColor}
              </span>
              <p className="text-xs text-black font-bold mt-0.5">
                {selectedColor ? `${selectedColor.code} - ${selectedColor.name}` : (language === 'en' ? 'Select a color' : 'Selecciona un color')}
              </p>
            </div>
            {selectedColor?.plankPhotoUrl && (
              <span className="text-[10px] text-[#8C8C8C] flex items-center gap-1 font-medium">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF8407]" />
                {t.roomPreview}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {selectedProduct.colors.map((color) => {
              const isColorSelected = selectedColor?.code === color.code;
              return (
                <div
                  key={color.code}
                  id={`color-btn-${color.code}`}
                  onClick={() => setSelectedColor(color)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedColor(color);
                    }
                  }}
                  className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 cursor-pointer relative group ${
                    isColorSelected
                      ? 'border-black bg-zinc-50 ring-1 ring-black shadow-xs'
                      : 'border-[#E5E5E5] hover:border-zinc-400 bg-white'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-[#E5E5E5] shrink-0 shadow-2xs"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="truncate flex-1 min-w-0">
                    <span className="text-xs font-bold text-black block truncate leading-tight">
                      {color.name}
                    </span>
                    <span className="text-[10px] text-[#8C8C8C] font-mono">
                      {color.code}
                    </span>
                  </div>

                  {(color.roomPhotoUrl || color.plankPhotoUrl) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePreviewImage(color.roomPhotoUrl || color.plankPhotoUrl || null);
                      }}
                      className="text-[#8C8C8C] hover:text-[#FF8407] p-0.5 transition-colors cursor-pointer"
                      title={t.roomPreview}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. REDESIGNED ULTRA-INTUITIVE QUANTITY & CALCULATION MODULE */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E5E5E5] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-black text-[#FF8407] flex items-center justify-center font-bold text-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">
                {t.enterQuantity}
              </h3>
              <p className="text-[11px] text-[#8C8C8C]">
                {selectedProduct.name} • {selectedProduct.sqftPerBox || 24.26} sq ft / {language === 'en' ? 'box' : 'caja'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] text-[#8C8C8C] font-semibold">{language === 'en' ? 'Quick Add:' : 'Añadir Rápido:'}</span>
            <button
              type="button"
              onClick={() => handleApplyWaste(10)}
              className="px-2 py-1 rounded bg-amber-500/10 text-[#FF8407] border border-[#FF8407]/30 text-[10px] font-bold hover:bg-amber-500/20 cursor-pointer"
              title="Add 10% standard waste buffer"
            >
              +10% Waste
            </button>
          </div>
        </div>

        {/* 4-Card Visual Grid for Quantity, Conversion, Price & Subtotal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Square Footage Input */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2 flex flex-col justify-between">
            <div>
              <label htmlFor="input-floor-sqft" className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#8C8C8C] block">
                {t.requiredSqft}
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  id="input-floor-sqft"
                  value={sqftInput}
                  onChange={(e) => setSqftInput(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  className="w-full text-2xl font-black text-black bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C8C8C]">
                  SQFT
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {[+50, +100, +250, +500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddSqft(amt)}
                  className="px-2 py-1 bg-white border border-[#E5E5E5] hover:border-black rounded text-[10px] font-bold text-black cursor-pointer shadow-2xs transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Box Computation Display */}
          <div className="p-4 rounded-xl bg-black text-white border border-black space-y-2 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#8C8C8C]">
                  {t.boxesNeededLabel}
                </span>
                <Package className="w-4 h-4 text-[#FF8407]" />
              </div>

              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#FF8407] font-mono">
                  {boxesNeeded}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  {t.boxesText}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-0.5">
              <div className="flex justify-between text-[11px] text-gray-300">
                <span>{language === 'en' ? 'Covers:' : 'Cubre:'}</span>
                <strong className="text-white font-mono">{totalSqftCovered} sqft</strong>
              </div>
              <div className="flex justify-between text-[10px] text-[#8C8C8C]">
                <span>{t.yieldPerBox}: {sqftPerBox} sqft</span>
                {wastePercent > 0 && (
                  <span className="text-amber-400 font-medium">+{wastePercent}% waste</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Sell Price per SqFt & Markup */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2 flex flex-col justify-between">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#8C8C8C] block">
                {t.pricePerSqft}
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8C8C8C]">
                  $
                </span>
                <input
                  type="number"
                  value={pricePerSqft}
                  onChange={(e) => setPricePerSqft(parseFloat(e.target.value) || 0)}
                  step="0.05"
                  className="w-full text-xl font-black text-black bg-white border border-[#E5E5E5] focus:border-black rounded-lg pl-7 pr-2 py-2 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-[#8C8C8C] mb-1">
                <span>Box Unit: <strong className="text-black font-mono">${boxUnitPrice.toFixed(2)}</strong></span>
              </div>
              <div className="flex gap-1">
                {[+0.10, +0.25, +0.50].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handlePriceMarkup(m)}
                    className="flex-1 py-0.5 bg-amber-500/10 border border-[#FF8407]/20 rounded text-[10px] font-bold text-[#FF8407] hover:bg-amber-500/20 cursor-pointer"
                  >
                    +${m.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Subtotal & Big CTA Action */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-[#E5E5E5] space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#8C8C8C] block">
                {t.subtotalLabel}
              </span>
              <div className="mt-0.5">
                <span className="text-2xl font-black text-black font-mono">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-add-floor-to-cart"
              onClick={handleAddToCart}
              disabled={sqftNumber <= 0}
              className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 ${
                addedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : sqftNumber > 0
                  ? 'bg-[#FF8407] text-white hover:bg-[#E07300] shadow-[0_4px_12px_rgba(255,132,7,0.3)]'
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.addedToCart}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{language === 'en' ? `Add ${boxesNeeded} Boxes` : `Agregar ${boxesNeeded} Cajas`}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Notes Input */}
        <div className="pt-2 border-t border-[#E5E5E5]">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            className="w-full text-xs text-black bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2 outline-none focus:border-black focus:bg-white"
          />
        </div>
      </div>

      {/* Room Photo Preview Modal */}
      {activePreviewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActivePreviewImage(null)}
        >
          <div 
            className="bg-white rounded-xl overflow-hidden max-w-2xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-black text-white flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase">
                {selectedColor ? `${selectedColor.name} - QuickSurfaces` : 'Visualización'}
              </span>
              <button
                onClick={() => setActivePreviewImage(null)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-zinc-100">
              <img 
                src={activePreviewImage} 
                alt="Room View" 
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
