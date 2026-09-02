export type ProductCategory = 'piso' | 'rodapie' | 'perfiles' | 'escalones' | 'otros';

export interface ProductColor {
  code: string;
  name: string;
  hex: string;
  plankPhotoUrl?: string;
  roomPhotoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory?: string;
  thickness?: string;
  wearLayer?: string;
  size?: string;
  sqftPerBox?: number;
  planksPerBox?: number;
  basePrice: number; // Base price (per sqft for floors, per strip or per LF for baseboards, per piece for others)
  priceUnit: 'sqft' | 'box' | 'piece' | 'strip' | 'linear_ft' | 'unit';
  stripLengthFeet?: number; // E.g. 16 ft for baseboard, 8 ft for quarter round
  colors?: ProductColor[];
  description?: string;
  isCustom?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  subcategory?: string;
  thickness?: string;
  size?: string;
  color?: ProductColor;
  
  // Quantities
  userEnteredQuantity: number; // e.g. 350 sqft, 134 LF, 15 steps
  quantityUnitLabel: string;   // "sqft", "pies lineales", "piezas", "escalones"
  calculatedUnits: number;     // e.g. 15 boxes, 9 strips of 16ft, 15 steps
  calculatedUnitsLabel: string;// "15 cajas (363.9 sqft)" or "9 tiras de 16 ft (144 LF)"
  
  // Pricing
  unitPrice: number;           // Editable price per unit (per box, per strip, per step, etc.)
  pricingMode: 'per_box' | 'per_sqft' | 'per_strip' | 'per_piece' | 'fixed';
  pricePerSqft?: number;       // For floors
  pricePerLinearFt?: number;   // For baseboards
  baseListPrice: number;       // Original base price for reference
  
  // Subtotal & Tax
  subtotal: number;
  isTaxable: boolean;          // true for materials/products, false for installation/labor
  isLabor?: boolean;
  
  // Extras
  stepIncludesRiser?: boolean; // For stairs: includes +$9 riser
  riserCount?: number;
  riserUnitPrice?: number;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

export type Language = 'en' | 'es';

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface Quotation {
  id: string;
  quoteNumber: string;
  date: string;
  validDays: number;
  validUntil: string;
  client: Client;
  salespersonName?: string;
  salespersonPhone?: string;
  items: CartItem[];
  includeDelivery: boolean;
  deliveryCost: number; // $60
  language?: Language;
  
  // Totals
  subtotalProducts: number;    // Taxable items subtotal
  taxRate: number;             // 0.07 (7%)
  taxableBase?: number;        // subtotalProducts + deliveryCost
  taxAmount: number;           // (subtotalProducts + deliveryCost) * 0.07
  installationTotal: number;   // Non-taxable services
  deliveryTotal: number;       // $60 (taxable with products)
  total: number;               // subtotalProducts + deliveryTotal + taxAmount + installationTotal
  
  status: QuoteStatus;
  notes?: string;
  createdAt: string;
}


export interface AppSettings {
  salespersonName: string;
  salespersonPhone: string;
  defaultValidDays: number;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogoUrl: string;
  taxRate: number; // 0.07
  deliveryFee: number; // 60.00
}
