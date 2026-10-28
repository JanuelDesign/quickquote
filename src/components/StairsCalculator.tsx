import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductColor, Language, CartItem } from '../types';
import { 
  formatCurrency, 
  calculatePlankValues, 
  calculateStairsBreakdown, 
  createStairsCartItem, 
  createRiserCartItem, 
  createStairComplementaryCartItem, 
  createStairLandingCartItem 
} from '../utils/calculations';
import { translations } from '../utils/translations';
import { 
  Check, 
  MoveUpRight, 
  ArrowLeft,
  ChevronRight,
  Ruler,
  Layers,
  Sparkles,
  Info,
  AlertTriangle,
  Box,
  Plus,
  Minus,
  Calculator,
  RefreshCw
} from 'lucide-react';

interface StairsCalculatorProps {
  products: Product[];
  language?: Language;
  initialProductId?: string;
  initialSelectionKey?: number;
  onAddToCart: (
    product: Product,
    stepCount: number,
    stepUnitPrice: number,
    includeRiser: boolean,
    riserUnitPrice: number,
    color?: ProductColor,
    notes?: string,
    riserStyle?: 'white' | 'match',
    extraStairItems?: CartItem[]
  ) => void;
}

export const StairsCalculator: React.FC<StairsCalculatorProps> = ({
  products,
  language = 'en',
  initialProductId,
  initialSelectionKey,
  onAddToCart
}) => {
  const t = translations[language];

  // Available stair tread products
  const stairProducts = useMemo(() => {
    return products.filter(p => p.category === 'escalones' && !p.id.includes('riser'));
  }, [products]);

  // Available floor products (for reference collection)
  const floorProducts = useMemo(() => {
    return products.filter(p => p.category === 'piso');
  }, [products]);

  // ==========================================
  // STATE
  // ==========================================

  // Navigation Steps: 1 = Selector de Modelo / Huella, 2 = Configuración y Cotización
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // 1) Modo de cotización: 'solo_steps' vs 'completa'
  const [mode, setMode] = useState<'solo_steps' | 'completa'>('completa');

  // Step Tread Model
  const [selectedProduct, setSelectedProduct] = useState<Product>(stairProducts[0] || {} as Product);
  const [stepCount, setStepCount] = useState<number>(14);
  const [stepUnitPrice, setStepUnitPrice] = useState<number>(stairProducts[0]?.basePrice || 19.00);

  // Reference Floor Collection (para cálculo de láminas y descansos)
  const [floorSource, setFloorSource] = useState<'catalog' | 'custom'>('catalog');
  const [selectedFloorId, setSelectedFloorId] = useState<string>(floorProducts[0]?.id || '');
  const [customCollectionName, setCustomCollectionName] = useState<string>('Spirit SPC');
  
  // Floor specs: Pies cuadrados por caja, Láminas por caja, Precio por pie cuadrado
  const [sqftPerBox, setSqftPerBox] = useState<number>(floorProducts[0]?.sqftPerBox || 19.29);
  const [planksPerBox, setPlanksPerBox] = useState<number>(floorProducts[0]?.planksPerBox || 5);
  const [pricePerSqft, setPricePerSqft] = useState<number>(floorProducts[0]?.basePrice || 2.09);

  // Escalera Completa: Descansos y Tipo de contrahuella
  const [landingCount, setLandingCount] = useState<number>(0);
  const [riserType, setRiserType] = useState<'white' | 'color_piso'>('color_piso');
  const [riserUnitPrice, setRiserUnitPrice] = useState<number>(9.00); // Para contrahuella blanca

  // Customer notes & feedback
  const [notes, setNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Jump to specific product if passed via search selection
  useEffect(() => {
    if (initialProductId) {
      const match = stairProducts.find(p => p.id === initialProductId);
      if (match) {
        setSelectedProduct(match);
        setStepUnitPrice(match.basePrice || 19.00);
        setCurrentStep(2);
        scrollToCalculatorTop();
      }
    }
  }, [initialProductId, initialSelectionKey, stairProducts]);

  // Sync when products change
  useEffect(() => {
    if (!stairProducts.length) return;
    if (!selectedProduct?.id || !stairProducts.some(p => p.id === selectedProduct.id)) {
      const fallback = stairProducts[0];
      if (fallback) {
        setSelectedProduct(fallback);
        setStepUnitPrice(fallback.basePrice || 19.00);
      }
    }
  }, [stairProducts]);

  // When floor product from catalog changes, update specs
  const handleSelectFloorFromCatalog = (floorId: string) => {
    setSelectedFloorId(floorId);
    const matched = floorProducts.find(f => f.id === floorId);
    if (matched) {
      setCustomCollectionName(matched.name);
      if (matched.sqftPerBox) setSqftPerBox(matched.sqftPerBox);
      if (matched.planksPerBox) setPlanksPerBox(matched.planksPerBox);
      if (matched.basePrice) setPricePerSqft(matched.basePrice);
    }
  };

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

  // ==========================================
  // REAL-TIME CALCULATIONS
  // ==========================================

  // 1. Cálculo por lámina:
  //    pies_cuadrados_por_lámina = pies_cuadrados_caja / láminas_por_caja
  //    valor_lámina = pies_cuadrados_por_lámina * precio_pie_cuadrado
  const plankValues = useMemo(() => {
    return calculatePlankValues(sqftPerBox, planksPerBox, pricePerSqft);
  }, [sqftPerBox, planksPerBox, pricePerSqft]);

  // 2. Desglose completo de escalera
  const breakdown = useMemo(() => {
    return calculateStairsBreakdown({
      mode,
      stepCount,
      stepUnitPrice,
      riserType,
      riserUnitPrice,
      landingCount,
      sqftPerBox,
      planksPerBox,
      pricePerSqft
    });
  }, [
    mode,
    stepCount,
    stepUnitPrice,
    riserType,
    riserUnitPrice,
    landingCount,
    sqftPerBox,
    planksPerBox,
    pricePerSqft
  ]);

  // Active collection label
  const activeCollectionName = useMemo(() => {
    if (floorSource === 'catalog') {
      const matched = floorProducts.find(f => f.id === selectedFloorId);
      return matched?.name || customCollectionName || selectedProduct.name;
    }
    return customCollectionName || selectedProduct.name;
  }, [floorSource, floorProducts, selectedFloorId, customCollectionName, selectedProduct.name]);

  // Quick increment/decrement steps
  const handleAddSteps = (amount: number) => {
    setStepCount(prev => Math.max(1, prev + amount));
  };

  // ==========================================
  // ADD TO CART (SEPARATION OF COMPONENTS)
  // ==========================================
  const handleAddToCart = () => {
    setValidationError(null);

    // Validations
    if (stepCount <= 0) {
      setValidationError(language === 'en' ? 'Step count must be at least 1.' : 'La cantidad de escalones debe ser mayor a 0.');
      return;
    }

    if (stepUnitPrice <= 0) {
      setValidationError(language === 'en' ? 'Step unit price must be greater than 0.' : 'El precio unitario del escalón debe ser mayor a 0.');
      return;
    }

    if (mode === 'completa') {
      if (sqftPerBox <= 0) {
        setValidationError(language === 'en' ? 'Please enter valid sqft per box.' : 'Ingresa los pies cuadrados por caja (sqft/caja) del piso.');
        return;
      }
      if (planksPerBox <= 0) {
        setValidationError(language === 'en' ? 'Please enter valid planks per box.' : 'Ingresa el número de láminas por caja.');
        return;
      }
      if (pricePerSqft <= 0) {
        setValidationError(language === 'en' ? 'Please enter valid price per sqft.' : 'Ingresa el precio por pie cuadrado ($/sqft).');
        return;
      }
      if (riserType === 'white' && riserUnitPrice <= 0) {
        setValidationError(language === 'en' ? 'Please enter a valid price for white risers.' : 'Ingresa el precio unitario de la contrahuella blanca.');
        return;
      }
    }

    const selectedColor = selectedProduct.colors?.[0];

    // CASE 1: SOLO STEPS
    if (mode === 'solo_steps') {
      onAddToCart(
        selectedProduct,
        stepCount,
        stepUnitPrice,
        false,
        0,
        selectedColor,
        notes,
        'white',
        [] // No extra items
      );
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        setCurrentStep(1);
      }, 1000);
      return;
    }

    // CASE 2: ESCALERA COMPLETA (Separated Components)
    // 1. Huella (Step Tread) is added via the primary item in handleAddStairs
    // 2. Extra items array:
    const extraItems: CartItem[] = [];

    // Componente 2: Contrahuella (Riser)
    if (riserType === 'white') {
      const whiteRiserItem = createRiserCartItem(
        stepCount,
        riserUnitPrice,
        'white',
        undefined,
        selectedProduct.thickness,
        notes
      );
      extraItems.push(whiteRiserItem);
    } else {
      // Contrahuella color piso: 1 lámina por escalón
      const matchRiserItem = createRiserCartItem(
        stepCount,
        breakdown.plankPrice,
        'match',
        selectedColor,
        selectedProduct.thickness,
        notes,
        breakdown.risersSqft,
        `Contrahuella SPC al tono (${activeCollectionName})`
      );
      extraItems.push(matchRiserItem);
    }

    // Componente 3: Material Complementario (Tablas que completan el escalón / faltantes de huellas)
    // Regla: 1 lámina por escalón
    const complementaryItem = createStairComplementaryCartItem(
      activeCollectionName,
      stepCount,
      breakdown.plankPrice,
      breakdown.complementaryPlanksSqft,
      selectedColor,
      notes
    );
    extraItems.push(complementaryItem);

    // Componente 4: Descansos (si landingCount > 0)
    // Regla: 1 caja por cada descanso
    if (landingCount > 0) {
      const landingItem = createStairLandingCartItem(
        activeCollectionName,
        landingCount,
        breakdown.boxUnitPrice,
        sqftPerBox,
        selectedColor,
        notes
      );
      extraItems.push(landingItem);
    }

    onAddToCart(
      selectedProduct,
      stepCount,
      stepUnitPrice,
      false, // Handled explicitly in extraItems
      0,
      selectedColor,
      notes,
      riserType === 'white' ? 'white' : 'match',
      extraItems
    );

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setCurrentStep(1);
    }, 1100);
  };

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* 5) AVISO OBLIGATORIO: EL PRODUCTO DEBE AGREGARSE ANTES     */}
      {/* ======================================================== */}
      <div className="bg-amber-50/90 border-l-4 border-[#FF8407] rounded-r-2xl p-4 shadow-xs flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#FF8407]/15 text-[#FF8407] flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'Important Requirement' : 'Aviso Obligatorio'}
            </span>
            <span className="px-2 py-0.2 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-bold">
              {language === 'en' ? 'Stairs Workflow' : 'Flujo de Escaleras'}
            </span>
          </div>
          <p className="font-bold text-amber-900 text-xs sm:text-sm">
            {language === 'en'
              ? 'The floor product must be added before creating the steps.'
              : 'El producto debe agregarse antes de crear los escalones.'}
          </p>
          <p className="text-[11px] text-amber-800/80 leading-relaxed">
            {language === 'en'
              ? 'Stair treads, risers, and complementary planks are manufactured based on the exact flooring collection specifications (sqft/box, planks/box, and $/sqft).'
              : 'Para fabricar las huellas, contrahuellas y material complementario, se requiere vincular la colección de piso o ingresar sus especificaciones de lámina.'}
          </p>
        </div>
      </div>

      {/* Step Navigation Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
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

        <div className="flex items-center gap-3.5 pt-2 border-t border-[#F2F1EC]">
          <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-lg bg-[#181818] text-[#FF8407] flex items-center justify-center font-bold shrink-0">
            <MoveUpRight className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#181818] leading-snug break-words">
              {currentStep === 1 
                ? (language === 'en' ? '1. Select Stair Tread Package' : '1. Seleccionar modelo de peldaño')
                : (language === 'en' ? '2. Stairs Configuration & Components' : '2. Configuración y Desglose de Componentes')}
            </h3>
            <p className="text-xs text-[#6B6A63] font-medium leading-normal mt-0.5 break-words">
              {currentStep === 1
                ? `${stairProducts.length} ${language === 'en' ? 'tread options (12" x 48" format)' : 'opciones de huella (formato 12" x 48")'}`
                : `${selectedProduct.name} • ${mode === 'solo_steps' ? 'Solo steps' : 'Escalera completa'}`}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: SELECT STAIR TREAD MODEL                         */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="space-y-4">
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
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: STAIRS CONFIGURATION & COMPONENT BREAKDOWN       */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Top selected model badge */}
          <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap text-xs min-w-0">
              <span className="font-bold text-[#181818]">{selectedProduct.name}</span>
              <span className="text-[#9C9A90]">•</span>
              <span className="text-[#6B6A63] font-medium">{selectedProduct.size || '12" x 48"'}</span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-[11px] font-bold text-[#FF8407] hover:underline cursor-pointer shrink-0"
            >
              {language === 'en' ? 'Change Model' : 'Cambiar Modelo'}
            </button>
          </div>

          {/* ======================================================== */}
          {/* 2) MODO DE COTIZACIÓN: "Solo steps" vs "Escalera completa" */}
          {/* ======================================================== */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#181818] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF8407]" />
                {language === 'en' ? 'Quotation Mode' : 'Modo de Cotización'}
              </span>
              <span className="text-[10px] font-semibold text-[#9C9A90] uppercase">
                {language === 'en' ? 'Select Scope' : 'Alcance de la cotización'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción 1: Solo steps */}
              <button
                type="button"
                id="btn-mode-solo-steps"
                onClick={() => setMode('solo_steps')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  mode === 'solo_steps'
                    ? 'border-[#FF8407] bg-amber-50/40 ring-2 ring-[#FF8407]/20 shadow-xs'
                    : 'border-[#E4E2DA] bg-[#FAFAFA] hover:border-zinc-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#181818]">
                      {language === 'en' ? 'Steps Only ("Solo steps")' : 'Solo steps (Huellas)'}
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      mode === 'solo_steps' ? 'border-[#FF8407] bg-[#FF8407] text-white font-bold' : 'border-zinc-300'
                    }`}>
                      {mode === 'solo_steps' && '✓'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6A63] leading-relaxed">
                    {language === 'en'
                      ? 'Only quotation of stair tread steps (12" x 48"). No risers, landings, or complementary planks.'
                      : 'Únicamente se cotizan los escalones o huellas (12" x 48"). No incluye contrahuellas ni descansos.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200/60 text-[10px] font-mono font-bold text-[#FF8407]">
                  {stepCount} peldaños @ {formatCurrency(stepUnitPrice)}
                </div>
              </button>

              {/* Opción 2: Escalera completa */}
              <button
                type="button"
                id="btn-mode-completa"
                onClick={() => setMode('completa')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  mode === 'completa'
                    ? 'border-[#FF8407] bg-amber-50/40 ring-2 ring-[#FF8407]/20 shadow-xs'
                    : 'border-[#E4E2DA] bg-[#FAFAFA] hover:border-zinc-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#181818]">
                      {language === 'en' ? 'Full Staircase ("Escalera completa")' : 'Escalera completa'}
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      mode === 'completa' ? 'border-[#FF8407] bg-[#FF8407] text-white font-bold' : 'border-zinc-300'
                    }`}>
                      {mode === 'completa' && '✓'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6A63] leading-relaxed">
                    {language === 'en'
                      ? 'Includes treads, risers (white or matching floor), landings, and complementary planks to finish the step.'
                      : 'Incluye huellas, contrahuellas (blancas o color piso), descansos y tablas de material complementario.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200/60 text-[10px] font-mono font-bold text-emerald-700">
                  {language === 'en' ? 'Complete breakdown itemized separately' : 'Desglose detallado por ítem separado'}
                </div>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3) CÁLCULO POR LÁMINA: PRODUCTO DEL CATÁLOGO O NUEVO      */}
          {/* ======================================================== */}
          {mode === 'completa' && (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E2DA] pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#181818] flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#FF8407]" />
                    {language === 'en' ? 'Floor Collection & Plank Specs' : 'Colección de Piso y Cálculo por Lámina'}
                  </span>
                  <p className="text-[11px] text-[#6B6A63] mt-0.5">
                    {language === 'en'
                      ? 'Base flooring used for matching risers, complementary planks, and landings.'
                      : 'Piso base utilizado para contrahuellas al tono, tablas complementarias y descansos.'}
                  </p>
                </div>

                {/* Source selector */}
                <div className="flex items-center gap-1.5 p-1 bg-[#F2F1EC] rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFloorSource('catalog')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      floorSource === 'catalog'
                        ? 'bg-white text-[#181818] shadow-xs'
                        : 'text-[#6B6A63] hover:text-[#181818]'
                    }`}
                  >
                    {language === 'en' ? 'From Catalog' : 'Del Catálogo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFloorSource('custom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      floorSource === 'custom'
                        ? 'bg-[#181818] text-white shadow-xs'
                        : 'text-[#6B6A63] hover:text-[#181818]'
                    }`}
                  >
                    {language === 'en' ? '+ New / Custom Floor' : '+ Producto Nuevo / Fuera de Catálogo'}
                  </button>
                </div>
              </div>

              {/* Source 1: From Catalog */}
              {floorSource === 'catalog' && (
                <div className="space-y-3">
                  <label htmlFor="select-floor-product" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                    {language === 'en' ? 'Select Flooring Collection:' : 'Selecciona la Colección de Piso:'}
                  </label>
                  <select
                    id="select-floor-product"
                    value={selectedFloorId}
                    onChange={(e) => handleSelectFloorFromCatalog(e.target.value)}
                    className="w-full text-xs font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-[#FF8407]"
                  >
                    {floorProducts.map(fp => (
                      <option key={fp.id} value={fp.id}>
                        {fp.name} — {fp.sqftPerBox ? `${fp.sqftPerBox} sqft/caja` : ''} • {formatCurrency(fp.basePrice)}/sqft
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Source 2: Custom / New Product */}
              {floorSource === 'custom' && (
                <div className="space-y-3 p-3.5 bg-amber-50/30 rounded-xl border border-amber-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#181818]">
                      {language === 'en' ? 'New Flooring Collection (by code / name):' : 'Nueva Colección por Código / Nombre:'}
                    </span>
                    <span className="text-[10px] font-mono text-[#FF8407] font-semibold">
                      Fuera de Catálogo
                    </span>
                  </div>
                  <input
                    type="text"
                    value={customCollectionName}
                    onChange={(e) => setCustomCollectionName(e.target.value)}
                    placeholder="Ej. Spirit SPC 6.5mm o CUI Select 5mm"
                    className="w-full text-xs font-bold text-[#181818] bg-white border border-[#E4E2DA] rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                  />
                </div>
              )}

              {/* 3) TRES PARÁMETROS OBLIGATORIOS PARA CÁLCULO POR LÁMINA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* 1. Pies cuadrados por caja */}
                <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E2DA] space-y-1">
                  <label htmlFor="input-sqft-box" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                    {language === 'en' ? 'SqFt per Box' : 'Pies² por Caja (sqft)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    id="input-sqft-box"
                    value={sqftPerBox}
                    onChange={(e) => setSqftPerBox(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full text-lg font-bold font-mono text-[#181818] bg-white border border-[#E4E2DA] rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-[#FF8407]"
                  />
                  <span className="text-[10px] text-[#6B6A63] block">Ej: Spirit: 19.29 | CUI: 24.26</span>
                </div>

                {/* 2. Láminas por caja */}
                <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E2DA] space-y-1">
                  <label htmlFor="input-planks-box" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                    {language === 'en' ? 'Planks per Box' : 'Láminas por Caja'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    id="input-planks-box"
                    value={planksPerBox}
                    onChange={(e) => setPlanksPerBox(Math.max(1, parseInt(e.target.value, 10) || 0))}
                    className="w-full text-lg font-bold font-mono text-[#181818] bg-white border border-[#E4E2DA] rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-[#FF8407]"
                  />
                  <span className="text-[10px] text-[#6B6A63] block">Ej: Spirit: 5 | CUI: 10</span>
                </div>

                {/* 3. Precio por pie cuadrado */}
                <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E2DA] space-y-1">
                  <label htmlFor="input-price-sqft" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                    {language === 'en' ? 'Price per SqFt ($/sqft)' : 'Precio por Pie² ($/sqft)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9C9A90]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      id="input-price-sqft"
                      value={pricePerSqft}
                      onChange={(e) => setPricePerSqft(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full text-lg font-bold font-mono text-[#181818] bg-white border border-[#E4E2DA] rounded-lg pl-6 pr-2.5 py-1.5 focus:outline-hidden focus:border-[#FF8407]"
                    />
                  </div>
                  <span className="text-[10px] text-[#6B6A63] block">Ej: Spirit: $2.09 | CUI: $1.49</span>
                </div>
              </div>

              {/* FÓRMULA OFICIAL MOSTRADA Y VALIDADA EN TIEMPO REAL */}
              <div className="p-3.5 bg-[#181818] text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#FF8407]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {language === 'en' ? 'Plank Value Formula Result' : 'Resultado de la Fórmula por Lámina'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A8A8A8] font-mono">
                    {sqftPerBox} ft² ÷ {planksPerBox} láminas × ${pricePerSqft.toFixed(2)}/ft²
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="bg-white/10 rounded-lg p-2.5">
                    <span className="text-[10px] text-[#C9C9C9] block">Pies² por lámina:</span>
                    <div className="text-base font-bold font-mono text-white">
                      {plankValues.sqftPerPlank.toFixed(3)} <span className="text-xs font-normal text-[#C9C9C9]">sqft/lámina</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-2.5">
                    <span className="text-[10px] text-[#C9C9C9] block">Valor por lámina:</span>
                    <div className="text-base font-black font-mono text-[#FF8407]">
                      {formatCurrency(plankValues.plankPrice)} <span className="text-xs font-normal text-white">/ lámina</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP COUNT & STEP TREAD PRICE CONFIGURATION              */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Step Count */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="input-stairs-count" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {language === 'en' ? 'Number of Steps' : 'Cantidad de Escalones'}
                </label>
                <span className="text-[10px] text-[#6B6A63] font-mono">
                  {selectedProduct.size || '12" x 48"'}
                </span>
              </div>

              <input
                type="number"
                id="input-stairs-count"
                value={stepCount}
                onChange={(e) => setStepCount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                min="1"
                step="1"
                className="w-full text-2xl font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
              />

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

            {/* Input Step Unit Price */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="input-stairs-price" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {language === 'en' ? 'Price per Step Tread (Huella)' : 'Precio por Peldaño / Huella ($)'}
                </label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {language === 'en' ? 'Adjustable' : 'Ajustable'}
                </span>
              </div>

              <div className="relative">
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

              <div className="p-2.5 bg-[#F2F1EC] rounded-lg flex items-center justify-between text-xs">
                <span className="text-[#6B6A63]">Subtotal huellas:</span>
                <span className="font-bold font-mono text-[#181818]">{formatCurrency(breakdown.stepsSubtotal)}</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CONTRAHUELLAS Y DESCANSOS (SI MODO === COMPLETA)          */}
          {/* ======================================================== */}
          {mode === 'completa' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Tipo de Contrahuella (Blanca vs Color Piso) */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                    {language === 'en' ? 'Riser Type (Contrahuella)' : 'Tipo de Contrahuella'}
                  </span>
                  <span className="text-[10px] font-semibold text-[#9C9A90]">
                    {stepCount} risers
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRiserType('white')}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      riserType === 'white'
                        ? 'border-[#FF8407] bg-amber-50/50 ring-1 ring-[#FF8407]'
                        : 'border-[#E4E2DA] bg-[#FAFAFA] hover:border-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#181818]">Blanca Laminada</div>
                    <div className="text-[10px] text-[#6B6A63] mt-0.5">Pieza independiente</div>
                    <div className="text-[10px] font-bold text-[#FF8407] mt-1.5">
                      1 lámina/escalón para faltante
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiserType('color_piso')}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      riserType === 'color_piso'
                        ? 'border-[#FF8407] bg-amber-50/50 ring-1 ring-[#FF8407]'
                        : 'border-[#E4E2DA] bg-[#FAFAFA] hover:border-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#181818]">Al Color del Piso</div>
                    <div className="text-[10px] text-[#6B6A63] mt-0.5">Matching SPC Color</div>
                    <div className="text-[10px] font-bold text-[#FF8407] mt-1.5">
                      2 láminas/escalón en total
                    </div>
                  </button>
                </div>

                {/* Si es blanca, permite ajustar el precio unitario de la contrahuella blanca */}
                {riserType === 'white' ? (
                  <div className="pt-2 border-t border-[#E4E2DA] space-y-1.5">
                    <label htmlFor="input-white-riser-price" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                      Precio Unitario Contrahuella Blanca ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9C9A90]">$</span>
                      <input
                        type="number"
                        step="0.50"
                        id="input-white-riser-price"
                        value={riserUnitPrice}
                        onChange={(e) => setRiserUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full text-base font-bold font-mono text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg pl-7 pr-3 py-1.5 focus:outline-hidden focus:border-[#FF8407]"
                      />
                    </div>
                    <div className="text-[11px] text-[#6B6A63] flex justify-between">
                      <span>Subtotal contrahuellas blancas:</span>
                      <strong className="font-mono text-[#181818]">{formatCurrency(breakdown.risersSubtotal)}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/50 text-[11px] text-[#6B6A63] space-y-1">
                    <div className="flex justify-between">
                      <span>Precio derivado por lámina:</span>
                      <strong className="font-mono text-[#181818]">{formatCurrency(breakdown.plankPrice)} c/u</strong>
                    </div>
                    <div className="flex justify-between font-bold text-[#181818]">
                      <span>Subtotal contrahuellas piso:</span>
                      <span className="font-mono text-[#FF8407]">{formatCurrency(breakdown.risersSubtotal)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Número de Descansos (Landings) */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                    {language === 'en' ? 'Landings (Descansos)' : 'Descansos de Escalera'}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    +1 caja por descanso
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLandingCount(prev => Math.max(0, prev - 1))}
                    className="w-10 h-10 rounded-xl border border-[#E4E2DA] bg-[#F2F1EC] hover:bg-[#E4E2DA] text-[#181818] flex items-center justify-center font-bold transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 text-center py-1 bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl">
                    <span className="text-2xl font-black font-mono text-[#181818] block leading-none">
                      {landingCount}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#9C9A90]">
                      {landingCount === 1 ? 'Descanso' : 'Descansos'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLandingCount(prev => prev + 1)}
                    className="w-10 h-10 rounded-xl border border-[#E4E2DA] bg-[#F2F1EC] hover:bg-[#E4E2DA] text-[#181818] flex items-center justify-center font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2.5 bg-[#F2F1EC] rounded-lg text-[11px] text-[#6B6A63] space-y-1">
                  <div className="flex justify-between">
                    <span>Cajas de piso necesarias:</span>
                    <strong className="font-mono text-[#181818]">
                      {landingCount} {landingCount === 1 ? 'caja' : 'cajas'} ({breakdown.landingsSqft} sqft)
                    </strong>
                  </div>
                  <div className="flex justify-between font-bold text-[#181818]">
                    <span>Subtotal descansos:</span>
                    <span className="font-mono text-[#FF8407]">{formatCurrency(breakdown.landingsSubtotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4) DESGLOSE Y TOTAL DE PIES CUADRADOS POR ESCALERA       */}
          {/* ======================================================== */}
          <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E4E2DA] pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF8407]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                  {language === 'en' ? 'Stairs Components Breakdown' : 'Desglose Detallado de la Escalera'}
                </h4>
              </div>

              {/* Total de pies cuadrados de piso por escalera */}
              {mode === 'completa' && (
                <div className="px-3 py-1 bg-white rounded-lg border border-[#E4E2DA] text-xs font-mono font-bold text-[#181818]">
                  Total piso escalera: <span className="text-[#FF8407]">{breakdown.totalFlooringSqft} sqft</span>
                  <span className="text-[10px] text-[#9C9A90] font-normal ml-1">
                    (≈ {breakdown.totalFlooringBoxesEquivalent} cajas)
                  </span>
                </div>
              )}
            </div>

            {/* Line-by-line itemized breakdown preview */}
            <div className="space-y-2 text-xs">
              {/* Componente 1: Steps / Huellas */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E4E2DA]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[#181818] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </span>
                  <div className="min-w-0 leading-snug">
                    <span className="font-bold text-[#181818] block">
                      Huellas / Steps ({selectedProduct.name})
                    </span>
                    <span className="text-[#6B6A63] text-[11px]">
                      {breakdown.stepsCount} peldaños (12" x 48") @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.stepsUnitPrice)}</strong> c/u
                    </span>
                  </div>
                </div>
                <span className="font-bold font-mono text-sm text-[#181818] shrink-0 ml-2">
                  {formatCurrency(breakdown.stepsSubtotal)}
                </span>
              </div>

              {/* Componentes adicionales cuando es escalera completa */}
              {mode === 'completa' && (
                <>
                  {/* Componente 2: Contrahuellas (Risers) */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E4E2DA]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#FF8407] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        2
                      </span>
                      <div className="min-w-0 leading-snug">
                        <span className="font-bold text-[#181818] block">
                          Contrahuellas ({riserType === 'white' ? 'Blanca Laminada' : `Color Piso ${activeCollectionName}`})
                        </span>
                        <span className="text-[#6B6A63] text-[11px]">
                          {riserType === 'white' ? (
                            <>{breakdown.risersCount} contrahuellas @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.risersUnitPrice)}</strong> c/u</>
                          ) : (
                            <>{breakdown.risersCount} láminas ({breakdown.risersSqft} sqft) @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.risersUnitPrice)}</strong>/lámina</>
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-sm text-[#181818] shrink-0 ml-2">
                      {formatCurrency(breakdown.risersSubtotal)}
                    </span>
                  </div>

                  {/* Componente 3: Materiales Complementarios (Tablas que completan el escalón) */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E4E2DA]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        3
                      </span>
                      <div className="min-w-0 leading-snug">
                        <span className="font-bold text-[#181818] block">
                          Material Complementario (Faltantes de Huellas)
                        </span>
                        <span className="text-[#6B6A63] text-[11px]">
                          {breakdown.complementaryPlanksCount} láminas ({breakdown.complementaryPlanksSqft} sqft) @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.complementaryPlankUnitPrice)}</strong>/lámina
                        </span>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-sm text-[#181818] shrink-0 ml-2">
                      {formatCurrency(breakdown.complementarySubtotal)}
                    </span>
                  </div>

                  {/* Componente 4: Descansos */}
                  {landingCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E4E2DA]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          4
                        </span>
                        <div className="min-w-0 leading-snug">
                          <span className="font-bold text-[#181818] block">
                            Descansos de Escalera ({landingCount} {landingCount === 1 ? 'descanso' : 'descansos'})
                          </span>
                          <span className="text-[#6B6A63] text-[11px]">
                            {breakdown.landingsBoxes} caja{breakdown.landingsBoxes !== 1 ? 's' : ''} ({breakdown.landingsSqft} sqft) @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.boxUnitPrice)}</strong>/caja
                          </span>
                        </div>
                      </div>
                      <span className="font-bold font-mono text-sm text-[#181818] shrink-0 ml-2">
                        {formatCurrency(breakdown.landingsSubtotal)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Total Row */}
            <div className="pt-2 border-t border-[#E4E2DA] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                Total de la Escalera:
              </span>
              <span className="text-xl font-black font-mono text-[#FF8407]">
                {formatCurrency(breakdown.totalStairsPrice)}
              </span>
            </div>
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

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
              placeholder={language === 'en' ? 'e.g., Main staircase, matching floor color' : 'Ej: Escalera principal a segundo piso, colección al tono'}
              className="w-full bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg px-3 py-2 text-xs text-[#181818] placeholder:text-[#9C9A90] focus:outline-hidden focus:border-[#FF8407]"
            />
          </div>

          {/* Primary Action Button: Add to Cart */}
          <button
            type="button"
            id="btn-add-stairs-to-quote"
            onClick={handleAddToCart}
            disabled={stepCount <= 0}
            className={`w-full py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
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
                <span>
                  {language === 'en' ? '✓ Added to Quote as Separate Items!' : '✓ ¡Componentes Agregados por Separado a la Cotización!'}
                </span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>
                  {mode === 'solo_steps'
                    ? `+ Agregar ${stepCount} Peldaños a la Cotización (${formatCurrency(breakdown.totalStairsPrice)})`
                    : `+ Agregar Escalera Completa con Componentes Separados (${formatCurrency(breakdown.totalStairsPrice)})`}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
