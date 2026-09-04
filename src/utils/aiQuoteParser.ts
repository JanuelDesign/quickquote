import { Product, CartItem, ProductColor } from '../types';
import { 
  createFloorCartItem, 
  createBaseboardCartItem, 
  createProfileCartItem, 
  createStairsCartItem, 
  createCustomCartItem 
} from './calculations';

export interface ParsedQuoteResponse {
  items: Array<{
    category: 'piso' | 'rodapie' | 'perfiles' | 'escalones' | 'otros' | 'flooring' | 'baseboard' | 'stairs' | 'profiles' | 'custom';
    modelHint?: string;
    colorHint?: string;
    quantity: number;
    unit?: string;
    description?: string;
  }>;
  installationRequested?: boolean;
  clientNotes?: string;
}

/**
 * Robust local parser used as instant fallback or offline mode
 */
export function parseClientTextLocally(text: string): ParsedQuoteResponse {
  const lower = text.toLowerCase();
  const items: ParsedQuoteResponse['items'] = [];
  const installationRequested = /instalaci[oó]n|instalar|mano de obra|labor|install/i.test(lower);

  // 1. Detect Flooring
  // Matches "300 pies", "300 sqft", "300 ft2", "piso 5.5mm 300 pies", "300 sq ft de piso"
  const floorMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft|pies|pies\s*cuadrados|ft2|m2)?\s*(?:de\s+)?(?:piso|floor|spc|laminado|vinil)?/i);
  const floorKeywords = /(?:piso|floor|spc|laminado|vinil|5\.5|6\.5|5\.7)/i;
  
  if (floorKeywords.test(lower)) {
    // Look specifically for numbers near floor mentions
    const specificFloorRegex = /(?:piso|floor|spc)[^\d]*(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft|pies|ft2)?|(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft|pies|ft2)?\s*(?:de\s+)?(?:piso|floor|spc)/i;
    const m = lower.match(specificFloorRegex);
    const sqft = m ? parseFloat(m[1] || m[2]) : (floorMatch ? parseFloat(floorMatch[1]) : 300);

    const modelHint = /5\.7|shield|6\.5/i.test(lower) ? '5.7mm' : '5.5mm';
    
    // Check color hint
    let colorHint = '';
    const colors = ['moody gray', 'fearless', 'trustable', 'grateful', 'vital oak', 'polar pearl', 'serenity', 'classic walnut', 'oregon', 'harmony'];
    for (const c of colors) {
      if (lower.includes(c)) {
        colorHint = c;
        break;
      }
    }

    if (sqft > 0) {
      items.push({
        category: 'piso',
        modelHint,
        colorHint,
        quantity: sqft,
        unit: 'sqft',
        description: `Piso SPC ${modelHint}`
      });
    }
  }

  // 2. Detect Baseboard
  // Matches "rodapie 134 pies", "134 pies de rodapie", "134 lf baseboard", "rodapié 134 ft"
  const baseboardRegex = /(?:rodapi[eé]|baseboard|zocalo)[^\d]*(\d+(?:\.\d+)?)\s*(?:pies|lf|ft|pies\s*lineales)?|(\d+(?:\.\d+)?)\s*(?:pies|lf|ft|pies\s*lineales)\s*(?:de\s+)?(?:rodapi[eé]|baseboard|zocalo)/i;
  const bbMatch = lower.match(baseboardRegex);
  if (bbMatch) {
    const ft = parseFloat(bbMatch[1] || bbMatch[2]);
    if (ft > 0) {
      items.push({
        category: 'rodapie',
        modelHint: 'BB1x6',
        quantity: ft,
        unit: 'linear_ft',
        description: 'Rodapié Baseboard BB1x6'
      });
    }
  }

  // 3. Detect Stairs
  // Matches "2 escalones", "15 peldaños", "2 steps", "escaleras 2"
  const stairsRegex = /(\d+)\s*(?:escalones|pelda[ñn]os|steps|gradas)|(?:escaleras?|escalones?)[^\d]*(\d+)/i;
  const stMatch = lower.match(stairsRegex);
  if (stMatch) {
    const steps = parseInt(stMatch[1] || stMatch[2], 10);
    if (steps > 0) {
      items.push({
        category: 'escalones',
        modelHint: 'Stair Nose',
        quantity: steps,
        unit: 'piece',
        description: 'Paquete de escalones / Stair Nose'
      });
    }
  }

  // 4. Detect Profiles / Transitions
  const profilesRegex = /(\d+)\s*(?:perfiles?|transiciones?|t-molding|t-profile|reducers?)/i;
  const prMatch = lower.match(profilesRegex);
  if (prMatch) {
    const qty = parseInt(prMatch[1], 10);
    if (qty > 0) {
      items.push({
        category: 'perfiles',
        modelHint: 'T-Profile',
        quantity: qty,
        unit: 'piece',
        description: 'Perfil de transición'
      });
    }
  }

  return {
    items,
    installationRequested,
    clientNotes: `Solicitud interpretada: "${text.trim()}"`
  };
}

/**
 * Sends customer prompt to Gemini AI on the backend server, with automatic graceful local fallback
 */
