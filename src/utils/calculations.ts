import { CartItem, Product, ProductColor } from '../types';

export function calculateFloorUnits(sqftRequired: number, sqftPerBox: number): {
  boxesNeeded: number;
  totalSqftCovered: number;
  wastePercent: number;
} {
  if (!sqftRequired || sqftRequired <= 0 || !sqftPerBox || sqftPerBox <= 0) {
    return { boxesNeeded: 0, totalSqftCovered: 0, wastePercent: 0 };
  }

  // Standard rounding as requested: 5.6 -> 6 boxes, 5.4 -> 5 boxes
  const rawBoxes = sqftRequired / sqftPerBox;
  let boxesNeeded = Math.round(rawBoxes);
  if (boxesNeeded === 0 && sqftRequired > 0) {
    boxesNeeded = 1;
  }

  const totalSqftCovered = Number((boxesNeeded * sqftPerBox).toFixed(2));
  const wastePercent = Number((((totalSqftCovered - sqftRequired) / sqftRequired) * 100).toFixed(1));

  return {
    boxesNeeded,
    totalSqftCovered,
    wastePercent: wastePercent >= 0 ? wastePercent : 0
  };
}

export function calculateBaseboardUnits(linearFeetRequired: number, stripLengthFeet: number = 16): {
  stripsNeeded: number;
  totalLinearFeetCovered: number;
  surplusFeet: number;
} {
  if (!linearFeetRequired || linearFeetRequired <= 0 || !stripLengthFeet || stripLengthFeet <= 0) {
    return { stripsNeeded: 0, totalLinearFeetCovered: 0, surplusFeet: 0 };
  }

  // ALWAYS ROUND UP to nearest multiple of strip length (e.g. 16 ft)
  const stripsNeeded = Math.ceil(linearFeetRequired / stripLengthFeet);
  const totalLinearFeetCovered = stripsNeeded * stripLengthFeet;
  const surplusFeet = totalLinearFeetCovered - linearFeetRequired;

  return {
    stripsNeeded,
    totalLinearFeetCovered,
    surplusFeet
  };
}

export function createFloorCartItem(
  product: Product,
  sqftRequired: number,
  pricePerSqft: number,
  color?: ProductColor,
  notes?: string
): CartItem {
  const sqftPerBox = product.sqftPerBox || 24.26;
  const { boxesNeeded, totalSqftCovered } = calculateFloorUnits(sqftRequired, sqftPerBox);
  const boxUnitPrice = Number((sqftPerBox * pricePerSqft).toFixed(2));
  const subtotal = Number((boxesNeeded * boxUnitPrice).toFixed(2));

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: product.id,
    productName: product.name,
    category: 'piso',
    subcategory: product.subcategory,
    thickness: product.thickness,
    size: product.size,
    color,
    userEnteredQuantity: sqftRequired,
    quantityUnitLabel: 'sqft',
    calculatedUnits: boxesNeeded,
    calculatedUnitsLabel: `${boxesNeeded} cajas (${totalSqftCovered} sqft)`,
    unitPrice: boxUnitPrice,
    pricingMode: 'per_box',
    pricePerSqft: pricePerSqft,
    sqftPerBox: sqftPerBox,
    baseListPrice: product.basePrice,
    subtotal,
    isTaxable: true,
    isLabor: false,
    notes
  };
}

export function createBaseboardCartItem(
  product: Product,
  linearFeetRequired: number,
  pricePerLinearFt: number,
  color?: ProductColor,
  notes?: string
): CartItem {
  const stripLength = product.stripLengthFeet || 16;
  const { stripsNeeded, totalLinearFeetCovered } = calculateBaseboardUnits(linearFeetRequired, stripLength);
  const stripUnitPrice = Number((stripLength * pricePerLinearFt).toFixed(2));
  const subtotal = Number((stripsNeeded * stripUnitPrice).toFixed(2));

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: product.id,
    productName: product.name,
    category: 'rodapie',
    subcategory: product.subcategory,
    thickness: product.thickness,
    size: product.size,
    color,
    userEnteredQuantity: linearFeetRequired,
    quantityUnitLabel: 'pies lineales (LF)',
    calculatedUnits: stripsNeeded,
    calculatedUnitsLabel: `${stripsNeeded} tiras de ${stripLength} ft (${totalLinearFeetCovered} LF)`,
    unitPrice: stripUnitPrice,
    pricingMode: 'per_strip',
    pricePerLinearFt: pricePerLinearFt,
    stripLengthFeet: stripLength,
    baseListPrice: product.basePrice,
    subtotal,
    isTaxable: true,
    isLabor: false,
    notes
  };
}

