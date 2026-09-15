import React, { useState } from 'react';
import { Product, ProductColor, Language } from '../types';
import { formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { 
  Check, 
  CornerDownRight, 
  ArrowLeft,
  ChevronRight,
  Ruler
} from 'lucide-react';

interface ProfilesCalculatorProps {
  products: Product[];
  language?: Language;
  initialProductId?: string;
  onAddToCart: (
    product: Product,
    pieceCount: number,
    unitPrice: number,
    color?: ProductColor,
    notes?: string
  ) => void;
}

export const ProfilesCalculator: React.FC<ProfilesCalculatorProps> = ({
  products,
  language = 'en',
  initialProductId,
  onAddToCart
}) => {
  const t = translations[language];
  const profileProducts = products.filter(p => p.category === 'perfiles');
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product>(profileProducts[0] || {} as Product);
  const [quantity, setQuantity] = useState<number>(4);
  const [unitPrice, setUnitPrice] = useState<number>(profileProducts[0]?.basePrice || 30.00);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    profileProducts[0]?.colors?.[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Jump to specific product if passed via search selection
  React.useEffect(() => {
    if (initialProductId) {
      const match = profileProducts.find(p => p.id === initialProductId);
      if (match) {
        setSelectedProduct(match);
        setUnitPrice(match.basePrice || 30.00);
        setSelectedColor(match.colors?.[0]);
        setCurrentStep(2);
        scrollToCalculatorTop();
      }
    }
  }, [initialProductId]);

  // Live synchronization
  React.useEffect(() => {
    if (!profileProducts.length) return;
    if (!selectedProduct?.id || !profileProducts.some(p => p.id === selectedProduct.id)) {
      const fallback = profileProducts[0];
      if (fallback) {
        setSelectedProduct(fallback);
        setUnitPrice(fallback.basePrice || 30.00);
        setSelectedColor(fallback.colors?.[0]);
      }
      return;
    }
    const fresh = profileProducts.find(p => p.id === selectedProduct.id);
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
    setUnitPrice(prod.basePrice);
    setSelectedColor(prod.colors?.[0]);
    setCurrentStep(2);
    scrollToCalculatorTop();
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
      {/* Step Navigation Card - 2 Distinct Rows */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
        {/* Row 1: Step indication on Left, Progress Dots on Right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <button
                type="button"
                id="btn-profile-back"
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

        {/* Row 2: Category Icon (36px) on Left + Title/Subtitle in Column on Right with min 10px spacing */}
        <div className="flex items-center gap-3.5 pt-2 border-t border-[#F2F1EC]">
          <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-lg bg-[#181818] text-[#FF8407] flex items-center justify-center font-bold shrink-0">
            <CornerDownRight className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#181818] leading-tight truncate">
              {currentStep === 1 
                ? (language === 'en' ? '1. Select Profile / Transition' : '1. Seleccionar perfil o transición')
                : (language === 'en' ? '2. Pieces & Pricing' : '2. Piezas y precio')}
            </h3>
            <p className="text-xs text-[#6B6A63] font-medium leading-normal mt-0.5 truncate">
              {currentStep === 1
                ? `${profileProducts.length} ${language === 'en' ? 'profiles (94" lengths)' : 'perfiles de 94" disponibles'}`
                : `${selectedProduct.name} • ${selectedProduct.size || '94"'}`}
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Model */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {profileProducts.map((product) => {
            const isSelected = selectedProduct.id === product.id;

            return (
              <div
                key={product.id}
                id={`profile-card-${product.id}`}
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
                    {product.badge && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider bg-[#FF8407] text-white shrink-0">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#6B6A63] leading-relaxed">
                    {product.description || (language === 'en' ? 'Transition trim' : 'Perfil de transición')}
                  </p>

                  {/* Technical measurement specification cleanly BELOW title and description */}
                  {(product.size || product.dimensions) && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#181818] bg-[#F2F1EC] border border-[#E4E2DA] px-2.5 py-1 rounded-md font-medium max-w-full break-words">
                        <Ruler className="w-3 h-3 text-[#FF8407] shrink-0" />
                        <span>{product.size || product.dimensions}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-[#E4E2DA]">
                  <div>
                    <span className="text-lg font-bold text-[#181818] font-mono">
                      ${product.basePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#6B6A63] ml-1">/ pza</span>
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

      {/* STEP 2: Pieces & Calculation */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Top selected model badge */}
          <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#181818]">{selectedProduct.name}</span>
              <span className="text-[#9C9A90]">•</span>
              <span className="text-[#6B6A63] font-medium">{selectedProduct.size || '94"'}</span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-[11px] font-bold text-[#FF8407] hover:underline cursor-pointer"
            >
              {language === 'en' ? 'Change' : 'Cambiar'}
            </button>
          </div>

          {/* Unified Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EDITABLE INPUTS: Card 1 - Pieces Needed */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="input-profile-qty" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {language === 'en' ? 'Pieces Required' : 'Piezas Requeridas'}
                </label>
                <span className="text-[10px] text-[#6B6A63] font-mono">
                  {selectedProduct.size || '94"'} c/u
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="input-profile-qty"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  min="1"
                  step="1"
                  className="w-full text-2xl font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                />
              </div>

              {/* Quick Add Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#9C9A90] font-semibold uppercase">Rápido:</span>
                {[1, 2, 5, 10].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleAddQty(amount)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F2F1EC] hover:bg-[#E4E2DA] text-[#181818] transition-colors cursor-pointer"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* CALCULATED RESULT: Card 2 - Pieces Display (Dark Card with Orange Number) */}
            <div className="bg-[#181818] text-white rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A8A8]">
                  {language === 'en' ? 'Total Profiles' : 'Perfiles Totales'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white font-mono">
                  {quantity} {quantity === 1 ? 'pieza' : 'piezas'}
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#FF8407] font-mono leading-none">
                  {quantity} <span className="text-lg font-medium text-white">{language === 'en' ? 'Pieces' : 'Piezas'}</span>
                </div>
                <div className="text-xs text-[#C9C9C9] mt-2 flex items-center justify-between">
                  <span>Longitud estándar: <strong>94 inches (~7.8 ft)</strong></span>
                </div>
              </div>

              <div className="text-[11px] text-[#A8A8A8] pt-2 border-t border-zinc-800 flex justify-between">
                <span>Material:</span>
                <span className="font-mono text-zinc-300">Aluminio / Co-extrusión</span>
              </div>
            </div>

            {/* EDITABLE INPUTS: Card 3 - Sales Price per Piece */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="input-profile-price" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {language === 'en' ? 'Selling Price per Piece' : 'Precio de Venta / Pieza'}
                </label>
                <span className="text-[10px] text-[#6B6A63] font-mono">
                  ${unitPrice.toFixed(2)} / pza
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#9C9A90]">$</span>
                  <input
                    type="number"
                    step="0.50"
                    id="input-profile-price"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-2xl font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl pl-8 pr-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                  />
                </div>
              </div>

              {/* Quick Markup Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#9C9A90] font-semibold uppercase">Margen:</span>
                {[0.50, 1.00, 2.00].map((delta) => (
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

            {/* CALCULATED RESULT: Card 4 - Subtotal */}
            <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                {language === 'en' ? 'Profiles Subtotal' : 'Subtotal Perfiles'}
              </span>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#181818] font-mono">
                  {formatCurrency(subtotal)}
                </div>
                <p className="text-[11px] text-[#6B6A63] mt-1">
                  {quantity} piezas × ${unitPrice.toFixed(2)}/pza
                </p>
              </div>

              <div className="text-[10px] text-[#9C9A90] pt-2 border-t border-[#E4E2DA]">
                * Gravable con el 7% de sales tax de Florida en el total
              </div>
            </div>
          </div>

          {/* EDITABLE: Customer note */}
          <div className="bg-white rounded-xl p-4 border border-[#E4E2DA] shadow-xs space-y-1.5">
            <label htmlFor="profile-notes" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
              {language === 'en' ? 'Optional note for customer:' : 'Nota para el cliente (opcional):'}
            </label>
            <input
              type="text"
              id="profile-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'en' ? 'e.g., Transition between kitchen and hallway' : 'Ej: Transición entre cocina y pasillo'}
              className="w-full bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg px-3 py-2 text-xs text-[#181818] placeholder:text-[#9C9A90] focus:outline-hidden focus:border-[#FF8407]"
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            id="btn-add-profile-to-quote"
            onClick={handleAddToCart}
            disabled={quantity <= 0}
            className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
              addedSuccess
                ? 'bg-[#1E8E5A] text-white'
                : quantity <= 0
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
                    ? `+ Add ${quantity} Pieces to Quote (${formatCurrency(subtotal)})`
                    : `+ Agregar ${quantity} Piezas a la Cotización (${formatCurrency(subtotal)})`}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
