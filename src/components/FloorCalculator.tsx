import React, { useState } from 'react';
import { Product, ProductColor, Language } from '../types';
import { calculateFloorUnits, formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { 
  Check, 
  ArrowLeft, 
  Layers, 
  ChevronRight,
  TrendingUp
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
  
  // Step workflow: 1 = Model, 2 = Color, 3 = Dims/Price
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product>(floorProducts[0] || {} as Product);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    floorProducts[0]?.colors?.[0]
  );
  const [sqftInput, setSqftInput] = useState<string>('300');
  const [pricePerSqft, setPricePerSqft] = useState<number>(floorProducts[0]?.basePrice || 1.49);
  const [notes, setNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Helper to scroll smoothly to active calculator top on mobile/desktop
  const scrollToCalculatorTop = () => {
    setTimeout(() => {
      const target = document.getElementById('active-calculator-container') || document.getElementById('category-tabs-container');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 40);
  };

  // Update selection when product changes - jump directly to Step 3 for immediate quantity entry!
  const handleProductSelect = (prod: Product, chosenColor?: ProductColor) => {
    setSelectedProduct(prod);
    const colorToSet = chosenColor || prod.colors?.[0] || undefined;
    setSelectedColor(colorToSet);
    setPricePerSqft(prod.basePrice);
    setCurrentStep(3);
    scrollToCalculatorTop();
  };

  const handleColorSelect = (color: ProductColor) => {
    setSelectedColor(color);
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

  const handlePriceMarkup = (delta: number) => {
    setPricePerSqft(prev => Math.max(0.1, Number((prev + delta).toFixed(2))));
  };

  const handleAddToCart = () => {
    if (sqftNumber <= 0) return;
    onAddToCart(selectedProduct, sqftNumber, pricePerSqft, selectedColor, notes);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      // Reset back to step 1 for smooth next item entry
      setCurrentStep(1);
    }, 900);
  };

  return (
    <div className="space-y-4">
      {/* Step Navigation Card - 2 Distinct Rows */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
        {/* Row 1: Step indication on Left, Progress Dots on Right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                id="btn-floor-back"
                onClick={() => setCurrentStep((prev) => (prev === 3 && selectedProduct.colors?.length ? 2 : 1))}
                className="h-7 px-2.5 rounded-lg border border-[#E4E2DA] hover:border-[#181818] bg-[#F2F1EC] text-[#181818] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Back' : 'Atrás'}</span>
              </button>
            )}
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#9C9A90]">
              {language === 'en' ? `Step ${currentStep} of 3` : `Paso ${currentStep} de 3`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (step < currentStep) setCurrentStep(step as 1 | 2 | 3);
                }}
                className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-all ${
                  currentStep === step
                    ? 'bg-[#FF8407] text-white shadow-xs'
                    : currentStep > step
                    ? 'bg-[#181818] text-white cursor-pointer hover:bg-black'
                    : 'bg-[#F2F1EC] text-[#9C9A90] cursor-default'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category Icon (36px) on Left + Title/Subtitle in Column on Right with min 10px spacing */}
        <div className="flex items-center gap-3.5 pt-2 border-t border-[#F2F1EC]">
          <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-lg bg-[#181818] text-[#FF8407] flex items-center justify-center font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#181818] leading-tight truncate">
              {currentStep === 1 && (language === 'en' ? '1. Select Flooring Model' : '1. Seleccionar modelo de piso')}
              {currentStep === 2 && (language === 'en' ? '2. Select Color & Finish' : '2. Seleccionar color y acabado')}
              {currentStep === 3 && (language === 'en' ? '3. Quantity & Pricing' : '3. Cantidad y precio')}
            </h3>
            <p className="text-xs text-[#6B6A63] font-medium leading-normal mt-0.5 truncate">
              {currentStep === 1 && `${floorProducts.length} ${language === 'en' ? 'collections available' : 'colecciones disponibles'}`}
              {currentStep === 2 && `${selectedProduct.name} (${selectedProduct.colors?.length || 0} ${language === 'en' ? 'colors' : 'colores'})`}
              {currentStep === 3 && `${selectedProduct.name}${selectedColor ? ` • ${selectedColor.name}` : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Model */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {floorProducts.map((product, idx) => {
            const isSelected = selectedProduct.id === product.id;
            const badgeText = idx === 0 ? 'BEST SELLER' : idx === 1 ? 'PREMIUM 6.5MM' : product.thickness || 'SPC';

            return (
              <div
                key={product.id}
                id={`floor-card-${product.id}`}
                onClick={() => handleProductSelect(product)}
                className={`bg-white border rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer shadow-xs hover:border-[#181818] ${
                  isSelected
                    ? 'border-[#FF8407] ring-2 ring-[#FF8407]/20 bg-amber-50/10'
                    : 'border-[#E4E2DA]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-[#181818] leading-snug">
                      {product.name}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider shrink-0 ${
                      idx === 0 ? 'bg-[#FF8407] text-white' : 'bg-[#181818] text-white'
                    }`}>
                      {badgeText}
                    </span>
                  </div>

                  {/* Technical measurement specification cleanly BELOW title and description */}
                  <p className="text-xs text-[#6B6A63] leading-relaxed">
                    {product.sqftPerBox} sq ft / caja • {product.thickness || '5.5 mm'} {product.wearLayer && `• ${product.wearLayer}`}
                  </p>
                </div>

                {/* Color swatches preview - interactive to select color directly */}
                {product.colors && product.colors.length > 0 && (
                  <div className="my-3 pt-2.5 border-t border-[#E4E2DA] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center -space-x-1.5">
                        {product.colors.slice(0, 6).map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductSelect(product, c);
                            }}
                            className="w-5 h-5 rounded-full border-2 border-white shadow-xs shrink-0 cursor-pointer hover:scale-125 transition-transform"
                            style={{ backgroundColor: c.hex }}
                            title={`${c.code} - ${c.name} (${language === 'en' ? 'Click to select' : 'Clic para seleccionar'})`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#6B6A63] font-semibold ml-1">
                        {product.colors.length} {language === 'en' ? 'colors' : 'colores'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-2 border-t border-[#E4E2DA]">
                  <div>
                    <span className="text-lg font-bold text-[#181818] font-mono">
                      ${product.basePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#6B6A63] ml-1">/ sq ft</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductSelect(product);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-[#181818] hover:bg-black text-white flex items-center gap-1.5"
                  >
                    <span>{language === 'en' ? 'Select Model' : 'Seleccionar'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#FF8407]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 2: Select Color & Finish */}
      {currentStep === 2 && selectedProduct.colors && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DA]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                {language === 'en' ? 'Selected Collection:' : 'Colección seleccionada:'}
              </span>
              <h3 className="text-sm font-bold text-[#181818]">{selectedProduct.name}</h3>
            </div>
            {selectedColor && (
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {language === 'en' ? 'Active Color:' : 'Color activo:'}
                </span>
                <p className="text-xs font-bold text-[#FF8407]">
                  {selectedColor.code} • {selectedColor.name}
                </p>
              </div>
            )}
          </div>

          {/* Color Grid with high quality solid swatches (no broken images) and full names */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {selectedProduct.colors.map((color) => {
              const isColorSelected = selectedColor?.code === color.code;
              return (
                <div
                  key={color.code}
                  id={`color-btn-${color.code}`}
                  onClick={() => handleColorSelect(color)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 relative select-none ${
                    isColorSelected
                      ? 'border-[#181818] bg-[#F2F1EC] ring-2 ring-[#181818] shadow-sm'
                      : 'border-[#E4E2DA] bg-white hover:border-[#9C9A90]'
                  }`}
                >
                  {/* Clean, high-contrast real color swatch (at least 32px) */}
                  <div
                    className="w-8 h-8 rounded-lg border border-black/10 shrink-0 shadow-xs flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isColorSelected && (
                      <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                    )}
                  </div>

                  {/* Full color name without cut off / ellipsis */}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-[#181818] block leading-tight">
                      {color.name}
                    </span>
                    <span className="text-[10px] text-[#6B6A63] font-mono mt-0.5 block">
                      {color.code}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E4E2DA] flex justify-end">
            <button
              type="button"
              id="btn-color-continue"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-[#FF8407] hover:bg-[#E07300] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{language === 'en' ? 'Continue to Quantity & Price' : 'Continuar a Cantidad y Precio'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Quantity, Pricing & Calculations */}
      {currentStep === 3 && (
        <div className="space-y-4">
          {/* Top summary badge */}
          <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#181818]">{selectedProduct.name}</span>
              {selectedColor && (
                <>
                  <span className="text-[#9C9A90]">•</span>
                  <span className="flex items-center gap-1.5 font-medium text-[#6B6A63]">
                    <span className="w-3.5 h-3.5 rounded-full inline-block border border-black/20" style={{ backgroundColor: selectedColor.hex }}></span>
                    {selectedColor.name} ({selectedColor.code})
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-[11px] font-bold text-[#FF8407] hover:underline cursor-pointer"
            >
              {language === 'en' ? 'Change Model' : 'Cambiar Modelo'}
            </button>
          </div>

          {/* Quick Color Selector directly inside Step 3 for 1-tap switching */}
          {selectedProduct.colors && selectedProduct.colors.length > 0 && (
            <div className="bg-white border border-[#E4E2DA] rounded-xl p-3 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#181818] flex items-center gap-1.5">
                  <span>{language === 'en' ? 'Color / Finish:' : 'Color / Acabado:'}</span>
                  {selectedColor && (
                    <span className="text-[#FF8407] font-semibold">
                      {selectedColor.code} • {selectedColor.name}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-[#9C9A90]">
                  {selectedProduct.colors.length} {language === 'en' ? 'available' : 'disponibles'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                {selectedProduct.colors.map((c) => {
                  const isCur = selectedColor?.code === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleColorSelect(c)}
                      className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                        isCur
                          ? 'border-[#FF8407] bg-amber-50/50 text-[#181818] ring-1 ring-[#FF8407] font-bold shadow-2xs'
                          : 'border-[#E4E2DA] bg-[#FAFAFA] text-[#6B6A63] hover:border-[#181818]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate max-w-[120px]">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unified Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EDITABLE INPUTS: Card 1 - Sqft Needed */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="input-floor-sqft" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {language === 'en' ? 'Required Area (Sq Ft)' : 'Área Necesaria (Sq Ft)'}
                </label>
                <span className="text-[10px] text-[#6B6A63] font-medium">
                  {selectedProduct.sqftPerBox} sqft / caja
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="input-floor-sqft"
                  value={sqftInput}
                  onChange={(e) => setSqftInput(e.target.value)}
                  placeholder="0"
                  className="w-full text-2xl font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                />
              </div>

              {/* Quick Add Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#9C9A90] font-semibold uppercase">Rápido:</span>
                {[50, 100, 250, 500].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleAddSqft(amount)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F2F1EC] hover:bg-[#E4E2DA] text-[#181818] transition-colors cursor-pointer"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* CALCULATED RESULT: Card 2 - Boxes Required (Dark Card with Orange Number) */}
            <div className="bg-[#181818] text-white rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A8A8]">
                  {language === 'en' ? 'Boxes Required (Standard Rounding)' : 'Cajas Requeridas (Redondeo)'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white font-mono">
                  {boxesNeeded} {boxesNeeded === 1 ? 'caja' : 'cajas'}
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#FF8407] font-mono leading-none">
                  {boxesNeeded} <span className="text-lg font-medium text-white">{language === 'en' ? 'Boxes' : 'Cajas'}</span>
                </div>
                <div className="text-xs text-[#C9C9C9] mt-2 flex items-center justify-between">
                  <span>Cubre: <strong>{totalSqftCovered} sq ft</strong></span>
                  <span>Rinde: <strong>{sqftPerBox} sqft/caja</strong></span>
                </div>
              </div>

              <div className="text-[11px] text-[#A8A8A8] pt-2 border-t border-zinc-800 flex justify-between">
                <span>Merma estimada:</span>
                <span className="font-mono text-zinc-300">+{wastePercent}% buffer</span>
              </div>
            </div>

            {/* EDITABLE INPUTS: Card 3 - Sales Price per Sq Ft */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="input-floor-price" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {language === 'en' ? 'Selling Price per Sq Ft' : 'Precio de Venta / Sq Ft'}
                </label>
                <span className="text-[10px] text-[#6B6A63] font-mono">
                  ${boxUnitPrice.toFixed(2)} / caja
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#9C9A90]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    id="input-floor-price"
                    value={pricePerSqft}
                    onChange={(e) => setPricePerSqft(parseFloat(e.target.value) || 0)}
                    className="w-full text-2xl font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl pl-8 pr-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                  />
                </div>
              </div>

              {/* Quick Markup Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#9C9A90] font-semibold uppercase">Margen:</span>
                {[0.10, 0.25, 0.50].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handlePriceMarkup(delta)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F2F1EC] hover:bg-[#E4E2DA] text-[#181818] transition-colors cursor-pointer"
                  >
                    +${delta.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* CALCULATED RESULT: Card 4 - Subtotal Line */}
            <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                {language === 'en' ? 'Floor Subtotal' : 'Subtotal Pisos'}
              </span>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#181818] font-mono">
                  {formatCurrency(subtotal)}
                </div>
                <p className="text-[11px] text-[#6B6A63] mt-1">
                  {boxesNeeded} cajas × ${boxUnitPrice.toFixed(2)}/caja
                </p>
              </div>

              <div className="text-[10px] text-[#9C9A90] pt-2 border-t border-[#E4E2DA]">
                * Gravable con el 7% de sales tax de Florida en el total
              </div>
            </div>
          </div>

          {/* EDITABLE: Customer note with clean placeholder that doesn't truncate */}
          <div className="bg-white rounded-xl p-4 border border-[#E4E2DA] shadow-xs space-y-1.5">
            <label htmlFor="floor-notes" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
              {language === 'en' ? 'Optional note for customer:' : 'Nota para el cliente (opcional):'}
            </label>
            <input
              type="text"
              id="floor-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'en' ? 'e.g., Master bedroom, living room' : 'Ej: Habitación principal, sala'}
              className="w-full bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg px-3 py-2 text-xs text-[#181818] placeholder:text-[#9C9A90] focus:outline-hidden focus:border-[#FF8407]"
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            id="btn-add-floor-to-quote"
            onClick={handleAddToCart}
            disabled={sqftNumber <= 0}
            className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
              addedSuccess
                ? 'bg-[#1E8E5A] text-white'
                : sqftNumber <= 0
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-[#FF8407] hover:bg-[#E07300] text-white'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>{language === 'en' ? '✓ Added to Quote!' : '✓ ¡Agregado a la cotización!'}</span>
              </>
            ) : (
              <>
                <span>
                  {language === 'en'
                    ? `+ Add ${boxesNeeded} Boxes to Quote (${formatCurrency(subtotal)})`
                    : `+ Agregar ${boxesNeeded} Cajas a la Cotización (${formatCurrency(subtotal)})`}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
