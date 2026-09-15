import React, { useState } from 'react';
import { Product, ProductColor, Language } from '../types';
import { formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { 
  Check, 
  MoveUpRight, 
  ArrowLeft,
  ChevronRight,
  Ruler,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface StairsCalculatorProps {
  products: Product[];
  language?: Language;
  initialProductId?: string;
  onAddToCart: (
    product: Product,
    stepCount: number,
    stepUnitPrice: number,
    includeRiser: boolean,
    riserUnitPrice: number,
    color?: ProductColor,
    notes?: string,
    riserStyle?: 'white' | 'match'
  ) => void;
}

export const StairsCalculator: React.FC<StairsCalculatorProps> = ({
  products,
  language = 'en',
  initialProductId,
  onAddToCart
}) => {
  const t = translations[language];
  const stairProducts = products.filter(p => p.category === 'escalones' && !p.id.includes('riser'));
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product>(stairProducts[0] || {} as Product);
  const [stepCount, setStepCount] = useState<number>(14);
  const [stepUnitPrice, setStepUnitPrice] = useState<number>(stairProducts[0]?.basePrice || 19.00);
  const [includeRiser, setIncludeRiser] = useState<boolean>(true);
  const [riserUnitPrice, setRiserUnitPrice] = useState<number>(9.00);
  const [riserStyle, setRiserStyle] = useState<'white' | 'match'>('white');
  const [notes, setNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Jump to specific product if passed via search selection
  React.useEffect(() => {
    if (initialProductId) {
      const match = stairProducts.find(p => p.id === initialProductId);
      if (match) {
        setSelectedProduct(match);
        setStepUnitPrice(match.basePrice || 19.00);
        setCurrentStep(2);
        scrollToCalculatorTop();
      }
    }
  }, [initialProductId]);

  // Live synchronization
  React.useEffect(() => {
    if (!stairProducts.length) return;
    if (!selectedProduct?.id || !stairProducts.some(p => p.id === selectedProduct.id)) {
      const fallback = stairProducts[0];
      if (fallback) {
        setSelectedProduct(fallback);
        setStepUnitPrice(fallback.basePrice || 19.00);
      }
      return;
    }
    const fresh = stairProducts.find(p => p.id === selectedProduct.id);
    if (fresh) {
      setSelectedProduct(fresh);
    }
  }, [products]);

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
    setStepUnitPrice(prod.basePrice || 19.00);
    setCurrentStep(2);
    scrollToCalculatorTop();
  };

  const stepsTotal = Number((stepCount * stepUnitPrice).toFixed(2));
  const risersTotal = includeRiser ? Number((stepCount * riserUnitPrice).toFixed(2)) : 0;
  const subtotal = Number((stepsTotal + risersTotal).toFixed(2));

  const handleAddSteps = (amount: number) => {
    setStepCount(prev => Math.max(1, prev + amount));
  };

  const handleAddToCart = () => {
    if (stepCount <= 0) return;
    onAddToCart(
      selectedProduct,
      stepCount,
      stepUnitPrice,
      includeRiser,
      riserUnitPrice,
      selectedProduct.colors?.[0],
      notes,
      riserStyle
    );
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
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
            {currentStep === 2 && (
              <button
                type="button"
                id="btn-stairs-back"
                onClick={() => setCurrentStep(1)}
                className="h-7 px-2.5 rounded-lg border border-[#E4E2DA] hover:border-[#181818] bg-[#F2F1EC] text-[#181818] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Back' : 'Atrás'}</span>
              </button>
            )}
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#9C9A90]">
              {language === 'en' ? `Step ${currentStep} of 2` : `Paso ${currentStep} de 2`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (step < currentStep) setCurrentStep(step as 1 | 2);
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

        {/* Row 2: Category Icon (36px) on Left + Title/Subtitle in Column on Right */}
        <div className="flex items-center gap-3.5 pt-2 border-t border-[#F2F1EC]">
          <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-lg bg-[#181818] text-[#FF8407] flex items-center justify-center font-bold shrink-0">
            <MoveUpRight className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#181818] leading-tight truncate">
              {currentStep === 1 
                ? (language === 'en' ? '1. Select Stair Tread Package' : '1. Seleccionar modelo de peldaño')
                : (language === 'en' ? '2. Steps & Risers Pricing' : '2. Cantidad y precios: Peldaño y Contrahuella')}
            </h3>
            <p className="text-xs text-[#6B6A63] font-medium leading-normal mt-0.5 truncate">
              {currentStep === 1
                ? `${stairProducts.length} ${language === 'en' ? 'options (12" x 48" format)' : 'opciones (formato 12" x 48")'}`
                : `${selectedProduct.name} • ${selectedProduct.size || '12" x 48"'}`}
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Model */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {stairProducts.map((product) => {
            const isSelected = selectedProduct.id === product.id;

            return (
              <div
                key={product.id}
                id={`stair-card-${product.id}`}
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
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider bg-[#181818] text-white shrink-0">
                      {product.size || '12" x 48"'}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B6A63] leading-relaxed">
                    {product.description || (language === 'en' ? 'Stair nose with click system' : 'Peldaño completo con nariz redondeada')}
                  </p>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#181818] bg-[#F2F1EC] border border-[#E4E2DA] px-2.5 py-1 rounded-md font-medium">
                      <Ruler className="w-3 h-3 text-[#FF8407] shrink-0" />
                      <span>{product.size || '12" x 48"'} format</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-[#E4E2DA]">
                  <div>
                    <span className="text-lg font-bold text-[#181818] font-mono">
                      ${product.basePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#6B6A63] ml-1">/ escalón</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductSelect(product);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-[#181818] hover:bg-black text-white flex items-center gap-1.5"
                  >
                    <span>{language === 'en' ? 'Select' : 'Seleccionar'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#FF8407]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 2: Steps & Risers Pricing Configuration */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Top selected model badge */}
          <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#181818]">{selectedProduct.name}</span>
              <span className="text-[#9C9A90]">•</span>
              <span className="text-[#6B6A63] font-medium">{selectedProduct.size || '12" x 48"'}</span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-[11px] font-bold text-[#FF8407] hover:underline cursor-pointer"
            >
              {language === 'en' ? 'Change Model' : 'Cambiar Modelo'}
            </button>
          </div>

          {/* Row 1: Quantity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Input Step Count */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="input-stairs-count" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {language === 'en' ? 'Number of Steps' : 'Cantidad de Escalones'}
                </label>
                <span className="text-[10px] text-[#6B6A63] font-mono">
                  {selectedProduct.size || '12" x 48"'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="input-stairs-count"
                  value={stepCount}
                  onChange={(e) => setStepCount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  min="1"
                  step="1"
                  className="w-full text-2xl font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                />
              </div>

              {/* Quick Add Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#9C9A90] font-semibold uppercase">Rápido:</span>
                {[1, 2, 4, 14].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleAddSteps(amount)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F2F1EC] hover:bg-[#E4E2DA] text-[#181818] transition-colors cursor-pointer"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 2: Visual Step Count Summary */}
            <div className="bg-[#181818] text-white rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A8A8]">
                  {language === 'en' ? 'Total Steps' : 'Total Escalones'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white font-mono">
                  {stepCount} {stepCount === 1 ? 'peldaño' : 'peldaños'}
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#FF8407] font-mono leading-none">
                  {stepCount} <span className="text-lg font-medium text-white">{language === 'en' ? 'Steps' : 'Peldaños'}</span>
                </div>
                <div className="text-xs text-[#C9C9C9] mt-2 flex items-center justify-between">
                  <span>Formato Huella: <strong>12" prof. × 48" ancho</strong></span>
                </div>
              </div>

              <div className="text-[11px] text-[#A8A8A8] pt-2 border-t border-zinc-800 flex justify-between items-center">
                <span>Contrahuellas (Risers):</span>
                <span className={`font-mono px-2 py-0.5 rounded text-[10px] font-bold ${
                  includeRiser ? 'bg-[#FF8407]/20 text-[#FF8407]' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {includeRiser ? `${stepCount} risers incluidos` : 'No incluidas'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: INDIVIDUAL PRICE BREAKDOWN (Step Price vs Riser Price) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PRICING SECTION 1: Step Tread (Huella) Individual Price */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF8407]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                      {language === 'en' ? '1. Step Tread (Huella)' : '1. Peldaño (Huella)'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F2F1EC] text-[#181818]">
                    12" × 48"
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6A63]">
                  {language === 'en' ? 'Individual unit price for each step tread.' : 'Precio unitario individual por cada peldaño o huella.'}
                </p>
              </div>

              <div>
                <label htmlFor="input-stairs-price" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block mb-1">
                  {language === 'en' ? 'Unit Price per Step Tread' : 'Precio Unitario por Peldaño'}
                </label>
                <div className="relative w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#9C9A90]">$</span>
                  <input
                    type="number"
                    step="0.50"
                    id="input-stairs-price"
                    value={stepUnitPrice}
                    onChange={(e) => setStepUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-2xl font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl pl-8 pr-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                  />
                </div>
              </div>

              {/* Tread Subtotal preview */}
              <div className="p-3 bg-[#F2F1EC] rounded-xl flex items-center justify-between border border-[#E4E2DA]">
                <div className="text-xs text-[#6B6A63]">
                  <span className="font-semibold text-[#181818]">{stepCount}</span> peldaños × <span className="font-mono font-bold text-[#181818]">{formatCurrency(stepUnitPrice)}</span>:
                </div>
                <div className="text-base font-bold font-mono text-[#181818]">
                  {formatCurrency(stepsTotal)}
                </div>
              </div>
            </div>

            {/* PRICING SECTION 2: Stair Riser (Contrahuella) Individual Price */}
            <div className={`rounded-xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between space-y-4 transition-all ${
              includeRiser 
                ? 'bg-white border-[#E4E2DA]' 
                : 'bg-zinc-50 border-zinc-200 opacity-90'
            }`}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="checkbox-include-riser"
                      checked={includeRiser}
                      onChange={(e) => setIncludeRiser(e.target.checked)}
                      className="w-4 h-4 accent-[#FF8407] rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                      {language === 'en' ? '2. Stair Riser (Contrahuella)' : '2. Contrahuella (Riser)'}
                    </span>
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    includeRiser ? 'bg-amber-100 text-amber-900' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    {includeRiser ? (language === 'en' ? 'Included' : 'Incluida') : (language === 'en' ? 'Not Included' : 'No Incluida')}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6A63]">
                  {language === 'en' ? 'Vertical board between steps for full finish.' : 'Pieza vertical entre peldaños. Reflejada de forma independiente.'}
                </p>
              </div>

              {includeRiser ? (
                <>
                  {/* Riser Style Options */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block mb-1.5">
                      {language === 'en' ? 'Riser Style / Finish' : 'Acabado de la Contrahuella'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRiserStyle('white')}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all border cursor-pointer ${
                          riserStyle === 'white'
                            ? 'border-[#FF8407] bg-amber-50/50 text-[#181818] ring-1 ring-[#FF8407]'
                            : 'border-[#E4E2DA] bg-[#FAFAFA] text-[#6B6A63] hover:border-zinc-400'
                        }`}
                      >
                        <div className="font-bold">White Laminate</div>
                        <div className="text-[10px] text-[#9C9A90]">Blanco laminado</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRiserStyle('match')}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all border cursor-pointer ${
                          riserStyle === 'match'
                            ? 'border-[#FF8407] bg-amber-50/50 text-[#181818] ring-1 ring-[#FF8407]'
                            : 'border-[#E4E2DA] bg-[#FAFAFA] text-[#6B6A63] hover:border-zinc-400'
                        }`}
                      >
                        <div className="font-bold">Al Tono del Piso</div>
                        <div className="text-[10px] text-[#9C9A90]">Matching SPC Color</div>
                      </button>
                    </div>
                  </div>

                  {/* Riser Unit Price Input */}
                  <div>
                    <label htmlFor="input-riser-price" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block mb-1">
                      {language === 'en' ? 'Unit Price per Riser' : 'Precio Unitario por Contrahuella (Riser)'}
                    </label>
                    <div className="relative w-full">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#9C9A90]">$</span>
                      <input
                        type="number"
                        step="0.50"
                        id="input-riser-price"
                        value={riserUnitPrice}
                        onChange={(e) => setRiserUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full text-2xl font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl pl-8 pr-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                      />
                    </div>
                  </div>

                  {/* Riser Subtotal preview */}
                  <div className="p-3 bg-amber-50/40 rounded-xl flex items-center justify-between border border-amber-200/50">
                    <div className="text-xs text-[#6B6A63]">
                      <span className="font-semibold text-[#181818]">{stepCount}</span> contrahuellas × <span className="font-mono font-bold text-[#181818]">{formatCurrency(riserUnitPrice)}</span>:
                    </div>
                    <div className="text-base font-bold font-mono text-[#181818]">
                      {formatCurrency(risersTotal)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-white/60 border border-dashed border-zinc-300 rounded-xl text-center space-y-1.5 my-auto">
                  <span className="text-xs font-semibold text-zinc-500 block">
                    {language === 'en' ? 'Risers are excluded' : 'Contrahuellas no incluidas'}
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    {language === 'en' 
                      ? 'Mark the checkbox above if the project requires risers (vertical planks).' 
                      : 'Marca la casilla si el cliente también necesita las contrahuellas verticales.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: TRANSPARENT ITEMIZATION SUMMARY (Full Clarity for Customer) */}
          <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E2DA] pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF8407]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                  {language === 'en' ? 'Stairs Breakdown (Separated for Customer Clarity)' : 'Desglose de Escalera (Precios Separados para el Cliente)'}
                </h4>
              </div>
              <span className="text-[11px] font-mono font-semibold text-[#6B6A63]">
                Total: {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Line-by-line itemized preview */}
            <div className="space-y-2 text-xs">
              {/* Line 1: Step Tread */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#E4E2DA]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[#181818] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <div className="truncate">
                    <span className="font-bold text-[#181818]">{selectedProduct.name} (Huella / Tread)</span>
                    <span className="text-[#6B6A63] text-[11px] ml-2">
                      ({stepCount} unidades @ <strong className="text-[#181818] font-mono">{formatCurrency(stepUnitPrice)}</strong> c/u)
                    </span>
                  </div>
                </div>
                <span className="font-bold font-mono text-sm text-[#181818] shrink-0 ml-2">
                  {formatCurrency(stepsTotal)}
                </span>
              </div>

              {/* Line 2: Riser */}
              <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
                includeRiser ? 'bg-white border-[#E4E2DA]' : 'bg-zinc-100/70 border-dashed border-zinc-300 text-zinc-400'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    includeRiser ? 'bg-[#FF8407] text-white' : 'bg-zinc-300 text-zinc-600'
                  }`}>2</span>
                  <div className="truncate">
                    <span className={`font-bold ${includeRiser ? 'text-[#181818]' : 'text-zinc-500'}`}>
                      {riserStyle === 'white' 
                        ? 'Contrahuella (Riser Plank White Laminate)' 
                        : 'Contrahuella SPC (Al tono de la huella)'}
                    </span>
                    {includeRiser ? (
                      <span className="text-[#6B6A63] text-[11px] ml-2">
                        ({stepCount} unidades @ <strong className="text-[#181818] font-mono">{formatCurrency(riserUnitPrice)}</strong> c/u)
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[11px] ml-2">
                        ({language === 'en' ? 'Excluded' : 'No solicitadas'})
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-bold font-mono text-sm shrink-0 ml-2">
                  {includeRiser ? formatCurrency(risersTotal) : '$0.00'}
                </span>
              </div>
            </div>

            {/* Clarity Notice */}
            <div className="flex items-start gap-2 pt-1 text-[11px] text-[#6B6A63]">
              <Info className="w-3.5 h-3.5 text-[#FF8407] shrink-0 mt-0.5" />
              <span>
                {language === 'en'
                  ? 'Both the steps and the risers will be listed as separate items in the quote, PDF, and WhatsApp with their individual unit prices to eliminate any customer confusion.'
                  : 'Tanto los peldaños como las contrahuellas se agregarán como ítems independientes en el carrito, PDF y WhatsApp con su precio unitario individual para total transparencia con el cliente.'}
              </span>
            </div>
          </div>

          {/* Customer Note */}
          <div className="bg-white rounded-xl p-4 border border-[#E4E2DA] shadow-xs space-y-1.5">
            <label htmlFor="stairs-notes" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
              {language === 'en' ? 'Optional note for customer:' : 'Nota para el cliente (opcional):'}
            </label>
            <input
              type="text"
              id="stairs-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'en' ? 'e.g., Main staircase, matching floor color' : 'Ej: Escalera principal a segundo piso, acabado al tono'}
              className="w-full bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg px-3 py-2 text-xs text-[#181818] placeholder:text-[#9C9A90] focus:outline-hidden focus:border-[#FF8407]"
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            id="btn-add-stairs-to-quote"
            onClick={handleAddToCart}
            disabled={stepCount <= 0}
            className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
              addedSuccess
                ? 'bg-[#1E8E5A] text-white'
                : stepCount <= 0
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-[#FF8407] hover:bg-[#E07300] text-white'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>{language === 'en' ? '✓ Added to Quote as Separate Items!' : '✓ ¡Agregados a la Cotización por Separado!'}</span>
              </>
            ) : (
              <>
                <span>
                  {includeRiser
                    ? (language === 'en'
                        ? `+ Add to Quote: ${stepCount} Steps (${formatCurrency(stepsTotal)}) + ${stepCount} Risers (${formatCurrency(risersTotal)}) = ${formatCurrency(subtotal)}`
                        : `+ Agregar: ${stepCount} Peldaños (${formatCurrency(stepsTotal)}) + ${stepCount} Risers (${formatCurrency(risersTotal)}) = ${formatCurrency(subtotal)}`)
                    : (language === 'en'
                        ? `+ Add ${stepCount} Steps to Quote (${formatCurrency(stepsTotal)})`
                        : `+ Agregar ${stepCount} Peldaños a la Cotización (${formatCurrency(stepsTotal)})`)}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
