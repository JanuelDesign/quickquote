import { Product, ProductColor } from '../types';

export const generateProductsTSV = (products: Product[]): string => {
  const t1Cols = [
    'id',
    'categoria',
    'nombre',
    'coleccion',
    'badge',
    'espesor',
    'medidas',
    'unidad_venta',
    'precio_base',
    'cobertura_caja',
    'tira_longitud_ft',
    'color_nombre',
    'color_codigo',
    'color_hex',
    'imagen_url',
    'notas'
  ];

  const rows = [t1Cols.join('\t')];

  for (const p of products) {
    const badge = p.id === 'spc-5.5mm-pulse-select' ? 'BEST SELLER' : p.id === 'spc-5.7mm-pulse-shield' ? 'PREMIUM' : (p.badge || '');
    const coleccion = p.name.includes('Collection') ? p.name.replace(' Collection', '') : (p.subcategory || '');
    const espesor = p.thickness || '';
    const medidas = p.size || '';
    const unidad_venta = p.priceUnit || '';
    const precio_base = p.basePrice !== undefined ? p.basePrice.toFixed(2) : '';
    const cobertura_caja = p.sqftPerBox !== undefined ? String(p.sqftPerBox) : '';
    const tira_longitud_ft = p.stripLengthFeet !== undefined ? String(p.stripLengthFeet) : '';
    const baseNotes = [
      p.wearLayer ? `Capa de uso: ${p.wearLayer}` : '',
      p.planksPerBox ? `${p.planksPerBox} tablas/caja` : '',
      p.description || ''
    ].filter(Boolean).join('. ').replace(/[\t\r\n]+/g, ' ');

    if (p.colors && p.colors.length > 0) {
      for (const c of p.colors) {
        rows.push([
          p.id,
          p.category,
          p.name,
          coleccion,
          badge,
          espesor,
          medidas,
          unidad_venta,
          precio_base,
          cobertura_caja,
          tira_longitud_ft,
          c.name || '',
          c.code || '',
          c.hex || '',
          c.plankPhotoUrl || c.roomPhotoUrl || '',
          baseNotes
        ].join('\t'));
      }
    } else {
      rows.push([
        p.id,
        p.category,
        p.name,
        coleccion,
        badge,
        espesor,
        medidas,
        unidad_venta,
        precio_base,
        cobertura_caja,
        tira_longitud_ft,
        '',
        '',
        '',
        '',
        baseNotes
      ].join('\t'));
    }
  }

  return rows.join('\n');
};

export const SERVICES_LABOR_DATA = [
  {
    id: 'labor-installation-spc',
    nombre: 'Installation Labor / SPC Flooring',
    descripcion: 'Professional SPC floor installation with cut, trim and layout adjustment',
    precio_base: '2.00',
    unidad: 'sqft',
    aplica_impuesto: 'NO',
    notas: 'Mano de obra exenta de tax según normativa Florida para servicios puros de instalación'
  },
  {
    id: 'labor-installation-baseboard',
    nombre: 'Baseboard Installation Labor',
    descripcion: 'Baseboard miter cuts, nailing and caulking',
    precio_base: '1.50',
    unidad: 'LF',
    aplica_impuesto: 'NO',
    notas: 'Cortes en inglete, fijación con clavos y sellado con masilla (exento de tax)'
  },
  {
    id: 'labor-installation-stairs',
    nombre: 'Stair Treads Installation Labor',
    descripcion: 'Installation labor for flush stair tread and riser',
    precio_base: '25.00',
    unidad: 'step',
    aplica_impuesto: 'NO',
    notas: 'Mano de obra por peldaño y contrahuella (exento de tax)'
  },
  {
    id: 'labor-removal-disposal',
    nombre: 'Old Carpet / Floor Removal & Disposal',
    descripcion: 'Demolition, rip-out and debris haul-away',
    precio_base: '1.00',
    unidad: 'sqft',
    aplica_impuesto: 'NO',
    notas: 'Demolición, levantamiento y retiro de alfombra o piso previo a vertedero (exento de tax)'
  },
  {
    id: 'labor-subfloor-leveling',
    nombre: 'Floor Subfloor Leveling Labor',
    descripcion: 'Slab prep and self-leveling compound application',
    precio_base: '1.25',
    unidad: 'sqft',
    aplica_impuesto: 'NO',
    notas: 'Preparación de superficie y aplicación de compuesto autonivelante (exento de tax)'
  },
  {
    id: 'supply-specialty-adhesive',
    nombre: 'Specialty High-Performance Adhesive',
    descripcion: 'Heavy-duty flooring adhesive bucket',
    precio_base: '45.00',
    unidad: 'bucket',
    aplica_impuesto: 'SÍ',
    notas: 'Material/adhesivo de alto rendimiento para pisos y escalones (sujeto a 7% FL Sales Tax)'
  },
  {
    id: 'service-flat-delivery',
    nombre: 'Delivery Service / Flete de Entrega',
    descripcion: 'Jobsite delivery in Miami-Dade and Broward areas',
    precio_base: '60.00',
    unidad: 'trip',
    aplica_impuesto: 'NO',
    notas: 'Tarifa estándar por viaje/despacho, configurable en ajustes (Settings) de la app'
  }
];

