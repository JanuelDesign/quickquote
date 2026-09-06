import { Product } from '../types';

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