export function createProfileCartItem(
  product: Product,
  pieceCount: number,
  unitPrice: number,
  color?: ProductColor,
  notes?: string
): CartItem {
  const subtotal = Number((pieceCount * unitPrice).toFixed(2));

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: product.id,
    productName: product.name,
    category: 'perfiles',
    subcategory: product.subcategory,
    thickness: product.thickness,
    size: product.size,
    color,
    userEnteredQuantity: pieceCount,
    quantityUnitLabel: 'piezas',
    calculatedUnits: pieceCount,
    calculatedUnitsLabel: `${pieceCount} pieza${pieceCount > 1 ? 's' : ''}`,
    unitPrice: unitPrice,
    pricingMode: 'per_piece',
    baseListPrice: product.basePrice,
    subtotal,
    isTaxable: true,
    isLabor: false,
    notes
  };
}

export function createStairsCartItem(
  product: Product,
  stepCount: number,
  stepUnitPrice: number,
  includeRiser: boolean = false,
  riserUnitPrice: number = 9.00,
  color?: ProductColor,
  notes?: string
): CartItem {
  if (!includeRiser) {
    const subtotal = Number((stepCount * stepUnitPrice).toFixed(2));
    const cleanName = product.name.includes('Huella') || product.name.includes('Tread') 
      ? product.name 
      : `${product.name} (Huella / Tread)`;

    return {
      id: `item-${Date.now()}-step-${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      productName: cleanName,
      category: 'escalones',
      subcategory: 'Stair Treads',
      thickness: product.thickness,
      size: product.size || '12" x 48"',
      color: color || product.colors?.[0],
      userEnteredQuantity: stepCount,
      quantityUnitLabel: 'escalones',
      calculatedUnits: stepCount,
      calculatedUnitsLabel: `${stepCount} peldaños (12" x 48")`,
      unitPrice: stepUnitPrice,
      pricingMode: 'per_piece',
      baseListPrice: product.basePrice,
      subtotal,
      isTaxable: true,
      isLabor: false,
      notes
    };
  }

  // Legacy composite calculation if both are kept in a single item
  const stepsTotal = stepCount * stepUnitPrice;
  const risersTotal = stepCount * riserUnitPrice;
  const subtotal = Number((stepsTotal + risersTotal).toFixed(2));

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: product.id,
    productName: product.name,
    category: 'escalones',
    subcategory: product.subcategory,
    thickness: product.thickness,
    size: product.size,
    color,
    userEnteredQuantity: stepCount,
    quantityUnitLabel: 'escalones',
    calculatedUnits: stepCount,
    calculatedUnitsLabel: `${stepCount} peldaños + ${stepCount} contrahuellas`,
    unitPrice: stepUnitPrice + riserUnitPrice,
    pricingMode: 'per_piece',
    baseListPrice: product.basePrice,
    subtotal,
    isTaxable: true,
    isLabor: false,
    stepIncludesRiser: true,
    riserCount: stepCount,
    riserUnitPrice: riserUnitPrice,
    notes
  };
}

export function createRiserCartItem(
  stepCount: number,
  riserUnitPrice: number = 9.00,
  style: 'white' | 'match' = 'white',
  matchingColor?: ProductColor,
  thickness?: string,
  notes?: string,
  riserSqft?: number,
  productNameOverride?: string
): CartItem {
  const subtotal = Number((stepCount * riserUnitPrice).toFixed(2));
  const isWhite = style !== 'match';
  const color: ProductColor = isWhite 
    ? { name: 'White Laminate', code: 'WHITE', hex: '#FFFFFF' }
    : (matchingColor || { name: 'Al tono del peldaño', code: 'MATCH', hex: '#C7B28E' });

  const label = riserSqft && riserSqft > 0
    ? `${stepCount} contrahuellas (${riserSqft} sqft)`
    : `${stepCount} contrahuellas / risers`;

  return {
    id: `item-${Date.now()}-riser-${Math.random().toString(36).substring(2, 7)}`,
    productId: 'steps-riser-plank',
    productName: productNameOverride || (isWhite 
      ? 'Contrahuella (Riser Plank White Laminate)' 
      : 'Contrahuella SPC (Al tono de la huella)'),
    category: 'escalones',
    subcategory: 'Stair Risers',
    thickness: thickness || '4.0 mm / 5.5 mm',
    size: 'Largo 48" (Matching step)',
    color,
    userEnteredQuantity: stepCount,
    quantityUnitLabel: 'contrahuellas',
    calculatedUnits: stepCount,
    calculatedUnitsLabel: label,
    unitPrice: Number(riserUnitPrice.toFixed(2)),
    pricingMode: 'per_piece',
    baseListPrice: Number(riserUnitPrice.toFixed(2)),
    subtotal,
    isTaxable: true,
    isLabor: false,
    notes: notes ? `Riser: ${notes}` : undefined
  };
}

/**
 * Calculation of sqft per plank and value per plank
 * Formula:
 *   pies_cuadrados_por_lámina = pies_cuadrados_caja / láminas_por_caja
 *   valor_lámina = pies_cuadrados_por_lámina * precio_pie_cuadrado
 *
 * Real Examples:
 * - Spirit: 19.29 sqft/caja, 5 láminas/caja, $2.09/sqft -> 3.858 sqft/lámina, $8.06322 (≈ $8.06)
 * - CUI Select: 24.26 sqft/caja, 10 láminas/caja, $1.49/sqft -> 2.426 sqft/lámina, $3.61474 (≈ $3.61)
 */
export function calculatePlankValues(
  sqftPerBox: number,
  planksPerBox: number,
  pricePerSqft: number
): {
  sqftPerPlank: number;
  plankPrice: number;
} {
  if (!sqftPerBox || sqftPerBox <= 0 || !planksPerBox || planksPerBox <= 0) {
    return { sqftPerPlank: 0, plankPrice: 0 };
  }
  const sqftPerPlank = sqftPerBox / planksPerBox;
  const plankPrice = sqftPerPlank * pricePerSqft;

  return {
    sqftPerPlank: Number(sqftPerPlank.toFixed(4)),
    plankPrice: Number(plankPrice.toFixed(4))
  };
}

export interface StairCalculationParams {
  mode: 'solo_steps' | 'completa';
  stepCount: number;
  stepUnitPrice: number;
  riserType: 'white' | 'color_piso';
  riserUnitPrice: number; // for white risers
  landingCount: number;
  sqftPerBox: number;
  planksPerBox: number;
  pricePerSqft: number;
}

export interface StairBreakdownResult {
  sqftPerPlank: number;
  plankPrice: number;
  boxUnitPrice: number;
  // Steps / Huellas
  stepsCount: number;
  stepsUnitPrice: number;
  stepsSubtotal: number;
  // Contrahuellas
  risersCount: number;
  risersSqft: number;
  risersUnitPrice: number;
  risersSubtotal: number;
  // Material complementario (faltantes de huellas)
  complementaryPlanksCount: number;
  complementaryPlanksSqft: number;
  complementaryPlankUnitPrice: number;
  complementarySubtotal: number;
  // Descansos
  landingsCount: number;
  landingsBoxes: number;
  landingsSqft: number;
  landingsSubtotal: number;
  // Totals
  totalFlooringSqft: number;
  totalFlooringBoxesEquivalent: number;
  totalFlooringSubtotal: number;
  totalStairsPrice: number;
}

export function calculateStairsBreakdown(params: StairCalculationParams): StairBreakdownResult {
  const {
    mode,
    stepCount,
    stepUnitPrice,
    riserType,
    riserUnitPrice,
    landingCount,
    sqftPerBox,
    planksPerBox,
    pricePerSqft
  } = params;

  const validStepCount = Math.max(0, stepCount || 0);
  const validStepUnitPrice = Math.max(0, stepUnitPrice || 0);
  const stepsSubtotal = Number((validStepCount * validStepUnitPrice).toFixed(2));

  if (mode === 'solo_steps') {
    return {
      sqftPerPlank: 0,
      plankPrice: 0,
      boxUnitPrice: 0,
      stepsCount: validStepCount,
      stepsUnitPrice: validStepUnitPrice,
      stepsSubtotal,
      risersCount: 0,
      risersSqft: 0,
      risersUnitPrice: 0,
      risersSubtotal: 0,
      complementaryPlanksCount: 0,
      complementaryPlanksSqft: 0,
      complementaryPlankUnitPrice: 0,
      complementarySubtotal: 0,
      landingsCount: 0,
      landingsBoxes: 0,
      landingsSqft: 0,
      landingsSubtotal: 0,
      totalFlooringSqft: 0,
      totalFlooringBoxesEquivalent: 0,
      totalFlooringSubtotal: 0,
      totalStairsPrice: stepsSubtotal
    };
  }

  const { sqftPerPlank, plankPrice } = calculatePlankValues(sqftPerBox, planksPerBox, pricePerSqft);
  const boxUnitPrice = Number((sqftPerBox * pricePerSqft).toFixed(2));

  // Contrahuellas
  let risersCount = 0;
  let risersSqft = 0;
  let risersUnitPriceCalculated = 0;
  let risersSubtotal = 0;

  if (riserType === 'white') {
    risersCount = validStepCount;
    risersSqft = 0; // Contrahuellas blancas son piezas independientes
    risersUnitPriceCalculated = Math.max(0, riserUnitPrice || 0);
    risersSubtotal = Number((validStepCount * risersUnitPriceCalculated).toFixed(2));
  } else {
    // Contrahuella color piso: 1 lámina por escalón
    risersCount = validStepCount;
    risersSqft = Number((validStepCount * sqftPerPlank).toFixed(2));
    risersUnitPriceCalculated = plankPrice;
    risersSubtotal = Number((validStepCount * plankPrice).toFixed(2));
  }

  // Material complementario (faltantes de huellas): 1 lámina por escalón
  const complementaryPlanksCount = validStepCount;
  const complementaryPlanksSqft = Number((validStepCount * sqftPerPlank).toFixed(2));
  const complementaryPlankUnitPrice = plankPrice;
  const complementarySubtotal = Number((validStepCount * plankPrice).toFixed(2));

  // Descansos: 1 caja por cada descanso
  const landingsCount = Math.max(0, landingCount || 0);
  const landingsBoxes = landingsCount;
  const landingsSqft = Number((landingsBoxes * sqftPerBox).toFixed(2));
  const landingsSubtotal = Number((landingsBoxes * boxUnitPrice).toFixed(2));

  // Totales de piso
  const totalFlooringSqft = Number((risersSqft + complementaryPlanksSqft + landingsSqft).toFixed(2));
  const totalFlooringBoxesEquivalent = sqftPerBox > 0 ? Number((totalFlooringSqft / sqftPerBox).toFixed(2)) : 0;
  const totalFlooringSubtotal = Number(
    ((riserType === 'color_piso' ? risersSubtotal : 0) + complementarySubtotal + landingsSubtotal).toFixed(2)
  );
  const totalStairsPrice = Number(
    (stepsSubtotal + risersSubtotal + complementarySubtotal + landingsSubtotal).toFixed(2)
  );

  return {
    sqftPerPlank,
    plankPrice,
    boxUnitPrice,
    stepsCount: validStepCount,
    stepsUnitPrice: validStepUnitPrice,
    stepsSubtotal,
    risersCount,
    risersSqft,
    risersUnitPrice: risersUnitPriceCalculated,
    risersSubtotal,
    complementaryPlanksCount,
    complementaryPlanksSqft,
    complementaryPlankUnitPrice,
    complementarySubtotal,
    landingsCount,
    landingsBoxes,
    landingsSqft,
    landingsSubtotal,
    totalFlooringSqft,
    totalFlooringBoxesEquivalent,
    totalFlooringSubtotal,
    totalStairsPrice
  };
}

export function createStairComplementaryCartItem(
  productName: string,
  planksCount: number,
  plankUnitPrice: number,
  totalSqft: number,
  color?: ProductColor,
  notes?: string
): CartItem {
  const subtotal = Number((planksCount * plankUnitPrice).toFixed(2));

  return {
    id: `item-${Date.now()}-compl-${Math.random().toString(36).substring(2, 7)}`,
    productId: 'stairs-complementary-planks',
    productName: `Material Complementario Huellas (${productName})`,
    category: 'escalones',
    subcategory: 'Tablas Complementarias',
    thickness: 'SPC Plank',
    size: 'Plank Size',
    color,
    userEnteredQuantity: planksCount,
    quantityUnitLabel: 'láminas',
    calculatedUnits: planksCount,
    calculatedUnitsLabel: `${planksCount} láminas (${totalSqft} sqft)`,
    unitPrice: Number(plankUnitPrice.toFixed(2)),
    pricingMode: 'per_piece',
    baseListPrice: Number(plankUnitPrice.toFixed(2)),
    subtotal,
    isTaxable: true,
    isLabor: false,
    notes: notes || '1 lámina por escalón para completar profundidad de huella'
  };
}

export function createStairLandingCartItem(
  productName: string,
  landingsCount: number,
  boxUnitPrice: number,
  sqftPerBox: number,
  color?: ProductColor,
  notes?: string
): CartItem {
  const subtotal = Number((landingsCount * boxUnitPrice).toFixed(2));
  const totalSqft = Number((landingsCount * sqftPerBox).toFixed(2));

  return {
    id: `item-${Date.now()}-land-${Math.random().toString(36).substring(2, 7)}`,
    productId: 'stairs-landing-box',
    productName: `Descanso de Escalera - Piso SPC (${productName})`,
    category: 'escalones',
    subcategory: 'Descanso / Landing',
    thickness: 'SPC Flooring',
    size: `${sqftPerBox} sqft/caja`,
    color,
    userEnteredQuantity: landingsCount,
    quantityUnitLabel: 'descansos',
    calculatedUnits: landingsCount,
    calculatedUnitsLabel: `${landingsCount} caja${landingsCount > 1 ? 's' : ''} (${totalSqft} sqft)`,
    unitPrice: Number(boxUnitPrice.toFixed(2)),
    pricingMode: 'per_box',
    baseListPrice: Number(boxUnitPrice.toFixed(2)),
    subtotal,
    isTaxable: true,
    isLabor: false,
    notes: notes || `${landingsCount} caja${landingsCount > 1 ? 's' : ''} para descanso(s)`
  };
}

export function createWallPanelCartItem(
  product: Product,
  pieceCount: number,
  unitPrice: number,
  color?: ProductColor,
  notes?: string
): CartItem {
  const subtotal = Number((pieceCount * unitPrice).toFixed(2));

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: product.id,
    productName: product.name,
    category: 'wall_panels',
    subcategory: product.subcategory,
    thickness: product.thickness,
    size: product.size,
    color,
    userEnteredQuantity: pieceCount,
    quantityUnitLabel: 'piezas / paneles',
    calculatedUnits: pieceCount,
    calculatedUnitsLabel: `${pieceCount} panel${pieceCount > 1 ? 'es' : ''}`,
    unitPrice: unitPrice,
    pricingMode: 'per_piece',
    baseListPrice: product.basePrice,
    subtotal,
    isTaxable: true,
    isLabor: false,
    notes
  };
}

export function createUnderlaymentCartItem(
  product: Product,
  rollCount: number,
  unitPrice: number,
  notes?: string
): CartItem {
  const subtotal = Number((rollCount * unitPrice).toFixed(2));

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: product.id,
    productName: product.name,
    category: 'underlayment',
    subcategory: product.subcategory,
    thickness: product.thickness,
    size: product.size,
    userEnteredQuantity: rollCount,
    quantityUnitLabel: 'rollos',
    calculatedUnits: rollCount,
    calculatedUnitsLabel: `${rollCount} rollo${rollCount > 1 ? 's' : ''}`,
    unitPrice: unitPrice,
    pricingMode: 'per_piece',
    baseListPrice: product.basePrice,
    subtotal,
    isTaxable: true,
    isLabor: false,
    notes
  };
}

export function createCustomCartItem(
  description: string,
  quantity: number,
  unitPrice: number,
  category: 'otros' = 'otros',
  isTaxable: boolean = true,
  isLabor: boolean = false,
  unitLabel: string = 'unidad',
  notes?: string
): CartItem {
  const subtotal = Number((quantity * unitPrice).toFixed(2));

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: 'custom-item',
    productName: description,
    category,
    userEnteredQuantity: quantity,
    quantityUnitLabel: unitLabel,
    calculatedUnits: quantity,
    calculatedUnitsLabel: `${quantity} ${unitLabel}${quantity > 1 ? 'es/s' : ''}`,
    unitPrice: unitPrice,
    pricingMode: 'fixed',
    baseListPrice: unitPrice,
    subtotal,
    isTaxable,
    isLabor,
    notes
  };
}

export function calculateQuoteTotals(
  items: CartItem[],
  includeDelivery: boolean,
  deliveryFee: number = 60.00,
  taxRate: number = 0.07,
  payWithCard: boolean = false,
  cardFeeRate: number = 0.03
): {
  subtotalProducts: number;
  deliveryTotal: number;
  taxableBase: number;
  taxAmount: number;
  installationTotal: number;
  baseTotal: number;
  cardFeeAmount: number;
  total: number;
} {
  let subtotalProducts = 0;
  let installationTotal = 0;

  for (const item of items) {
    if (item.isLabor || !item.isTaxable) {
      installationTotal += item.subtotal;
    } else {
      subtotalProducts += item.subtotal;
    }
  }

  subtotalProducts = Number(subtotalProducts.toFixed(2));
  installationTotal = Number(installationTotal.toFixed(2));
  const deliveryTotal = includeDelivery ? deliveryFee : 0;

  // Business rule: Tax (7%) applies ONLY to tangible products (never on installation or delivery)
  const taxableBase = subtotalProducts;
  const taxAmount = Number((taxableBase * taxRate).toFixed(2));

  // Base Total before card fee = Products + Delivery + Tax + Installation
  const baseTotal = Number((subtotalProducts + deliveryTotal + taxAmount + installationTotal).toFixed(2));

  // 3% debit/credit card convenience fee if customer chooses card payment
  const cardFeeAmount = payWithCard ? Number((baseTotal * cardFeeRate).toFixed(2)) : 0;

  // Final Total
  const total = Number((baseTotal + cardFeeAmount).toFixed(2));

  return {
    subtotalProducts,
    deliveryTotal,
    taxableBase,
    taxAmount,
    installationTotal,
    baseTotal,
    cardFeeAmount,
    total
  };
}

export interface ItemPriceBreakdown {
  primaryRate: string;         // e.g. "$2.50 / sqft" or "$1.50 / LF" or "$45.00 / escalón"
  packagingRate?: string;      // e.g. "$60.65 / caja" or "$24.00 / tira"
  displayUnit: string;         // e.g. "sqft", "LF", "escalones", "piezas"
  unitPriceValue: number;      // raw rate
}

export function getItemUnitPriceDetail(item: CartItem, lang: 'en' | 'es' = 'es'): ItemPriceBreakdown {
  const isEn = lang === 'en';

  if (item.category === 'piso') {
    const sqftRate = item.pricePerSqft || (item.baseListPrice > 0 ? item.baseListPrice : 2.50);
    const boxRate = item.unitPrice;
    return {
      primaryRate: `${formatCurrency(sqftRate)} / sqft`,
      packagingRate: `${formatCurrency(boxRate)} / ${isEn ? 'box' : 'caja'}`,
      displayUnit: 'sqft',
      unitPriceValue: sqftRate
    };
  }

  if (item.category === 'rodapie') {
    const lfRate = item.pricePerLinearFt || (item.baseListPrice > 0 ? item.baseListPrice : 1.50);
    const stripRate = item.unitPrice;
    return {
      primaryRate: `${formatCurrency(lfRate)} / LF`,
      packagingRate: `${formatCurrency(stripRate)} / ${isEn ? 'strip' : 'tira'}`,
      displayUnit: 'LF',
      unitPriceValue: lfRate
    };
  }

  if (item.category === 'escalones') {
    const isRiser = item.subcategory === 'Stair Risers' || 
                    item.productId === 'steps-riser-plank' || 
                    item.productName.toLowerCase().includes('contrahuella') ||
                    item.productName.toLowerCase().includes('riser');

    if (isRiser) {
      return {
        primaryRate: `${formatCurrency(item.unitPrice)} / ${isEn ? 'riser' : 'contrahuella'}`,
        packagingRate: isEn ? 'Vertical Riser Plank' : 'Contrahuella Vertical 48"',
        displayUnit: isEn ? 'riser' : 'contrahuella',
        unitPriceValue: item.unitPrice
      };
    }

    if (item.stepIncludesRiser && item.riserUnitPrice) {
      const stepRate = Number((item.unitPrice - item.riserUnitPrice).toFixed(2));
      const effectiveStepRate = stepRate > 0 ? stepRate : item.unitPrice;
      return {
        primaryRate: `${formatCurrency(effectiveStepRate)} / ${isEn ? 'step' : 'escalón'}`,
        packagingRate: `+ ${formatCurrency(item.riserUnitPrice)} / ${isEn ? 'riser' : 'contrahuella'}`,
        displayUnit: isEn ? 'step' : 'escalón',
        unitPriceValue: effectiveStepRate
      };
    }

    return {
      primaryRate: `${formatCurrency(item.unitPrice)} / ${isEn ? 'step' : 'escalón'}`,
      packagingRate: isEn ? 'Tread 12" x 48"' : 'Huella 12" x 48"',
      displayUnit: isEn ? 'step' : 'escalón',
      unitPriceValue: item.unitPrice
    };
  }

  if (item.category === 'perfiles') {
    return {
      primaryRate: `${formatCurrency(item.unitPrice)} / ${isEn ? 'piece' : 'pieza'}`,
      packagingRate: item.size ? `${isEn ? 'Length' : 'Largo'}: ${item.size}` : undefined,
      displayUnit: isEn ? 'piece' : 'pieza',
      unitPriceValue: item.unitPrice
    };
  }

  if (item.category === 'wall_panels') {
    return {
      primaryRate: `${formatCurrency(item.unitPrice)} / panel`,
      displayUnit: 'panel',
      unitPriceValue: item.unitPrice
    };
  }

  if (item.category === 'underlayment') {
    return {
      primaryRate: `${formatCurrency(item.unitPrice)} / ${isEn ? 'roll' : 'rollo'}`,
      displayUnit: isEn ? 'roll' : 'rollo',
      unitPriceValue: item.unitPrice
    };
  }

  // Custom / Other
  const unit = item.quantityUnitLabel || (isEn ? 'unit' : 'unidad');
  return {
    primaryRate: `${formatCurrency(item.unitPrice)} / ${unit}`,
    displayUnit: unit,
    unitPriceValue: item.unitPrice
  };
}

export function formatCurrency(amount: number | undefined | null): string {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(validAmount);
}

export function getValidUntilDate(days: number = 3, lang: 'en' | 'es' = 'en'): string {
  const target = new Date();
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}


