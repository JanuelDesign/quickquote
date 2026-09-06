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
  const stepsTotal = stepCount * stepUnitPrice;
  const risersTotal = includeRiser ? stepCount * riserUnitPrice : 0;
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
    calculatedUnitsLabel: includeRiser 
      ? `${stepCount} peldaños + ${stepCount} contrahuellas` 
      : `${stepCount} peldaños`,
    unitPrice: includeRiser ? stepUnitPrice + riserUnitPrice : stepUnitPrice,
    pricingMode: 'per_piece',
    baseListPrice: product.basePrice,
    subtotal,
    isTaxable: true,
    isLabor: false,
    stepIncludesRiser: includeRiser,
    riserCount: includeRiser ? stepCount : 0,
    riserUnitPrice: includeRiser ? riserUnitPrice : 0,
    notes
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
  taxRate: number = 0.07
): {
  subtotalProducts: number;
  deliveryTotal: number;
  taxableBase: number;
  taxAmount: number;
  installationTotal: number;
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

  // Formula: Total = Subtotal Products + Delivery ($60 if enabled, tax-free) + Tax (7% only on products) + Installation (tax-free)
  const total = Number((subtotalProducts + deliveryTotal + taxAmount + installationTotal).toFixed(2));

  return {
    subtotalProducts,
    deliveryTotal,
    taxableBase,
    taxAmount,
    installationTotal,
    total
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