export const generateServicesTSV = (): string => {
  const t2Cols = ['id', 'nombre', 'descripcion', 'precio_base', 'unidad', 'aplica_impuesto', 'notas'];
  const rows = [t2Cols.join('\t')];

  for (const s of SERVICES_LABOR_DATA) {
    rows.push([
      s.id,
      s.nombre,
      s.descripcion,
      s.precio_base,
      s.unidad,
      s.aplica_impuesto,
      s.notas
    ].join('\t'));
  }

  return rows.join('\n');
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard failed, attempting fallback', err);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch (err) {
    console.error('Fallback execCommand failed', err);
    return false;
  }
};

/**
 * Splits a CSV or TSV line respecting double quotes
 */
function splitDelimitedLine(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
  }

  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses TSV or CSV from Google Sheets and updates/adds products
 */
export const parseProductsFromText = (
  rawText: string,
  currentProducts: Product[]
): { updatedProducts: Product[]; rowCount: number } => {
  const lines = rawText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('El contenido no tiene suficientes filas (se requiere encabezado y al menos 1 producto).');
  }

  // Detect delimiter: tab or comma
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';
  const rawHeaders = splitDelimitedLine(firstLine, delimiter);
  
  // Normalize string for fuzzy matching (removes accents, spaces, underscores, casing)
  const normalizeCol = (str: string) => 
    str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const normalizedHeaders = rawHeaders.map(h => normalizeCol(h));

  const getColIdx = (...candidates: string[]) => {
    for (const c of candidates) {
      const cleanCandidate = normalizeCol(c);
      // Exact match
      const exactIdx = normalizedHeaders.indexOf(cleanCandidate);
      if (exactIdx !== -1) return exactIdx;
      // Substring match
      const partialIdx = normalizedHeaders.findIndex(h => h.includes(cleanCandidate) || (cleanCandidate.length > 3 && cleanCandidate.includes(h)));
      if (partialIdx !== -1) return partialIdx;
    }
    return -1;
  };

  const idIdx = getColIdx('id', 'codigo', 'sku', 'ref');
  const catIdx = getColIdx('categoria', 'category', 'tipo', 'rubro');
  const subcatIdx = getColIdx('coleccion', 'collection', 'subcategoria', 'subcategory', 'linea');
  const nameIdx = getColIdx('nombre', 'name', 'producto', 'modelo', 'articulo', 'descripcion');
  const priceIdx = getColIdx('precio_base', 'precio', 'price', 'preciocliente', 'baseprice', 'precioventa', 'pvp', 'costo');
  const sqftIdx = getColIdx('cobertura_caja', 'sqft_box', 'sqftcaja', 'cobertura', 'sqftbox', 'sqft');
  const stripIdx = getColIdx('tira_longitud_ft', 'strip_length', 'largotira', 'longitud', 'tira');
  const unitIdx = getColIdx('unidad_venta', 'unidad', 'unit', 'priceunit');
  const badgeIdx = getColIdx('badge', 'etiqueta', 'destacado');
  const thickIdx = getColIdx('espesor', 'thickness', 'grosor');
  const sizeIdx = getColIdx('medidas', 'size', 'plank_size', 'formato', 'dimensiones');
  const colorNameIdx = getColIdx('color_nombre', 'colornombre', 'color', 'tono', 'acabado');
  const colorCodeIdx = getColIdx('color_codigo', 'colorcodigo', 'codigocolor', 'code');
  const colorHexIdx = getColIdx('color_hex', 'colorhex', 'hex');
  const imgIdx = getColIdx('imagen_url', 'image_url', 'foto', 'imagen', 'fotoplank');
  const notesIdx = getColIdx('notas', 'comentarios', 'observaciones');

  if (idIdx === -1 && nameIdx === -1) {
    const previewCols = rawHeaders.slice(0, 6).join(' | ');
    throw new Error(`No se encontró una columna de "Nombre" o "ID" en tu hoja. Columnas detectadas: [${previewCols}]. Asegúrate de tener al menos una columna con título "Nombre" o "Producto".`);
  }

  const existingMap = new Map<string, Product>();
  for (const p of currentProducts) {
    existingMap.set(p.id, { ...p, colors: p.colors ? [...p.colors] : [] });
  }

  const colorAccumulator = new Map<string, ProductColor[]>();
  let validRowsCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = splitDelimitedLine(lines[i], delimiter);
    const id = idIdx !== -1 ? cols[idIdx] : '';
    const name = nameIdx !== -1 ? cols[nameIdx] : '';
    if (!id && !name) continue;

    const priceStr = priceIdx !== -1 ? cols[priceIdx] : '';
    const cleanPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    const sqftStr = sqftIdx !== -1 ? cols[sqftIdx] : '';
    const sqft = sqftStr ? parseFloat(sqftStr) : undefined;
    const stripStr = stripIdx !== -1 ? cols[stripIdx] : '';
    const strip = stripStr ? parseFloat(stripStr) : undefined;
    const rawCategory = (catIdx !== -1 ? cols[catIdx] : 'piso').toLowerCase().trim();
    const lowerId = (id || '').toLowerCase();
    const lowerSubcat = (subcatIdx !== -1 ? cols[subcatIdx] || '' : '').toLowerCase();
    const lowerName = (name || '').toLowerCase();

    let resolvedCategory: any = 'piso';
    if (['piso', 'rodapie', 'perfiles', 'escalones', 'wall_panels', 'underlayment', 'otros'].includes(rawCategory)) {
      resolvedCategory = rawCategory;
    }
    
    // Automatic category inference if marked as 'otros' or ambiguous
    if (resolvedCategory === 'otros' || !resolvedCategory) {
      if (lowerId.includes('underlayment') || lowerSubcat.includes('underlayment') || lowerName.includes('vapor barrier') || lowerName.includes('manta') || lowerName.includes('padding')) {
        resolvedCategory = 'underlayment';
      } else if (lowerId.includes('wall-panel') || lowerSubcat.includes('wall panel') || lowerName.includes('wall panel') || lowerName.includes('revestimiento') || lowerName.includes('acoustic')) {
        resolvedCategory = 'wall_panels';
      } else if (lowerId.includes('rodapie') || lowerId.includes('baseboard') || lowerName.includes('baseboard') || lowerName.includes('rodapie')) {
        resolvedCategory = 'rodapie';
      } else if (lowerId.includes('perfil') || lowerName.includes('profile') || lowerName.includes('transicion') || lowerName.includes('t-profile') || lowerName.includes('reducer')) {
        resolvedCategory = 'perfiles';
      } else if (lowerId.includes('stair') || lowerId.includes('escalon') || lowerName.includes('escalera') || lowerName.includes('stair') || lowerName.includes('nose')) {
        resolvedCategory = 'escalones';
      }
    }

    let prod: Product | undefined;
    if (id && existingMap.has(id)) {
      prod = existingMap.get(id);
    } else if (name) {
      const cleanName = name.trim().toLowerCase();
      for (const existing of existingMap.values()) {
        if (
          existing.name.trim().toLowerCase() === cleanName ||
          existing.id.toLowerCase() === cleanName ||
          cleanName.includes(existing.name.trim().toLowerCase())
        ) {
          prod = existing;
          break;
        }
      }
    }

    const finalId = prod ? prod.id : (id || `imported-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

    if (!prod) {
      prod = {
        id: finalId,
        name: name || finalId,
        category: resolvedCategory,
        subcategory: subcatIdx !== -1 ? cols[subcatIdx] || undefined : undefined,
        basePrice: !isNaN(cleanPrice) && cleanPrice > 0 ? cleanPrice : 1.99,
        priceUnit: unitIdx !== -1 && cols[unitIdx] ? cols[unitIdx] as any : 'sqft',
        thickness: thickIdx !== -1 ? cols[thickIdx] || undefined : undefined,
        size: sizeIdx !== -1 ? cols[sizeIdx] || undefined : undefined,
        sqftPerBox: sqft,
        stripLengthFeet: strip,
        badge: badgeIdx !== -1 ? cols[badgeIdx] || undefined : undefined,
        description: notesIdx !== -1 ? cols[notesIdx] || undefined : undefined,
        colors: []
      };
      existingMap.set(finalId, prod);
    } else {
      if (!isNaN(cleanPrice) && cleanPrice > 0) prod.basePrice = cleanPrice;
      if (name) prod.name = name;
      if (resolvedCategory && resolvedCategory !== 'otros') prod.category = resolvedCategory;
      if (subcatIdx !== -1 && cols[subcatIdx]) prod.subcategory = cols[subcatIdx];
      if (sqft !== undefined && !isNaN(sqft)) prod.sqftPerBox = sqft;
      if (strip !== undefined && !isNaN(strip)) prod.stripLengthFeet = strip;
      if (thickIdx !== -1 && cols[thickIdx]) prod.thickness = cols[thickIdx];
      if (sizeIdx !== -1 && cols[sizeIdx]) prod.size = cols[sizeIdx];
      if (badgeIdx !== -1 && cols[badgeIdx]) prod.badge = cols[badgeIdx];
    }

    const cName = colorNameIdx !== -1 ? cols[colorNameIdx] : '';
    const cCode = colorCodeIdx !== -1 ? cols[colorCodeIdx] : '';
    const cHex = colorHexIdx !== -1 ? cols[colorHexIdx] : '';
    const cImg = imgIdx !== -1 ? cols[imgIdx] : '';

    if (cName || cCode || cImg) {
      if (!colorAccumulator.has(finalId)) {
        colorAccumulator.set(finalId, []);
      }
      const existingColors = colorAccumulator.get(finalId)!;
      const alreadyHas = existingColors.some(c => c.name === cName || (cCode && c.code === cCode));
      if (!alreadyHas) {
        const existingColorMatch = prod.colors?.find(c => 
          c.name.toLowerCase() === cName.toLowerCase() || 
          (cCode && c.code.toLowerCase() === cCode.toLowerCase())
        );
        existingColors.push({
          name: cName || cCode,
          code: cCode || cName,
          hex: cHex || existingColorMatch?.hex || '#A09D99',
          plankPhotoUrl: cImg || existingColorMatch?.plankPhotoUrl || undefined,
          roomPhotoUrl: existingColorMatch?.roomPhotoUrl || undefined
        });
      }
    }

    validRowsCount++;
  }

  // Update accumulated colors
  for (const [pId, colors] of colorAccumulator.entries()) {
    const prod = existingMap.get(pId);
    if (prod && colors.length > 0) {
      prod.colors = colors;
    }
  }

  return {
    updatedProducts: Array.from(existingMap.values()),
    rowCount: validRowsCount
  };
};

export const DEFAULT_GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1-6EJzXXUhZTc9bgNUYYRUVyTLHtuHFnTk24OFYZ6h5g/edit?usp=sharing';

/**
 * Builds a direct CSV export URL from any Google Sheets shareable link
 */
export const buildGoogleSheetsExportUrl = (inputUrl: string, sheetName?: string): string => {
  const cleanUrl = (inputUrl || DEFAULT_GOOGLE_SHEET_URL).trim();
  
  // Check if it's already a published export link
  if (cleanUrl.includes('output=csv') || cleanUrl.includes('output=tsv') || cleanUrl.includes('/pub?')) {
    return cleanUrl;
  }

  // Extract document ID and gid
  const idMatch = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = cleanUrl.match(/[#?&]gid=([0-9]+)/);
  const docId = idMatch ? idMatch[1] : null;
  const gid = gidMatch ? gidMatch[1] : null;

  if (docId) {
    const t = Date.now();
    if (gid) {
      return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}&t=${t}`;
    }
    if (sheetName && sheetName.trim()) {
      return `https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName.trim())}&t=${t}`;
    }
    return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&t=${t}`;
  }

  return cleanUrl;
};

/**
 * Fetches and synchronizes catalog directly from a Google Sheets URL
 * Uses backend proxy /api/sheets-sync to prevent CORS restrictions and handle sheet tabs smoothly
 */
export const fetchGoogleSheetsCatalog = async (
  sheetUrl: string,
  currentProducts: Product[],
  sheetName?: string,
  token?: string
): Promise<{ updatedProducts: Product[]; rowCount: number }> => {
  let fetchedCsvText = '';

  // 1. First attempt: Server Proxy (bypasses browser CORS & redirects)
  try {
    const serverRes = await fetch('/api/sheets-sync', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ url: sheetUrl, sheetName: sheetName || undefined, token: token || undefined })
    });

    if (serverRes.ok) {
      const serverJson = await serverRes.json();
      if (serverJson.success && serverJson.data) {
        fetchedCsvText = serverJson.data;
      }
    } else {
      const errorJson = await serverRes.json().catch(() => ({}));
      if (errorJson.error) {
        // If server identified document is private, throw with helpful hint
        throw new Error(`${errorJson.error} ${errorJson.hint ? '\n\n' + errorJson.hint : ''}`);
      }
    }
  } catch (err: any) {
    // If it's already an explicit permission error from server, rethrow it
    if (err.message && (err.message.includes('privado') || err.message.includes('Cualquier persona') || err.message.includes('Acceso denegado'))) {
      throw err;
    }
    // Otherwise fallback to client-side fetch below
  }

  // 2. Secondary fallback: Direct browser fetch if server was unreachable
  if (!fetchedCsvText) {
    const exportUrl = buildGoogleSheetsExportUrl(sheetUrl, sheetName);
    const response = await fetch(exportUrl);
    if (!response.ok) {
      throw new Error(`Error al conectar con Google Sheets (${response.status} ${response.statusText}). Asegúrate de que el documento tenga acceso "Cualquier persona con el enlace puede ver" o esté publicado en la web.`);
    }

    const text = await response.text();
    if (text.includes('<!DOCTYPE html>') && (text.includes('accounts.google.com') || text.includes('ServiceLogin'))) {
      throw new Error('El documento de Google Sheets es privado. Haz clic en "Compartir" en Google Sheets y cambia a "Cualquier persona con el enlace puede ver" (Lector).');
    }
    fetchedCsvText = text;
  }

  return parseProductsFromText(fetchedCsvText, currentProducts);
};