export async function interpretCustomerRequest(prompt: string): Promise<ParsedQuoteResponse> {
  try {
    const res = await fetch('/api/parse-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        return data as ParsedQuoteResponse;
      }
    }
  } catch (err) {
    console.warn('Backend Gemini parse quote unavailable, using smart local parser:', err);
  }

  // Fallback to client-side rule-based extractor
  return parseClientTextLocally(prompt);
}

/**
 * Maps the AI / parsed structured response into real, calculated CartItems using Quicksurfaces catalog
 */
export function mapParsedItemsToCart(
  parsed: ParsedQuoteResponse,
  catalog: Product[]
): { items: CartItem[]; summaryNotes: string } {
  const resultCart: CartItem[] = [];

  const floorProducts = catalog.filter(p => p.category === 'piso');
  const baseboardProducts = catalog.filter(p => p.category === 'rodapie');
  const profileProducts = catalog.filter(p => p.category === 'perfiles');
  const stairsProducts = catalog.filter(p => p.category === 'escalones');

  for (const item of parsed.items) {
    const cat = item.category.toLowerCase();

    // 1. Flooring
    if (cat === 'piso' || cat === 'flooring') {
      let selectedProduct = floorProducts[0];
      if (item.modelHint) {
        const hint = item.modelHint.toLowerCase();
        const matched = floorProducts.find(p => 
          p.name.toLowerCase().includes(hint) || 
          (p.thickness && p.thickness.toLowerCase().includes(hint))
        );
        if (matched) selectedProduct = matched;
      }

      let selectedColor: ProductColor | undefined = undefined;
      if (selectedProduct && selectedProduct.colors && selectedProduct.colors.length > 0) {
        if (item.colorHint) {
          const cHint = item.colorHint.toLowerCase();
          selectedColor = selectedProduct.colors.find(c => 
            c.name.toLowerCase().includes(cHint) || c.code.toLowerCase().includes(cHint)
          );
        }
        if (!selectedColor) {
          selectedColor = selectedProduct.colors[0];
        }
      }

      if (selectedProduct) {
        const cartItem = createFloorCartItem(
          selectedProduct,
          item.quantity,
          selectedProduct.basePrice,
          selectedColor,
          'Interpretado de solicitud del cliente'
        );
        resultCart.push(cartItem);
      }
    } 
    // 2. Baseboard
    else if (cat === 'rodapie' || cat === 'baseboard') {
      const selectedProduct = baseboardProducts[0] || {
        id: 'bb1x6-default',
        name: 'Baseboard BB1x6',
        category: 'rodapie',
        basePrice: 1.19,
        stripLengthFeet: 16,
        priceUnit: 'linear_ft'
      } as Product;

      const cartItem = createBaseboardCartItem(
        selectedProduct,
        item.quantity,
        selectedProduct.basePrice,
        undefined,
        'Interpretado de solicitud del cliente'
      );
      resultCart.push(cartItem);
    } 
    // 3. Stairs
    else if (cat === 'escalones' || cat === 'stairs') {
      const selectedProduct = stairsProducts[0] || {
        id: 'stairnose-default',
        name: 'Stair Nose Package',
        category: 'escalones',
        basePrice: 22.00,
        priceUnit: 'piece'
      } as Product;

      const cartItem = createStairsCartItem(
        selectedProduct,
        item.quantity,
        selectedProduct.basePrice,
        false,
        9.00,
        undefined,
        'Interpretado de solicitud del cliente'
      );
      resultCart.push(cartItem);
    } 
    // 4. Profiles
    else if (cat === 'perfiles' || cat === 'profiles') {
      const selectedProduct = profileProducts[0] || {
        id: 't-profile-default',
        name: 'T-Profile Transition',
        category: 'perfiles',
        basePrice: 14.50,
        priceUnit: 'piece'
      } as Product;

      const cartItem = createProfileCartItem(
        selectedProduct,
        item.quantity,
        selectedProduct.basePrice,
        undefined,
        'Interpretado de solicitud del cliente'
      );
      resultCart.push(cartItem);
    } 
    // 5. Custom / Other unmapped items
    else {
      const customItem = createCustomCartItem(
        item.description || item.modelHint || 'Producto personalizado / solicitud',
        item.quantity || 1,
        0, // Set price to 0 so the salesperson can review and price it
        'otros',
        true,
        false,
        item.unit || 'unidad',
        'Revisar precio unitario sugerido'
      );
      resultCart.push(customItem);
    }
  }

  // 6. If installation was requested, add Labor item (non-taxable)
  if (parsed.installationRequested) {
    const laborItem = createCustomCartItem(
      'Servicio de Instalación y Mano de Obra (Sujeto a inspección)',
      1,
      0, // Price to be agreed by sales rep
      'otros',
      false, // Labor is tax-exempt in Quicksurfaces rules
      true,
      'servicio',
      'Mano de obra solicitada por el cliente'
    );
    resultCart.push(laborItem);
  }

  return {
    items: resultCart,
    summaryNotes: parsed.clientNotes || ''
  };
}
