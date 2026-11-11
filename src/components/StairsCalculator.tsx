import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductColor, Language, CartItem } from '../types';
import { 
  formatCurrency, 
  calculatePlankValues, 
  calculateStairsBreakdown, 
  createStairsCartItem, 
  createRiserCartItem, 
  createStairComplementaryCartItem, 
  createStairLandingCartItem,
  getClientPriceMultiplier
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
  clientCategory?: string;
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
  clientCategory,
  initialProductId,
  initialSelectionKey,
  onAddToCart
}) => {
  const t = translations[language];
  const isEn = language === 'en';
  const homeownerMultiplier = getClientPriceMultiplier(clientCategory);
  const isHomeowner = homeownerMultiplier > 1.0;

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

  // Punto 5: Suministro de la tabla / material
  // 'company' = Empresa la pone (QuickSurfaces - material completo)
  // 'client' = Cliente la trae (precio solo mano de obra / operación)
  const [materialSupplier, setMaterialSupplier] = useState<'company' | 'client'>('company');

  // Formato del piso: 5.5mm (24.26 sqft/caja · 10 láminas) vs 8.0mm (19.29 sqft/caja · 5 láminas) vs Personalizado
  const [floorFormat, setFloorFormat] = useState<'5.5mm' | '8.0mm' | 'custom'>('5.5mm');

  // Step Tread Model
  const [selectedProduct, setSelectedProduct] = useState<Product>(stairProducts[0] || {} as Product);
  const [stepCount, setStepCount] = useState<number>(14);
  const baseStepRate = (stairProducts[0]?.basePrice || 19.00) * homeownerMultiplier;
  const [stepUnitPrice, setStepUnitPrice] = useState<number>(baseStepRate);

  // Reference Floor Collection (para cálculo de láminas y descansos)
  const [floorSource, setFloorSource] = useState<'catalog' | 'custom'>('catalog');
  const [selectedFloorId, setSelectedFloorId] = useState<string>(floorProducts[0]?.id || '');
  const [customCollectionName, setCustomCollectionName] = useState<string>('5.5mm SPC Flooring');
  
  // Floor specs: Pies cuadrados por caja, Láminas por caja, Precio por pie cuadrado
  const [sqftPerBox, setSqftPerBox] = useState<number>(24.26);
  const [planksPerBox, setPlanksPerBox] = useState<number>(10);
  const [pricePerSqft, setPricePerSqft] = useState<number>(Number((1.49 * homeownerMultiplier).toFixed(2)));

  // Escalera Completa: Descansos y Tipo de contrahuella
  const [landingCount, setLandingCount] = useState<number>(0);
  const [riserType, setRiserType] = useState<'white' | 'color_piso'>('color_piso');
  const [riserUnitPrice, setRiserUnitPrice] = useState<number>(Number((9.00 * homeownerMultiplier).toFixed(2))); // Para contrahuella blanca

  // Optional Moldings & Skirt Baseboard
  const [includeMoldings, setIncludeMoldings] = useState<boolean>(false);
  const [moldingsCount, setMoldingsCount] = useState<number>(0);
  const [moldingsUnitPrice, setMoldingsUnitPrice] = useState<number>(Number((16.99 * homeownerMultiplier).toFixed(2)));

  const [includeSkirt, setIncludeSkirt] = useState<boolean>(false);
  const [skirtFeet, setSkirtFeet] = useState<number>(0);
  const [skirtPricePerFoot, setSkirtPricePerFoot] = useState<number>(Number((1.35 * homeownerMultiplier).toFixed(2)));

  // Customer notes & feedback
  const [notes, setNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Switch material supplier helper
  const handleSupplierChange = (supplier: 'company' | 'client') => {
    setMaterialSupplier(supplier);
    if (supplier === 'client') {
      // Cliente trae el material: precio solo mano de obra / ensamble
      const laborStepPrice = Number((11.00 * homeownerMultiplier).toFixed(2));
      setStepUnitPrice(laborStepPrice);
    } else {
      // Empresa la pone: precio completo con material
      const fullStepPrice = Number(((selectedProduct.basePrice || 19.00) * homeownerMultiplier).toFixed(2));
      setStepUnitPrice(fullStepPrice);
    }
  };

  // Switch floor format helper
  const handleFloorFormatChange = (format: '5.5mm' | '8.0mm' | 'custom') => {
    setFloorFormat(format);
    if (format === '5.5mm') {
      setSqftPerBox(24.26);
      setPlanksPerBox(10);
      setPricePerSqft(Number((1.49 * homeownerMultiplier).toFixed(2)));
      setCustomCollectionName('5.5mm SPC Select');
    } else if (format === '8.0mm') {
      setSqftPerBox(19.29);
      setPlanksPerBox(5);
      setPricePerSqft(Number((2.09 * homeownerMultiplier).toFixed(2)));
      setCustomCollectionName('8.0mm SPC Spirit');
    }
  };

  // Re-sync stair prices if client category or multiplier changes
  useEffect(() => {
    if (materialSupplier === 'client') {
      setStepUnitPrice(Number((11.00 * homeownerMultiplier).toFixed(2)));
    } else if (selectedProduct?.basePrice) {
      setStepUnitPrice(Number((selectedProduct.basePrice * homeownerMultiplier).toFixed(2)));
    }
    setPricePerSqft(Number(((floorFormat === '8.0mm' ? 2.09 : 1.49) * homeownerMultiplier).toFixed(2)));
    setRiserUnitPrice(Number((9.00 * homeownerMultiplier).toFixed(2)));
    setMoldingsUnitPrice(Number((16.99 * homeownerMultiplier).toFixed(2)));
    setSkirtPricePerFoot(Number((1.35 * homeownerMultiplier).toFixed(2)));
  }, [clientCategory, homeownerMultiplier, selectedProduct, materialSupplier, floorFormat]);

  // Jump to specific product if passed via search selection
  useEffect(() => {
    if (initialProductId) {
      const match = stairProducts.find(p => p.id === initialProductId);
      if (match) {
        setSelectedProduct(match);
        setStepUnitPrice(Number(((match.basePrice || 19.00) * homeownerMultiplier).toFixed(2)));
        setCurrentStep(2);
        scrollToCalculatorTop();
      }
    }
  }, [initialProductId, initialSelectionKey, stairProducts, homeownerMultiplier]);

  // Sync when products change
  useEffect(() => {
    if (!stairProducts.length) return;
    if (!selectedProduct?.id || !stairProducts.some(p => p.id === selectedProduct.id)) {
      const fallback = stairProducts[0];
      if (fallback) {
        setSelectedProduct(fallback);
        setStepUnitPrice(Number(((fallback.basePrice || 19.00) * homeownerMultiplier).toFixed(2)));
      }
    }
  }, [stairProducts, homeownerMultiplier]);

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
      materialSupplier,
      floorFormat,
      stepCount,
      stepUnitPrice,
      riserType,
      riserUnitPrice,
      landingCount,
      sqftPerBox,
      planksPerBox,
      pricePerSqft,
      moldingsCount: includeMoldings ? moldingsCount : 0,
      moldingsUnitPrice,
      skirtFeet: includeSkirt ? skirtFeet : 0,
      skirtPricePerFoot
    });
  }, [
    mode,
    materialSupplier,
    floorFormat,
    stepCount,
    stepUnitPrice,
    riserType,
    riserUnitPrice,
    landingCount,
    sqftPerBox,
    planksPerBox,
    pricePerSqft,
    includeMoldings,
    moldingsCount,
    moldingsUnitPrice,
    includeSkirt,
    skirtFeet,
    skirtPricePerFoot
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
    const isClientSupplied = materialSupplier === 'client';

    // Step item customized product name if client supplies plank
    const stepProductWithSupplier: Product = {
      ...selectedProduct,
      name: isClientSupplied
        ? `${selectedProduct.name} (M.O. / Ensamblado - Material Cliente)`
        : selectedProduct.name
    };

    // Extra items array for separated components
    const extraItems: CartItem[] = [];

    // CASE 1: SOLO STEPS
    if (mode === 'solo_steps') {
      // Optional moldings
      if (includeMoldings && moldingsCount > 0) {
        extraItems.push({
          id: `item-${Date.now()}-molding-${Math.random().toString(36).substring(2, 6)}`,
          productId: 'stair-flush-nose-molding',
          productName: isEn ? `Flush Stair Nose Molding (${activeCollectionName})` : `Moldura de Terminación Flush Nose (${activeCollectionName})`,
          category: 'perfiles',
          subcategory: isEn ? 'Stair Mouldings' : 'Molduras de Escalera',
          color: selectedColor,
          userEnteredQuantity: moldingsCount,
          quantityUnitLabel: isEn ? 'pieces' : 'piezas',
          calculatedUnits: moldingsCount,
          calculatedUnitsLabel: `${moldingsCount} ${isEn ? (moldingsCount > 1 ? 'pieces' : 'piece') : (moldingsCount > 1 ? 'piezas' : 'pieza')}`,
          unitPrice: moldingsUnitPrice,
          pricingMode: 'per_piece',
          baseListPrice: moldingsUnitPrice,
          subtotal: Number((moldingsCount * moldingsUnitPrice).toFixed(2)),
          isTaxable: true,
          isLabor: false
        });
      }

      onAddToCart(
        stepProductWithSupplier,
        stepCount,
        stepUnitPrice,
        false,
        0,
        selectedColor,
        isClientSupplied ? (isEn ? 'Tread manufacturing labor (customer supplies flooring)' : 'Mano de obra fabricación huellas (material del cliente)') : notes,
        'white',
        extraItems
      );
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        setCurrentStep(1);
      }, 1000);
      return;
    }

    // CASE 2: ESCALERA COMPLETA (Separated Components)
    // Componente 2: Contrahuella (Riser)
    if (riserType === 'white') {
      const whiteRiserItem = createRiserCartItem(
        stepCount,
        riserUnitPrice,
        'white',
        undefined,
        selectedProduct.thickness,
        notes,
        0,
        isEn ? 'Stair Riser (White Laminated Plank)' : 'Contrahuella (Riser Plank White Laminate)'
      );
      extraItems.push(whiteRiserItem);
    } else {
      // Contrahuella color piso
      const matchRiserItem = createRiserCartItem(
        stepCount,
        breakdown.risersUnitPrice,
        'match',
        selectedColor,
        selectedProduct.thickness,
        isClientSupplied 
          ? (isEn ? 'Riser cutting/milling labor (material supplied by customer)' : 'Corte/elaboración de contrahuella (material suministrado por cliente)') 
          : notes,
        breakdown.risersSqft,
        isClientSupplied
          ? (isEn ? `SPC Riser - Cutting Labor (${activeCollectionName})` : `Contrahuella SPC - Mano de Obra Corte (${activeCollectionName})`)
          : (isEn ? `Matching SPC Riser (${activeCollectionName})` : `Contrahuella SPC al tono (${activeCollectionName})`)
      );
      extraItems.push(matchRiserItem);
    }

    // Componente 3: Material Complementario (Tablas que completan el escalón / faltantes de huellas)
    const complementaryItem = createStairComplementaryCartItem(
      activeCollectionName,
      stepCount,
      breakdown.complementaryPlankUnitPrice,
      breakdown.complementaryPlanksSqft,
      selectedColor,
      isClientSupplied 
        ? (isEn ? 'Plank assembly/cutting labor (customer material)' : 'Mano de obra ensamble/corte lámina (material cliente)') 
        : notes
    );
    extraItems.push(complementaryItem);

    // Componente 4: Descansos (si landingCount > 0)
    if (landingCount > 0) {
      const landingUnitPrice = isClientSupplied ? 35.00 : breakdown.boxUnitPrice;
      const landingItem = createStairLandingCartItem(
        activeCollectionName,
        landingCount,
        landingUnitPrice,
        sqftPerBox,
        selectedColor,
        isClientSupplied
          ? (isEn
              ? `Landing installation labor (${landingCount} flooring box(es) supplied by customer)`
              : `Mano de obra instalación de descanso (${landingCount} caja(s) de piso suministrada(s) por el cliente)`)
          : (isEn
              ? `${landingCount} flooring box(es) supplied by QuickSurfaces for landings`
              : `${landingCount} caja(s) de piso suministrada(s) por QuickSurfaces para descansos`)
      );
      extraItems.push(landingItem);
    }

    // Componente 5: Molduras opcionales (Flush Stair Nose)
    if (includeMoldings && moldingsCount > 0) {
      extraItems.push({
        id: `item-${Date.now()}-molding-${Math.random().toString(36).substring(2, 6)}`,
        productId: 'stair-flush-nose-molding',
        productName: isEn ? `Flush Stair Nose Molding (${activeCollectionName})` : `Moldura Flush Stair Nose (${activeCollectionName})`,
        category: 'perfiles',
        subcategory: isEn ? 'Stair Mouldings' : 'Molduras de Escalera',
        color: selectedColor,
        userEnteredQuantity: moldingsCount,
        quantityUnitLabel: isEn ? 'pieces' : 'piezas',
        calculatedUnits: moldingsCount,
        calculatedUnitsLabel: `${moldingsCount} ${isEn ? (moldingsCount > 1 ? 'mouldings' : 'moulding') : (moldingsCount > 1 ? 'molduras' : 'moldura')}`,
        unitPrice: moldingsUnitPrice,
        pricingMode: 'per_piece',
        baseListPrice: moldingsUnitPrice,
        subtotal: Number((moldingsCount * moldingsUnitPrice).toFixed(2)),
        isTaxable: true,
        isLabor: false
      });
    }

    // Componente 6: Rodapié para faldón (Skirt Baseboard)
    if (includeSkirt && skirtFeet > 0) {
      extraItems.push({
        id: `item-${Date.now()}-skirt-${Math.random().toString(36).substring(2, 6)}`,
        productId: 'stair-skirt-baseboard',
        productName: isEn ? `Stair Skirt Baseboard (${activeCollectionName})` : `Rodapié para Faldón de Escalera (${activeCollectionName})`,
        category: 'rodapie',
        subcategory: isEn ? 'Stair Skirt' : 'Faldón de Escalera',
        color: selectedColor,
        userEnteredQuantity: skirtFeet,
        quantityUnitLabel: 'LF',
        calculatedUnits: skirtFeet,
        calculatedUnitsLabel: `${skirtFeet} ${isEn ? 'linear feet' : 'pies lineales'}`,
        unitPrice: skirtPricePerFoot,
        pricingMode: 'fixed',
        pricePerLinearFt: skirtPricePerFoot,
        baseListPrice: skirtPricePerFoot,
        subtotal: Number((skirtFeet * skirtPricePerFoot).toFixed(2)),
        isTaxable: true,
        isLabor: false
      });
    }

    onAddToCart(
      stepProductWithSupplier,
      stepCount,
      stepUnitPrice,
      false, // Handled explicitly in extraItems
      0,
      selectedColor,
      isClientSupplied ? (isEn ? `Manufacturing labor (customer supplies flooring) - ${notes}` : `Mano de obra fabricación (cliente suministra piso) - ${notes}`) : notes,
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
          {/* Top selected model badge & client tariff pill */}
          <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap text-xs min-w-0">
              <span className="font-bold text-[#181818]">{selectedProduct.name}</span>
              <span className="text-[#9C9A90]">•</span>
              <span className="text-[#6B6A63] font-medium">{selectedProduct.size || '12" x 48"'}</span>
              {isHomeowner ? (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {isEn ? 'Homeowner Rate (+30% Retail)' : 'Tarifa Homeowner (+30% Retail)'}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  {isEn ? 'Contractor Rate (Base Price)' : 'Tarifa Contratista (Precio Base)'}
                </span>
              )}
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
          {/* PUNTO 5: SUMINISTRO DE LA TABLA (EMPRESA VS CLIENTE)      */}
          {/* ======================================================== */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#181818] flex items-center gap-2">
                <Box className="w-4 h-4 text-[#FF8407]" />
                {isEn ? 'Material Supply (Who provides the plank?)' : 'Suministro de la Tabla / Material'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                Punto 5
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción A: Empresa la pone (QuickSurfaces) */}
              <button
                type="button"
                id="btn-supplier-company"
                onClick={() => handleSupplierChange('company')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  materialSupplier === 'company'
                    ? 'border-[#FF8407] bg-amber-50/40 ring-2 ring-[#FF8407]/20 shadow-xs'
                    : 'border-[#E4E2DA] bg-[#FAFAFA] hover:border-zinc-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#181818]">
                      {isEn ? 'Company Supplies (QuickSurfaces)' : 'Empresa la pone (QuickSurfaces)'}
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      materialSupplier === 'company' ? 'border-[#FF8407] bg-[#FF8407] text-white font-bold' : 'border-zinc-300'
                    }`}>
                      {materialSupplier === 'company' && '✓'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6A63] leading-relaxed">
                    {isEn 
                      ? 'Complete price with material: QuickSurfaces supplies stair treads, planks for risers, and flooring boxes for landings.'
                      : 'Precio completo con material: QuickSurfaces suministra los peldaños, láminas para contrahuellas y cajas de piso para descansos.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200/60 text-[10px] font-mono font-bold text-emerald-700">
                  {isEn ? 'Complete material included in quote' : 'Material completo incluido en cotización'}
                </div>
              </button>

              {/* Opción B: Cliente la trae */}
              <button
                type="button"
                id="btn-supplier-client"
                onClick={() => handleSupplierChange('client')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  materialSupplier === 'client'
                    ? 'border-[#FF8407] bg-amber-50/40 ring-2 ring-[#FF8407]/20 shadow-xs'
                    : 'border-[#E4E2DA] bg-[#FAFAFA] hover:border-zinc-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#181818]">
                      {isEn ? 'Customer Supplies (Labor Only)' : 'Cliente la trae (Solo Mano de Obra)'}
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      materialSupplier === 'client' ? 'border-[#FF8407] bg-[#FF8407] text-white font-bold' : 'border-zinc-300'
                    }`}>
                      {materialSupplier === 'client' && '✓'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6A63] leading-relaxed">
                    {isEn
                      ? 'Labor / fabrication price only: Customer supplies their flooring planks. Only milling, cutting, and assembly are charged.'
                      : 'Precio solo de mano de obra/operación: El cliente suministra sus tablas de piso. Se cobra únicamente el maquinado, corte y armado.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200/60 text-[10px] font-mono font-bold text-[#FF8407]">
                  {isEn ? 'Labor only / Customer supplies flooring boxes' : 'Solo M.O. / El cliente provee las cajas de piso'}
                </div>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2) MODO DE COTIZACIÓN: "Solo steps" vs "Escalera completa" */}
          {/* ======================================================== */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#181818] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF8407]" />
                {isEn ? 'Quotation Scope' : 'Modo de Cotización'}
              </span>
              <span className="text-[10px] font-semibold text-[#9C9A90] uppercase">
                {isEn ? 'Select Scope' : 'Alcance de la cotización'}
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
                      {isEn ? 'Steps Only (Treads)' : 'Solo steps (Huellas)'}
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      mode === 'solo_steps' ? 'border-[#FF8407] bg-[#FF8407] text-white font-bold' : 'border-zinc-300'
                    }`}>
                      {mode === 'solo_steps' && '✓'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6A63] leading-relaxed">
                    {isEn
                      ? 'Quotes only the stair treads (12" x 48"). Does not include risers or landings.'
                      : 'Únicamente se cotizan los escalones o huellas (12" x 48"). No incluye contrahuellas ni descansos.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200/60 text-[10px] font-mono font-bold text-[#FF8407]">
                  {stepCount} {isEn ? 'treads' : 'peldaños'} @ {formatCurrency(stepUnitPrice)}
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
                      {isEn ? 'Full Staircase' : 'Escalera completa'}
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      mode === 'completa' ? 'border-[#FF8407] bg-[#FF8407] text-white font-bold' : 'border-zinc-300'
                    }`}>
                      {mode === 'completa' && '✓'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6A63] leading-relaxed">
                    {isEn
                      ? 'Includes treads, risers (white or matching floor), landings, and complementary planks.'
                      : 'Incluye huellas, contrahuellas (blancas o color piso), descansos y tablas de material complementario.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200/60 text-[10px] font-mono font-bold text-emerald-700">
                  {isEn ? 'Itemized breakdown by separate component' : 'Desglose detallado por componente separado'}
                </div>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3) FORMATO DEL PISO & CÁLCULO POR LÁMINA                  */}
          {/* ======================================================== */}
          {mode === 'completa' && (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E2DA] pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#181818] flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#FF8407]" />
                    <span>{isEn ? 'Flooring Collection & Format (8 mm vs 5.5 mm)' : 'Colección de Piso y Formato (8 mm vs 5.5 mm)'}</span>
                  </span>
                  <p className="text-[11px] text-[#6B6A63] mt-0.5">
                    {isEn ? 'Flooring boxes are not proportional in sq ft or planks depending on thickness/format.' : 'Las cajas no son proporcionales en pies ni planchas según el grosor/formato del piso.'}
                  </p>
                </div>

                {/* Formato presets pills */}
                <div className="flex items-center gap-1.5 p-1 bg-[#F2F1EC] rounded-xl self-start sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleFloorFormatChange('5.5mm')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      floorFormat === '5.5mm'
                        ? 'bg-black text-white shadow-xs'
                        : 'text-[#6B6A63] hover:text-[#181818]'
                    }`}
                  >
                    5.5 mm (10 pcs · 24.26 ft²)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFloorFormatChange('8.0mm')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      floorFormat === '8.0mm'
                        ? 'bg-black text-white shadow-xs'
                        : 'text-[#6B6A63] hover:text-[#181818]'
                    }`}
                  >
                    8.0 mm (5 pcs · 19.29 ft²)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFloorFormat('custom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      floorFormat === 'custom'
                        ? 'bg-[#FF8407] text-white shadow-xs'
                        : 'text-[#6B6A63] hover:text-[#181818]'
                    }`}
                  >
                    {isEn ? 'Custom' : 'Personalizado'}
                  </button>
                </div>
              </div>

              {/* Source selector: Catalog vs Custom */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90]">
                  {isEn ? 'Flooring Source:' : 'Origen del piso:'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFloorSource('catalog')}
                    className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      floorSource === 'catalog' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600 hover:text-black'
                    }`}
                  >
                    {isEn ? 'From Catalog' : 'Del Catálogo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFloorSource('custom')}
                    className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      floorSource === 'custom' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600 hover:text-black'
                    }`}
                  >
                    {isEn ? 'New / Non-Catalog Product' : 'Producto Nuevo / Fuera de Catálogo'}
                  </button>
                </div>
              </div>

              {/* Source 1: From Catalog */}
              {floorSource === 'catalog' && (
                <div className="space-y-1.5">
                  <label htmlFor="select-floor-product" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                    {isEn ? 'Select Flooring Collection:' : 'Selecciona la Colección de Piso:'}
                  </label>
                  <select
                    id="select-floor-product"
                    value={selectedFloorId}
                    onChange={(e) => handleSelectFloorFromCatalog(e.target.value)}
                    className="w-full text-xs font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-[#FF8407]"
                  >
                    {floorProducts.map(fp => (
                      <option key={fp.id} value={fp.id}>
                        {fp.name} — {fp.sqftPerBox ? `${fp.sqftPerBox} ${isEn ? 'sqft/box' : 'sqft/caja'}` : ''} • {formatCurrency(fp.basePrice * homeownerMultiplier)}/sqft
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Source 2: Custom / New Product */}
              {floorSource === 'custom' && (
                <div className="space-y-2 p-3 bg-amber-50/40 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#181818]">
                      {isEn ? 'New Collection by Code / Name:' : 'Nueva Colección por Código / Nombre:'}
                    </span>
                    <span className="text-[10px] font-mono text-[#FF8407] font-semibold">
                      {isEn ? 'Non-Catalog' : 'Fuera de Catálogo'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={customCollectionName}
                    onChange={(e) => setCustomCollectionName(e.target.value)}
                    placeholder={isEn ? 'e.g. Spirit SPC 8mm or CUI Select 5.5mm' : 'Ej. Spirit SPC 8mm o CUI Select 5.5mm'}
                    className="w-full text-xs font-bold text-[#181818] bg-white border border-[#E4E2DA] rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                  />
                </div>
              )}

              {/* 3) TRES PARÁMETROS OBLIGATORIOS PARA CÁLCULO POR LÁMINA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* 1. Pies cuadrados por caja */}
                <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E2DA] space-y-1">
                  <label htmlFor="input-sqft-box" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                    {isEn ? 'Sq Ft per Box (sqft)' : 'Pies² por Caja (sqft)'}
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
                  <span className="text-[10px] text-[#6B6A63] block">5.5mm: 24.26 | 8mm: 19.29</span>
                </div>

                {/* 2. Láminas por caja */}
                <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E2DA] space-y-1">
                  <label htmlFor="input-planks-box" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                    {isEn ? 'Planks per Box' : 'Láminas por Caja'}
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
                  <span className="text-[10px] text-[#6B6A63] block">5.5mm: 10 | 8mm: 5</span>
                </div>

                {/* 3. Precio por pie cuadrado */}
                <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E2DA] space-y-1">
                  <label htmlFor="input-price-sqft" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                    {isEn ? 'Price per Sq Ft ($/sqft)' : 'Precio por Pie² ($/sqft)'}
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
                  <span className="text-[10px] text-[#6B6A63] block">{isEn ? 'Base price adjusted by customer type' : 'Base ajustada por tipo de cliente'}</span>
                </div>
              </div>

              {/* FÓRMULA OFICIAL MOSTRADA Y VALIDADA EN TIEMPO REAL */}
              <div className="p-3.5 bg-[#181818] text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#FF8407]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {isEn ? 'Official Per-Plank Formula:' : 'Fórmula Oficial por Lámina:'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A8A8A8] font-mono">
                    {sqftPerBox} ft² ÷ {planksPerBox} {isEn ? 'planks' : 'láminas'} × ${pricePerSqft.toFixed(2)}/ft²
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="bg-white/10 rounded-lg p-2.5">
                    <span className="text-[10px] text-[#C9C9C9] block">{isEn ? 'Sq Ft per plank:' : 'Pies² por lámina:'}</span>
                    <div className="text-base font-bold font-mono text-white">
                      {plankValues.sqftPerPlank.toFixed(3)} <span className="text-xs font-normal text-[#C9C9C9]">{isEn ? 'sqft/plank' : 'sqft/lámina'}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-2.5">
                    <span className="text-[10px] text-[#C9C9C9] block">{isEn ? 'Commercial value per plank:' : 'Valor comercial por lámina:'}</span>
                    <div className="text-base font-black font-mono text-[#FF8407]">
                      {formatCurrency(plankValues.plankPrice)} <span className="text-xs font-normal text-white">{isEn ? '/ plank' : '/ lámina'}</span>
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
                <span className="text-[10px] text-[#9C9A90] font-semibold uppercase">{isEn ? 'Quick:' : 'Rápido:'}</span>
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
                  {materialSupplier === 'client' 
                    ? (isEn ? 'Labor / Assembly Price per Step ($)' : 'Precio M.O. / Ensamble por Escalón ($)')
                    : (isEn ? 'Complete Step Tread Price ($)' : 'Precio por Peldaño / Huella Completo ($)')}
                </label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {materialSupplier === 'client' ? (isEn ? 'Labor Only' : 'Solo Mano de Obra') : (isEn ? 'Full Material' : 'Material Completo')}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#9C9A90]">$</span>
                <input
                  type="number"
                  step="0.50"
                  id="input-stairs-price"
                  value={stepUnitPrice}
                  onChange={(e) => setStepUnitPrice(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full text-2xl font-bold text-[#181818] bg-[#FAFAFA] border border-[#E4E2DA] rounded-xl pl-8 pr-3 py-2 focus:outline-hidden focus:border-[#FF8407]"
                />
              </div>

              <div className="p-2.5 bg-[#F2F1EC] rounded-lg flex items-center justify-between text-xs">
                <span className="text-[#6B6A63]">{isEn ? 'Treads subtotal:' : 'Subtotal peldaños:'}</span>
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
                    {isEn ? 'Riser Style' : 'Tipo de Contrahuella'}
                  </span>
                  <span className="text-[10px] font-semibold text-[#9C9A90]">
                    {stepCount} {isEn ? 'risers' : 'contrahuellas'}
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
                    <div className="text-xs font-bold text-[#181818]">{isEn ? 'White Laminated' : 'Blanca Laminada'}</div>
                    <div className="text-[10px] text-[#6B6A63] mt-0.5">{isEn ? 'Independent piece' : 'Pieza independiente'}</div>
                    <div className="text-[10px] font-bold text-[#FF8407] mt-1.5">
                      {isEn ? '1 plank/step for extension' : '1 lámina/escalón para faltante'}
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
                    <div className="text-xs font-bold text-[#181818]">{isEn ? 'Matching Floor Color' : 'Al Color del Piso'}</div>
                    <div className="text-[10px] text-[#6B6A63] mt-0.5">{isEn ? 'Matching SPC Color' : 'Matching SPC Color'}</div>
                    <div className="text-[10px] font-bold text-[#FF8407] mt-1.5">
                      {isEn ? '2 planks/step in total' : '2 láminas/escalón en total'}
                    </div>
                  </button>
                </div>

                {/* Si es blanca */}
                {riserType === 'white' ? (
                  <div className="pt-2 border-t border-[#E4E2DA] space-y-1.5">
                    <label htmlFor="input-white-riser-price" className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                      {isEn ? 'White Riser Unit Price ($)' : 'Precio Unitario Contrahuella Blanca ($)'}
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
                      <span>{isEn ? 'White risers subtotal:' : 'Subtotal contrahuellas blancas:'}</span>
                      <strong className="font-mono text-[#181818]">{formatCurrency(breakdown.risersSubtotal)}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/50 text-[11px] text-[#6B6A63] space-y-1">
                    <div className="flex justify-between">
                      <span>{materialSupplier === 'client' ? (isEn ? 'Labor cut per riser:' : 'M.O. Corte por contrahuella:') : (isEn ? 'Price per plank:' : 'Precio derivado por lámina:')}</span>
                      <strong className="font-mono text-[#181818]">{formatCurrency(breakdown.risersUnitPrice)} {isEn ? 'ea' : 'c/u'}</strong>
                    </div>
                    <div className="flex justify-between font-bold text-[#181818]">
                      <span>{isEn ? 'Risers subtotal:' : 'Subtotal contrahuellas:'}</span>
                      <span className="font-mono text-[#FF8407]">{formatCurrency(breakdown.risersSubtotal)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Número de Descansos (Landings) */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                    {isEn ? 'Stair Landings' : 'Descansos de Escalera'}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {isEn ? '+1 box per landing' : '+1 caja por descanso'}
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
                      {isEn ? (landingCount === 1 ? 'Landing' : 'Landings') : (landingCount === 1 ? 'Descanso' : 'Descansos')}
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
                    <span>{isEn ? 'Flooring boxes for landings:' : 'Cajas de piso para descansos:'}</span>
                    <strong className="font-mono text-[#181818]">
                      {landingCount} {landingCount === 1 ? (isEn ? 'box' : 'caja') : (isEn ? 'boxes' : 'cajas')} ({breakdown.landingsSqft} sqft)
                    </strong>
                  </div>
                  <div className="flex justify-between font-bold text-[#181818]">
                    <span>{isEn ? 'Landings subtotal:' : 'Subtotal descansos:'}</span>
                    <span className="font-mono text-[#FF8407]">{formatCurrency(breakdown.landingsSubtotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MOLDURAS & FALDONES OPCIONALES                            */}
          {/* ======================================================== */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E4E2DA] shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#181818] block">
              {isEn ? 'Optional Stair Mouldings & Accessories' : 'Molduras & Accesorios Opcionales para Escalera'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Moldura Flush Nose */}
              <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E2DA] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMoldings}
                    onChange={(e) => {
                      setIncludeMoldings(e.target.checked);
                      if (e.target.checked && moldingsCount === 0) setMoldingsCount(1);
                    }}
                    className="w-4 h-4 accent-[#FF8407] rounded"
                  />
                  <span className="text-xs font-bold text-[#181818]">
                    {isEn ? 'Flush Stair Nose Finish Moulding' : 'Moldura de Terminación Flush Nose'}
                  </span>
                </label>

                {includeMoldings && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      min="1"
                      value={moldingsCount}
                      onChange={(e) => setMoldingsCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20 text-xs font-bold font-mono bg-white border border-[#E4E2DA] rounded-lg px-2 py-1"
                    />
                    <span className="text-xs text-[#6B6A63]">{isEn ? 'pieces' : 'piezas'} @ {formatCurrency(moldingsUnitPrice)}</span>
                  </div>
                )}
              </div>

              {/* Rodapié Faldón */}
              <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E4E2DA] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSkirt}
                    onChange={(e) => {
                      setIncludeSkirt(e.target.checked);
                      if (e.target.checked && skirtFeet === 0) setSkirtFeet(16);
                    }}
                    className="w-4 h-4 accent-[#FF8407] rounded"
                  />
                  <span className="text-xs font-bold text-[#181818]">
                    {isEn ? 'Skirt Baseboard' : 'Rodapié para Faldón (Skirt Baseboard)'}
                  </span>
                </label>

                {includeSkirt && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      min="1"
                      value={skirtFeet}
                      onChange={(e) => setSkirtFeet(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20 text-xs font-bold font-mono bg-white border border-[#E4E2DA] rounded-lg px-2 py-1"
                    />
                    <span className="text-xs text-[#6B6A63]">LF @ {formatCurrency(skirtPricePerFoot)}/LF</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4) DESGLOSE Y TOTAL DE PIES CUADRADOS POR ESCALERA       */}
          {/* ======================================================== */}
          <div className="bg-[#F2F1EC] border border-[#E4E2DA] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E4E2DA] pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF8407]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#181818]">
                  {isEn ? 'Detailed Staircase Breakdown' : 'Desglose Detallado de la Escalera'}
                </h4>
              </div>

              {/* Total de pies cuadrados de piso por escalera */}
              {mode === 'completa' && (
                <div className="px-3 py-1 bg-white rounded-lg border border-[#E4E2DA] text-xs font-mono font-bold text-[#181818]">
                  {isEn ? 'Total stairs flooring:' : 'Total piso escalera:'} <span className="text-[#FF8407]">{breakdown.totalFlooringSqft} sqft</span>
                  <span className="text-[10px] text-[#9C9A90] font-normal ml-1">
                    (≈ {breakdown.totalFlooringBoxesEquivalent} {isEn ? 'boxes' : 'cajas'})
                  </span>
                </div>
              )}
            </div>

            {/* Boxes callout box */}
            {mode === 'completa' && (
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                materialSupplier === 'client' 
                  ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
              }`}>
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#FF8407] shrink-0" />
                  <span>
                    {materialSupplier === 'client'
                      ? (isEn
                          ? `Flooring boxes customer must bring to shop: ${breakdown.clientBoxesToProvide} boxes (${breakdown.totalFlooringSqft} sqft)`
                          : `Cajas de piso que el cliente debe traer al taller: ${breakdown.clientBoxesToProvide} cajas (${breakdown.totalFlooringSqft} sqft)`)
                      : (isEn
                          ? `Flooring boxes supplied by QuickSurfaces: ${breakdown.totalBoxesNeeded} boxes (${breakdown.totalFlooringSqft} sqft)`
                          : `Cajas de piso suministradas por QuickSurfaces: ${breakdown.totalBoxesNeeded} cajas (${breakdown.totalFlooringSqft} sqft)`)}
                  </span>
                </div>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-white border border-black/10">
                  {breakdown.totalBoxesNeeded} {isEn ? 'boxes total' : 'cajas total'}
                </span>
              </div>
            )}

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
                      {isEn ? 'Stair Treads / Steps' : 'Huellas / Steps'} ({selectedProduct.name})
                    </span>
                    <span className="text-[#6B6A63] text-[11px]">
                      {breakdown.stepsCount} {isEn ? 'treads' : 'peldaños'} (12" x 48") @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.stepsUnitPrice)}</strong> {isEn ? 'ea' : 'c/u'}
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
                          {isEn ? 'Stair Risers' : 'Contrahuellas'} ({riserType === 'white' ? (isEn ? 'White Laminated' : 'Blanca Laminada') : (isEn ? `Matching Floor Color ${activeCollectionName}` : `Color Piso ${activeCollectionName}`)})
                        </span>
                        <span className="text-[#6B6A63] text-[11px]">
                          {riserType === 'white' ? (
                            <>{breakdown.risersCount} {isEn ? 'risers' : 'contrahuellas'} @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.risersUnitPrice)}</strong> {isEn ? 'ea' : 'c/u'}</>
                          ) : (
                            <>{breakdown.risersCount} {isEn ? 'planks' : 'láminas'} ({breakdown.risersSqft} sqft) @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.risersUnitPrice)}</strong>{isEn ? '/plank' : '/lámina'}</>
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
                          {isEn ? 'Complementary Material (Tread Extensions)' : 'Material Complementario (Faltantes de Huellas)'}
                        </span>
                        <span className="text-[#6B6A63] text-[11px]">
                          {breakdown.complementaryPlanksCount} {isEn ? 'planks' : 'láminas'} ({breakdown.complementaryPlanksSqft} sqft) @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.complementaryPlankUnitPrice)}</strong>{isEn ? '/plank' : '/lámina'}
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
                            {isEn ? 'Stair Landings' : 'Descansos de Escalera'} ({landingCount} {isEn ? (landingCount === 1 ? 'landing' : 'landings') : (landingCount === 1 ? 'descanso' : 'descansos')})
                          </span>
                          <span className="text-[#6B6A63] text-[11px]">
                            {breakdown.landingsBoxes} {isEn ? (breakdown.landingsBoxes === 1 ? 'box' : 'boxes') : (breakdown.landingsBoxes === 1 ? 'caja' : 'cajas')} ({breakdown.landingsSqft} sqft) @ <strong className="text-[#181818] font-mono">{formatCurrency(breakdown.boxUnitPrice)}</strong>{isEn ? '/box' : '/caja'}
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
                {isEn ? 'Total Stairs Price:' : 'Total de la Escalera:'}
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
                    ? (isEn
                        ? `+ Add ${stepCount} Stair Treads to Quote (${formatCurrency(breakdown.totalStairsPrice)})`
                        : `+ Agregar ${stepCount} Peldaños a la Cotización (${formatCurrency(breakdown.totalStairsPrice)})`)
                    : (isEn
                        ? `+ Add Full Staircase with Separate Components (${formatCurrency(breakdown.totalStairsPrice)})`
                        : `+ Agregar Escalera Completa con Componentes Separados (${formatCurrency(breakdown.totalStairsPrice)})`)}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
