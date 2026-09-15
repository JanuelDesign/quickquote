import React, { useState } from 'react';
import { Product, Language } from '../types';
import { formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { 
  Check, 
  ArrowLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Disc,
  Info
} from 'lucide-react';

interface UnderlaymentCalculatorProps {
  products: Product[];
  language?: Language;
  initialProductId?: string;
  onAddToCart: (
    product: Product,
    rollCount: number,
    unitPrice: number,
    notes?: string
  ) => void;
}

export const UnderlaymentCalculator: React.FC<UnderlaymentCalculatorProps> = ({
  products,
  language = 'en',
  initialProductId,
  onAddToCart
}) => {
  const t = translations[language];
  const underlaymentProducts = products.filter(p => p.category === 'underlayment');
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product>(underlaymentProducts[0] || {} as Product);
  const [quantity, setQuantity] = useState<number>(5);
  const [unitPrice, setUnitPrice] = useState<number>(underlaymentProducts[0]?.basePrice || 22.00);
  
  // Floor Area (Sqft) Helper
  const [areaSqft, setAreaSqft] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Jump to specific product if passed via search selection
  React.useEffect(() => {
    if (initialProductId) {
      const match = underlaymentProducts.find(p => p.id === initialProductId);
      if (match) {
        setSelectedProduct(match);
        setUnitPrice(match.basePrice || 22.00);
        setCurrentStep(2);
        scrollToCalculatorTop();
      }
    }
  }, [initialProductId]);

  // Live synchronization
  React.useEffect(() => {
    if (!underlaymentProducts.length) return;
    if (!selectedProduct?.id || !underlaymentProducts.some(p => p.id === selectedProduct.id)) {
      const fallback = underlaymentProducts[0];
      if (fallback) {
        setSelectedProduct(fallback);
        setUnitPrice(fallback.basePrice || 22.00);
      }
      return;
    }
    const fresh = underlaymentProducts.find(p => p.id === selectedProduct.id);
    if (fresh) {
      setSelectedProduct(fresh);
    }
  }, [products]);

  // Extract roll coverage from size or default to 100
  const getCoveragePerRoll = (prod: Product): number => {
    if (prod.size?.includes('1,000') || prod.size?.includes('1000')) return 1000;
    if (prod.size?.includes('200')) return 200;
    return 100;
  };

  const rollCoverage = getCoveragePerRoll(selectedProduct);

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
    setCurrentStep(2);
    scrollToCalculatorTop();
  };

  const handleCalcFromArea = (sqft: number) => {
    if (!sqft || sqft <= 0) return;
    const rollsNeeded = Math.ceil(sqft / rollCoverage);
    setQuantity(rollsNeeded);
  };

  const subtotal = Number((quantity * unitPrice).toFixed(2));
  const totalAreaCovered = quantity * rollCoverage;

  const handleAddQty = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handlePriceMarkup = (delta: number) => {
    setUnitPrice(prev => Math.max(1, Number((prev + delta).toFixed(2))));
  };

  const handleAddToCart = () => {
    if (quantity <= 0) return;
    onAddToCart(selectedProduct, quantity, unitPrice, notes);
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
                id="btn-underlayment-back"
                onClick={() => setCurrentStep(1)}
                className="w-7 h-7 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
                title="Volver a los aislantes"
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
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>
              {currentStep === 1 
                ? (language === 'en' ? '1. Select Underlayment / Moisture Barrier' : '1. Selecciona Aislante o Barrera de Vapor') 
                : (language === 'en' ? '2. Roll Quantity & Pricing' : '2. Cantidad de Rollos & Precios')}
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {currentStep === 1
              ? `${underlaymentProducts.length} tipos de aislantes acústicos y barreras contra humedad`
              : selectedProduct.name}
          </p>
        </div>
      </div>

      {/* STEP 1: CATALOG OF UNDERLAYMENTS */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {underlaymentProducts.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <div
                key={prod.id}
                id={`underlayment-card-${prod.id}`}
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
                        {prod.subcategory || 'Underlayment'}
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

                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-700 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 font-medium">
                    <Disc className="w-4 h-4 text-[#FF8407] shrink-0" />
                    <span className="font-mono text-[11px] font-semibold">{prod.size}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                      {language === 'en' ? 'Price per Roll' : 'Precio por Rollo'}
                    </span>
                    <span className="text-base font-bold text-black">
                      {formatCurrency(prod.basePrice)}
                      <span className="text-xs font-normal text-zinc-500"> / rollo</span>
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

      {/* STEP 2: QUANTITY & PRICING */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E4E2DA] shadow-xs space-y-6">
          {/* Product Header */}
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
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-[#FF8407] hover:underline font-semibold cursor-pointer"
            >
              {language === 'en' ? 'Change model' : 'Cambiar modelo'}
            </button>
          </div>

          {/* Area (Sqft) Helper */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF8407]" />
              <span className="text-xs font-bold text-black uppercase tracking-wider">
                {language === 'en' ? 'Calculate Rolls Needed by Floor Area (Sq Ft)' : 'Calcular Rollos según Área de Piso (Sq Ft)'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {language === 'en'
                ? `Each roll covers ${rollCoverage} sq ft. Enter the total project area to calculate exact rolls required.`
                : `Cada rollo cubre ${rollCoverage} sq ft. Escribe el área del proyecto para calcular los rollos necesarios.`}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="1"
                value={areaSqft}
                onChange={(e) => {
                  setAreaSqft(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    handleCalcFromArea(val);
                  }
                }}
                placeholder="Ej. 650 sq ft"
                className="w-44 text-xs font-semibold px-3 py-2 bg-white border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8407]"
              />
              <span className="text-xs text-zinc-600 font-medium">sq ft</span>
              {areaSqft && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 ml-auto">
                  = {quantity} {language === 'en' ? 'rolls required' : 'rollos necesarios'}
                </span>
              )}
            </div>
          </div>

          {/* Roll Count Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-black">
                {language === 'en' ? 'Number of Rolls to Quote' : 'Cantidad de Rollos a Cotizar'}:
              </label>
              <span className="text-xs text-zinc-500 font-medium">
                {language === 'en' ? 'Total Coverage' : 'Cobertura total'}: <strong className="text-black">{totalAreaCovered} sq ft</strong>
              </span>
            </div>

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
                {[+1, +5, +10].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleAddQty(delta)}
                    className="px-2.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    +{delta} rollo{delta > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Unit Price per Roll */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-black">
                {language === 'en' ? 'Sell Price per Roll ($)' : 'Precio de Venta por Rollo ($)'}:
              </label>
              <span className="text-[11px] text-zinc-400 font-medium">
                {language === 'en' ? 'Base Cost' : 'Costo Base'}: {formatCurrency(selectedProduct.basePrice)} / rollo
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-sm font-bold border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8407]"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {[+1.00, +2.00, +5.00].map((markup) => (
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
              {language === 'en' ? 'Customer Note / Area (Optional)' : 'Nota para la Cotización (Opcional)'}:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Aislante para toda la segunda planta..."
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
                  ({quantity} {quantity === 1 ? 'rollo' : 'rollos'} × {formatCurrency(unitPrice)})
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-add-underlayment"
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
                  <span>{language === 'en' ? 'Add Underlayment to Quote' : 'Agregar Aislante a Cotización'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
