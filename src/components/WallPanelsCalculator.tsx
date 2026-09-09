import React, { useState } from 'react';
import { Product, ProductColor, Language } from '../types';
import { formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { 
  Check, 
  ArrowLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Info,
  LayoutGrid,
  Ruler
} from 'lucide-react';

interface WallPanelsCalculatorProps {
  products: Product[];
  language?: Language;
  onAddToCart: (
    product: Product,
    pieceCount: number,
    unitPrice: number,
    color?: ProductColor,
    notes?: string
  ) => void;
}

export const WallPanelsCalculator: React.FC<WallPanelsCalculatorProps> = ({
  products,
  language = 'en',
  onAddToCart
}) => {
  const t = translations[language];
  const panelProducts = products.filter(p => p.category === 'wall_panels');
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product>(panelProducts[0] || {} as Product);
  const [quantity, setQuantity] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(panelProducts[0]?.basePrice || 17.00);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    panelProducts[0]?.colors?.[0]
  );
  
  // Optional Wall Dimensions Helper
  const [wallWidthFeet, setWallWidthFeet] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);

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

  const handleProductSelect = (prod: Product) => {
    setSelectedProduct(prod);
    setUnitPrice(prod.basePrice);
    setSelectedColor(prod.colors?.[0]);
    setCurrentStep(2);
    scrollToCalculatorTop();
  };

  const handleCalcFromWidth = (widthFt: number) => {
    if (!widthFt || widthFt <= 0) return;
    // For 6 5/8" wide panels (approx 0.552 ft): widthFt / 0.552
    // For 12" wide panels (1 ft): widthFt / 1
    // For 48" wide sheets (4 ft): widthFt / 4
    let panelWidthInFeet = 0.552;
    if (selectedProduct.id.includes('acoustic')) panelWidthInFeet = 1.0;
    if (selectedProduct.id.includes('marble')) panelWidthInFeet = 4.0;
    if (selectedProduct.id.includes('trim')) panelWidthInFeet = 1.0;

    const rawPanels = Math.ceil(widthFt / panelWidthInFeet);
    const withBuffer = Math.ceil(rawPanels * 1.10); // +10% waste buffer
    setQuantity(withBuffer);
  };

  const subtotal = Number((quantity * unitPrice).toFixed(2));

  const handleAddQty = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handlePriceMarkup = (delta: number) => {
    setUnitPrice(prev => Math.max(1, Number((prev + delta).toFixed(2))));
  };

  const handleAddToCart = () => {
    if (quantity <= 0) return;
    onAddToCart(selectedProduct, quantity, unitPrice, selectedColor, notes);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setCurrentStep(1);
    }, 900);
  };

  return (
    <div className="space-y-4">
      {/* Step Navigation Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <button
                type="button"
                id="btn-panel-back"
                onClick={() => setCurrentStep(1)}
                className="w-7 h-7 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
                title="Volver al catálogo de paneles"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {currentStep === 1 ? 'Paso 1 de 2' : 'Paso 2 de 2'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === 1 ? 'bg-[#FF8407] text-white' : 'bg-emerald-500 text-white'
            }`}>
              {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            <div className="w-6 h-0.5 bg-zinc-200" />
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === 2 ? 'bg-[#FF8407] text-white' : 'bg-zinc-200 text-zinc-500'
            }`}>
              2
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black text-[#FF8407] flex items-center justify-center shrink-0">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span>
              {currentStep === 1 
                ? (language === 'en' ? '1. Select Wall Panel Model' : '1. Selecciona el Modelo de Wall Panel') 
                : (language === 'en' ? '2. Dimensions, Color & Pricing' : '2. Cantidad, Color & Precios')}
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {currentStep === 1
              ? `${panelProducts.length} modelos de paneles decorativos disponibles`
              : selectedProduct.name}
          </p>
        </div>
      </div>

      {/* STEP 1: MODEL CATALOG */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {panelProducts.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <div
                key={prod.id}
                id={`panel-card-${prod.id}`}
                onClick={() => handleProductSelect(prod)}
                className={`bg-white rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected 
                    ? 'border-[#FF8407] ring-2 ring-[#FF8407]/20 shadow-md' 
                    : 'border-[#E4E2DA] hover:border-zinc-400 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8407] block">
                        {prod.subcategory || 'Wall Panels'}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-black mt-0.5 leading-snug">
                        {prod.name}
                      </h3>
                    </div>
                    {prod.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF8407]/10 text-[#FF8407] border border-[#FF8407]/20 shrink-0">
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-200/60">
                    <Ruler className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="font-mono text-[11px] font-semibold">{prod.size}</span>
                  </div>

                  {/* Colors Preview */}
                  {prod.colors && prod.colors.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {prod.colors.map((c) => (
                          <div
                            key={c.code}
                            title={`${c.code}: ${c.name}`}
                            className="w-5 h-5 rounded-full border border-zinc-300 shadow-2xs"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                        <span className="text-[10px] text-zinc-400 ml-1">
                          {prod.colors.length} {language === 'en' ? 'colors' : 'tonos'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                      {language === 'en' ? 'Base Price' : 'Precio Base'}
                    </span>
                    <span className="text-base font-bold text-black">
                      {formatCurrency(prod.basePrice)}
                      <span className="text-xs font-normal text-zinc-500"> / {language === 'en' ? 'panel' : 'pieza'}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-[#FF8407] hover:bg-[#E07300] text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    <span>{language === 'en' ? 'Select' : 'Cotizar'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 2: QUANTITY, COLOR & PRICING */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E4E2DA] shadow-xs space-y-6">
          {/* Header Product Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8407]">
                {selectedProduct.subcategory}
              </span>
              <h3 className="text-lg font-bold text-black">
                {selectedProduct.name}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {selectedProduct.size}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-[#FF8407] hover:underline font-semibold cursor-pointer"
              >
                {language === 'en' ? 'Change model' : 'Cambiar modelo'}
              </button>
            </div>
          </div>

          {/* Color Selection */}
          {selectedProduct.colors && selectedProduct.colors.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                {language === 'en' ? 'Select Color / Finish' : 'Selecciona el Color / Tono'}:
                {selectedColor && (
                  <span className="text-[#FF8407] ml-2 font-semibold">
                    {selectedColor.code} - {selectedColor.name}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {selectedProduct.colors.map((c) => {
                  const isColorActive = selectedColor?.code === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isColorActive
                          ? 'border-[#FF8407] bg-[#FF8407]/5 ring-1 ring-[#FF8407]'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-zinc-300 shrink-0 shadow-2xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="truncate">
                        <span className="text-[11px] font-bold text-black block truncate">
                          {c.code}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {c.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wall Width Dimension Helper */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF8407]" />
              <span className="text-xs font-bold text-black uppercase tracking-wider">
                {language === 'en' ? 'Wall Width Dimension Calculator (Optional)' : 'Calculadora por Ancho de Pared (Opcional)'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {language === 'en'
                ? 'Enter the linear width of the wall in feet to auto-calculate the number of panels needed (+10% waste cut buffer).'
                : 'Ingresa el ancho en pies (feet) de la pared para calcular automáticamente los paneles necesarios (+10% de merma por corte).'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="1"
                step="0.5"
                value={wallWidthFeet}
                onChange={(e) => {
                  setWallWidthFeet(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    handleCalcFromWidth(val);
                  }
                }}
                placeholder="Ej. 12 ft de ancho"
                className="w-44 text-xs font-semibold px-3 py-2 bg-white border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8407]"
              />
              <span className="text-xs text-zinc-600 font-medium">ft de pared</span>
              {wallWidthFeet && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 ml-auto">
                  ≈ {quantity} {language === 'en' ? 'panels recommended' : 'paneles calculados'}
                </span>
              )}
            </div>
          </div>

          {/* Panel Count Control */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-black block">
              {language === 'en' ? 'Panels / Pieces to Quote' : 'Cantidad de Paneles / Piezas a Cotizar'}:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleAddQty(-1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-10 text-center font-bold text-base text-black outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddQty(1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {[+5, +10, +20].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleAddQty(delta)}
                    className="px-2.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    +{delta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Unit Price & Margin Adjustment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-black">
                {language === 'en' ? 'Unit Sell Price ($/panel)' : 'Precio Unitario de Venta ($/panel)'}:
              </label>
              <span className="text-[11px] text-zinc-400 font-medium">
                {language === 'en' ? 'Factory Base' : 'Precio Base'}: {formatCurrency(selectedProduct.basePrice)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-sm font-bold border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8407]"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {[+0.50, +1.00, +2.00].map((markup) => (
                  <button
                    key={markup}
                    type="button"
                    onClick={() => handlePriceMarkup(markup)}
                    className="px-2.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    +${markup.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-black block">
              {language === 'en' ? 'Customer Note / Area (Optional)' : 'Nota de Área o Ubicación (Opcional)'}:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Pared de sala principal fondo de TV..."
              className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-[#FF8407]"
            />
          </div>

          {/* Subtotal & Add Button */}
          <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase block">
                {language === 'en' ? 'Subtotal (Material)' : 'Subtotal Material'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-black">
                  {formatCurrency(subtotal)}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  ({quantity} {quantity === 1 ? 'panel' : 'paneles'} × {formatCurrency(unitPrice)})
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-add-wall-panel"
              onClick={handleAddToCart}
              className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#FF8407] hover:bg-[#E07300] text-white active:scale-98'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{language === 'en' ? 'Added to Quote!' : '¡Agregado a la Cotización!'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{language === 'en' ? 'Add Wall Panels to Quote' : 'Agregar Paneles a Cotización'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
