import { Product, ProductCategory, Language } from '../types';

/**
 * Normalizes a string by converting to lowercase and stripping accents/diacritics
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Category labels and common industry search synonyms in Spanish and English
 */
export const CATEGORY_SEARCH_SYNONYMS: Record<ProductCategory, { es: string; en: string; terms: string[] }> = {
  piso: {
    es: 'Piso',
    en: 'Flooring',
    terms: ['piso', 'pisos', 'floor', 'flooring', 'spc', 'laminado', 'laminate', 'vinyl', 'vinilico', 'plank', 'tabla']
  },
  rodapie: {
    es: 'Rodapié',
    en: 'Baseboard',
    terms: ['rodapie', 'rodapie', 'baseboard', 'skirting', 'zocalo', 'moulding', 'moldura', 'tira', 'tiras', '16ft', '16 ft', 'white']
  },
  perfiles: {
    es: 'Perfiles',
    en: 'Profiles & Trims',
    terms: ['perfil', 'perfiles', 'profile', 'trim', 'trims', 'transicion', 'transición', 't-molding', 'reducer', 'end cap', 'flush', 'overlap', 'quarter round', 'remate']
  },
  escalones: {
    es: 'Escalones',
    en: 'Stair Treads',
    terms: ['escalon', 'escalón', 'escalones', 'stair', 'stairs', 'tread', 'treads', 'peldaño', 'peldano', 'riser', 'contrahuella', 'peldaños', 'step', 'steps']
  },
  wall_panels: {
    es: 'Wall Panels',
    en: 'Wall Panels',
    terms: ['wall', 'panel', 'panels', 'paneles', 'pared', 'acustico', 'acústico', 'fluted', 'slat', 'revestimiento', 'madera', 'listonado']
  },
  underlayment: {
    es: 'Underlayment',
    en: 'Underlayment',
    terms: ['underlayment', 'aislante', 'vapor', 'bajo alfombra', 'foam', 'espuma', 'ixpe', 'eva', 'rollo', 'rollos', 'acustico', 'soundproof', 'humedad']
  },
  otros: {
    es: 'Otros',
    en: 'Other',
    terms: ['otros', 'other', 'custom', 'personalizado', 'servicio', 'adhesivo', 'pegamento', 'mano de obra', 'labor']
  }
};

/**
 * Checks if a single product matches the search query across:
 * - Name
 * - Model / Subcategory
 * - Category and synonyms
 * - Specs (thickness, size, wear layer, badge)
 * - Color variant names and codes
 */
export function matchesProductSearch(product: Product, rawQuery: string): boolean {
  const query = normalizeSearchText(rawQuery);
  if (!query) return true;

  // 1. Direct Name check
  if (normalizeSearchText(product.name).includes(query)) return true;

  // 2. Subcategory / Model check
  if (product.subcategory && normalizeSearchText(product.subcategory).includes(query)) return true;
  if (product.model && normalizeSearchText(product.model).includes(query)) return true;

  // 3. Category & Synonym check
  const catSynonyms = CATEGORY_SEARCH_SYNONYMS[product.category];
  if (catSynonyms) {
    if (normalizeSearchText(catSynonyms.es).includes(query)) return true;
    if (normalizeSearchText(catSynonyms.en).includes(query)) return true;
    if (catSynonyms.terms.some(t => normalizeSearchText(t).includes(query) || query.includes(normalizeSearchText(t)))) {
      return true;
    }
  }

  // 4. Commercial badge and technical specs
  if (product.badge && normalizeSearchText(product.badge).includes(query)) return true;
  if (product.thickness && normalizeSearchText(product.thickness).includes(query)) return true;
  if (product.wearLayer && normalizeSearchText(product.wearLayer).includes(query)) return true;
  if (product.size && normalizeSearchText(product.size).includes(query)) return true;
  if (product.dimensions && normalizeSearchText(product.dimensions).includes(query)) return true;
  if (product.description && normalizeSearchText(product.description).includes(query)) return true;

  // 5. Color variants check (code e.g. "Q-01" or name e.g. "White Oak")
  if (product.colors && product.colors.length > 0) {
    const hasColorMatch = product.colors.some(c => 
      normalizeSearchText(c.name).includes(query) || 
      normalizeSearchText(c.code).includes(query)
    );
    if (hasColorMatch) return true;
  }

  return false;
}

/**
 * Computes how many items match the query in each category
 */
export function getCategoryMatchCounts(products: Product[], rawQuery: string): Record<ProductCategory, number> {
  const counts: Record<ProductCategory, number> = {
    piso: 0,
    rodapie: 0,
    perfiles: 0,
    escalones: 0,
    wall_panels: 0,
    underlayment: 0,
    otros: 0
  };

  if (!rawQuery.trim()) {
    products.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }

  products.forEach(p => {
    if (matchesProductSearch(p, rawQuery)) {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    }
  });

  return counts;
}

/**
 * Returns localized category label
 */
export function getCategoryDisplayName(category: ProductCategory, language: Language = 'es'): string {
  const cat = CATEGORY_SEARCH_SYNONYMS[category];
  if (!cat) return category;
  return language === 'en' ? cat.en : cat.es;
}
