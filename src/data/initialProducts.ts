import { Product, AppSettings, Client } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // ==================== PISOS (LUXURY SPC & LAMINATE) ====================
  {
    id: 'spc-5.5mm-pulse-select',
    name: 'Pulse Select Collection',
    category: 'piso',
    subcategory: 'Luxury SPC',
    thickness: '5.5 mm',
    wearLayer: '20 Mil',
    size: '7" x 48"',
    sqftPerBox: 24.26,
    planksPerBox: 9,
    basePrice: 1.49, // per sqft
    priceUnit: 'sqft',
    description: 'SPC Vinyl 5.5 mm con manta acústica integrada. Alta resistencia para hogar y oficina.',
    colors: [
      {
        code: 'Q-01',
        name: 'Moody Gray',
        hex: '#30302C',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_1_moody_gray.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_1_moody_gray.webp'
      },
      {
        code: 'Q-02',
        name: 'Fearless Gray',
        hex: '#A09D99',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_2_fearless_gray.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_2_fearless_gray.webp'
      },
      {
        code: 'Q-03',
        name: 'Trustable Oak',
        hex: '#BDB5A4',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_3_trustable_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_3_trustable_oak.webp'
      },
      {
        code: 'Q-04',
        name: 'Grateful Pine',
        hex: '#AE9573',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_4_grateful_pine.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_4_grateful_pine.webp'
      },
      {
        code: 'Q-05',
        name: 'Vital Oak',
        hex: '#E3CBAA',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_5_vital_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_5_vital_oak.webp'
      },
      {
        code: 'Q-09',
        name: 'Polar Pearl',
        hex: '#C9CAC9',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_9_polar_pearl.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_9_polar_pearl.webp'
      },
      {
        code: 'Q-10',
        name: 'Serenity Oak',
        hex: '#C2B19C',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_10_serenity_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_10_serenity_oak.webp'
      },
      {
        code: 'Q-11',
        name: 'Classic Walnut',
        hex: '#6D5740',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_11_classic_walnut.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_11_classic_walnut.webp'
      },
      {
        code: 'Q-12',
        name: 'Oregon Vintage',
        hex: '#92836D',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_12_oregon_vintage.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_12_oregon_vintage.webp'
      },
      {
        code: 'Q-13',
        name: 'Harmony Gray',
        hex: '#615B4F',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_13_harmony_gray.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-select/room_13_harmony_gray.webp'
      }
    ]
  },
  {
    id: 'spc-5.7mm-pulse-shield',
    name: 'Pulse Shield Collection',
    category: 'piso',
    subcategory: 'Luxury SPC',
    thickness: '5.7 mm',
    wearLayer: '20 Mil',
    size: '9" x 48"',
    sqftPerBox: 27.49,
    planksPerBox: 9,
    basePrice: 1.69,
    priceUnit: 'sqft',
    description: 'Planchas anchas 9x48 formato Premium con capa de uso de 20 Mils.',
    colors: [
      { code: 'PS-01', name: 'Almond Beige', hex: '#D2C3B0' },
      { code: 'PS-02', name: 'Smoked Ash', hex: '#87837F' },
      { code: 'PS-03', name: 'Natural Hickory', hex: '#B89B72' },
      { code: 'PS-04', name: 'Desert Dune', hex: '#D7C4A5' }
    ]
  },
  {
    id: 'spc-6.0mm-pulse-shield-xl',
    name: 'Pulse Shield XL Collection',
    category: 'piso',
    subcategory: 'Luxury SPC',
    thickness: '6.0 mm',
    wearLayer: '20 Mil',
    size: '9" x 60" XL',
    sqftPerBox: 22.50,
    planksPerBox: 6,
    basePrice: 1.89,
    priceUnit: 'sqft',
    description: 'Formato extra largo 9"x60" para espacios amplios y elegantes.',
    colors: [
      {
        code: 'PX-02',
        name: 'Golden Honey',
        hex: '#D7C8A8',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_2_golden_honey.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-shield-xl/room_2_golden_honey.webp'
      },
      {
        code: 'PX-04',
        name: 'N Gray',
        hex: '#AFB1B3',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_4_n_gray.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-shield-xl/room_4_n_gray.webp'
      },
      {
        code: 'PX-05',
        name: 'Variation Gray',
        hex: '#787360',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_5_variation_gray.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-shield-xl/room_5_variation_gray.webp'
      },
      {
        code: 'PX-06',
        name: 'Oak Blossom',
        hex: '#AE9771',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_6_oak_blossom.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-shield-xl/room_6_oak_blossom.webp'
      },
      {
        code: 'PX-07',
        name: 'Maple',
        hex: '#B59D6E',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_7_maple.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/pulse-shield-xl/room_7_maple.webp'
      }
    ]
  },
  {
    id: 'spc-8.0mm-pulse-elegance',
    name: 'Pulse Elegance Collection',
    category: 'piso',
    subcategory: 'Luxury SPC',
    thickness: '8.0 mm',
    wearLayer: '22 Mil',
    size: '7" x 48"',
    sqftPerBox: 16.83,
    planksPerBox: 7,
    basePrice: 1.99,
    priceUnit: 'sqft',
    description: 'Máximo espesor 8mm con capa comercial de 22 Mils.',
    colors: [
      { code: 'PE-01', name: 'Manhattan Oak', hex: '#A39178' },
      { code: 'PE-02', name: 'Nordic Sand', hex: '#C7BBA8' },
      { code: 'PE-03', name: 'Savannah Walnut', hex: '#725C44' }
    ]
  },
  {
    id: 'spc-8.0mm-xl-pulse',
    name: 'XL Pulse Collection',
    category: 'piso',
    subcategory: 'Luxury SPC',
    thickness: '8.0 mm',
    wearLayer: '22 Mil',
    size: '9" x 60" XL',
    sqftPerBox: 19.29,
    planksPerBox: 5,
    basePrice: 2.04,
    priceUnit: 'sqft',
    description: 'SPC Premium 8mm en formato Gran Formato 9"x60" con 22 Mils.',
    colors: [
      {
        code: 'S-01',
        name: 'Liv Oak',
        hex: '#AC987B',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_1_liv_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_1_liv_oak.webp'
      },
      {
        code: 'S-02',
        name: 'Kirsche Oak',
        hex: '#897265',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_2_kirsche_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_2_kirsche_oak.webp'
      },
      {
        code: 'S-03',
        name: 'Hygge Gray',
        hex: '#D8D4CB',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_3_hygge_gray.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_3_hygge_gray.webp'
      },
      {
        code: 'S-05',
        name: 'Serenity Oak XL',
        hex: '#C0AE97',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_5_serenity_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_5_serenity_oak.webp'
      },
      {
        code: 'S-06',
        name: 'Japandi Oak',
        hex: '#DFCCAC',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_6_japandi_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_6_japandi_oak.webp'
      },
      {
        code: 'S-08',
        name: 'Chic Dark',
        hex: '#60615C',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_8_chic_dark.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_8_chic_dark.webp'
      },
      {
        code: 'S-09',
        name: 'Silver Oak',
        hex: '#BEBEB5',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_9_silver_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_9_silver_oak.webp'
      },
      {
        code: 'S-10',
        name: 'Toupe Oak',
        hex: '#958264',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_10_toupe_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_10_toupe_oak.webp'
      },
      {
        code: 'S-11',
        name: 'Jewel Oak',
        hex: '#D1C8BF',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_11_jewel_oak.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_11_jewel_oak.webp'
      },
      {
        code: 'S-12',
        name: 'Cherry XL',
        hex: '#986E45',
        plankPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_12_cherry_xl.webp',
        roomPhotoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/mockups/xl-pulse/room_12_cherry_xl.webp'
      }
    ]
  },
  {
    id: 'spc-8.0mm-pulse-pro',
    name: 'Pulse PRO Collection',
    category: 'piso',
    subcategory: 'Luxury SPC',
    thickness: '8.0 mm',
    wearLayer: '22 Mil',
    size: '9" x 54"',
    sqftPerBox: 20.37,
    planksPerBox: 6,
    basePrice: 2.19,
    priceUnit: 'sqft',
    description: 'Línea PRO de alta gama para proyectos comerciales y residenciales exigentes.',
    colors: [
      { code: 'PRO-01', name: 'Estate Oak', hex: '#9E886D' },
      { code: 'PRO-02', name: 'Castilian Sand', hex: '#C2AF94' },
      { code: 'PRO-03', name: 'Smoked Charcoal', hex: '#4A4846' }
    ]
  },
  {
    id: 'spc-10mm-ultrapulse',
    name: 'UltraPulse Collection',
    category: 'piso',
    subcategory: 'Luxury SPC',
    thickness: '10.0 mm',
    wearLayer: 'AC5 Heavy Commercial',
    size: '9" x 48"',
    sqftPerBox: 14.82,
    planksPerBox: 5,
    basePrice: 2.29,
    priceUnit: 'sqft',
    description: 'Máxima solidez y aislamiento acústico con 10mm de espesor y AC5.',
    colors: [
      { code: 'UP-01', name: 'Titanium Oak', hex: '#8F8A80' },
      { code: 'UP-02', name: 'Heritage Blonde', hex: '#D8C6A5' }
    ]
  },
  {
    id: 'laminate-spain-fs',
    name: 'Spain Laminate FS',
    category: 'piso',
    subcategory: 'Waterproof Laminate',
    thickness: '8.0 mm',
    wearLayer: 'AC6 | Eco Label',
    size: '9" x 51"',
    sqftPerBox: 20.30,
    planksPerBox: 8,
    basePrice: 1.79,
    priceUnit: 'sqft',
    description: 'Piso laminado resistente al agua de origen español con certificación AC6.',
    colors: [
      { code: 'SL-01', name: 'Barcelona Oak', hex: '#B59E7B' },
      { code: 'SL-02', name: 'Madrid Walnut', hex: '#7A6248' }
    ]
  },
  {
    id: 'laminate-spain-fe',
    name: 'Spain Laminate FE',
    category: 'piso',
    subcategory: 'Waterproof Laminate',
    thickness: '8.0 mm',
    wearLayer: 'AC6 | Eco Label',
    size: '7" x 52"',
    sqftPerBox: 22.24,
    planksPerBox: 8,
    basePrice: 1.79,
    priceUnit: 'sqft',
    description: 'Laminado español hidrófugo formato 7"x52" de alta durabilidad.',
    colors: [
      { code: 'SFE-01', name: 'Sevilla Natural', hex: '#C4B196' },
      { code: 'SFE-02', name: 'Valencia Gray', hex: '#99948D' }
    ]
  },
  {
    id: 'laminate-pulse-hd-core',
    name: 'Pulse HD Core Laminate',
    category: 'piso',
    subcategory: 'Waterproof Laminate',
    thickness: '7.0 mm',
    wearLayer: 'AC5 | Free PVC Black',
    size: '8" x 48"',
    sqftPerBox: 36.43,
    planksPerBox: 14,
    basePrice: 1.79,
    priceUnit: 'sqft',
    description: 'Núcleo de alta densidad HD Core con 36.43 sqft por caja.',
    colors: [
      { code: 'HD-01', name: 'Alpine Ash', hex: '#AEAAA3' },
      { code: 'HD-02', name: 'Tuscan Oak', hex: '#B89B72' }
    ]
  },
  {
    id: 'tile-porcelane-pulse',
    name: 'Porcelane Tile Pulse',
    category: 'piso',
    subcategory: 'Porcelane Tile',
    thickness: '9.0 mm',
    wearLayer: 'PEI 3 Stain & Glossy',
    size: '24" x 48"',
    sqftPerBox: 15.50,
    planksPerBox: 2,
    basePrice: 1.79,
    priceUnit: 'sqft',
    description: 'Porcelanato rectificado 24x48 para acabados pulidos y mate de lujo.',
    colors: [
      { code: 'TP-01', name: 'Calacatta White', hex: '#ECEAE4' },
      { code: 'TP-02', name: 'Marquina Black', hex: '#2A2928' }
    ]
  },

  // ==================== RODAPIÉ (BASEBOARD) ====================
  // All baseboards sell in linear feet / strips of 16 LF (or 8/12 LF). Standard rounding up to multiple of 16.
  {
    id: 'bb-1x6-14mm-pine',
    name: 'Baseboard BB1x6 (14 mm - 9/16")',
    category: 'rodapie',
    subcategory: 'Pine Baseboard',
    thickness: '14 mm x 135 mm',
    size: '5 1/2" x 1/2" x 16 ft PINE',
    stripLengthFeet: 16,
    basePrice: 0.99, // price per linear foot ($15.84 per 16ft strip)
    priceUnit: 'linear_ft',
    description: 'Madera de pino tratada e imprimada en blanco lista para pintar. Tiras de 16 ft.',
    colors: [{ code: 'WP', name: 'White Primed', hex: '#F8F8F8' }]
  },
  {
    id: 'bb-1x4-14mm-pine',
    name: 'Baseboard BB1x4 (14 mm - 9/16")',
    category: 'rodapie',
    subcategory: 'Pine Baseboard',
    thickness: '14 mm x 85 mm',
    size: '3 1/2" x 1/2" x 16 ft PINE',
    stripLengthFeet: 16,
    basePrice: 0.79, // $12.64 per 16ft strip
    priceUnit: 'linear_ft',
    description: 'Baseboard estándar 3 1/2" en madera de pino blanco. Tiras de 16 ft.',
    colors: [{ code: 'WP', name: 'White Primed', hex: '#F8F8F8' }]
  },
  {
    id: 'bb-5180-14mm-pine',
    name: 'Baseboard BB5180 Colonial (14 mm)',
    category: 'rodapie',
    subcategory: 'Colonial Baseboard',
    thickness: '14 mm x 133 mm',
    size: '5 1/4" x 9/16" x 16 ft PINE',
    stripLengthFeet: 16,
    basePrice: 0.89, // $14.24 per 16ft strip
    priceUnit: 'linear_ft',
    description: 'Perfil colonial clásico 5 1/4" para acabados tradicionales. Tiras de 16 ft.',
    colors: [{ code: 'WP', name: 'White Primed', hex: '#F8F8F8' }]
  },
  {
    id: 'bb-1x6-18mm-heavy',
    name: 'Baseboard BB1x6 Heavy (18 mm)',
    category: 'rodapie',
    subcategory: 'Pine Baseboard',
    thickness: '18 mm x 135 mm',
    size: '5 1/2" x 3/4" x 16 ft PINE',
    stripLengthFeet: 16,
    basePrice: 1.15, // $18.40 per 16ft strip
    priceUnit: 'linear_ft',
    description: 'Perfil robusto extra grueso de 18mm para mayor impacto visual. Tiras de 16 ft.',
    colors: [{ code: 'WP', name: 'White Primed', hex: '#F8F8F8' }]
  },
  {
    id: 'bb-618-curved',
    name: 'Baseboard BB618 Curved (14 mm)',
    category: 'rodapie',
    subcategory: 'Curved Baseboard',
    thickness: '14 mm x 140 mm',
    size: '5 1/2" x 9/16" x 16 ft',
    stripLengthFeet: 16,
    basePrice: 1.05,
    priceUnit: 'linear_ft',
    description: 'Perfil curvo moderno para remates elegantes. Tiras de 16 ft.',
    colors: [{ code: 'WP', name: 'White Primed', hex: '#F8F8F8' }]
  },
  {
    id: 'bb-quarter-round-pine-16',
    name: 'Quarter Round (Pine/MDF 16 ft)',
    category: 'rodapie',
    subcategory: 'Quarter Round',
    thickness: 'MDF / Pine',
    size: 'MDF 16 Ft Long',
    stripLengthFeet: 16,
    basePrice: 0.50, // $8.00 per 16ft strip
    priceUnit: 'linear_ft',
    description: 'Moldura cuarto de bocel de 16 pies lineales para sellar juntas.',
    colors: [{ code: 'WS', name: 'White Satin', hex: '#F8F8F8' }]
  },
  {
    id: 'bb-quarter-round-mdf-8',
    name: 'Quarter Round MDF (8 ft)',
    category: 'rodapie',
    subcategory: 'Quarter Round',
    thickness: 'MDF',
    size: 'MDF 8 Ft Long',
    stripLengthFeet: 8,
    basePrice: 0.40, // $3.20 per 8ft strip
    priceUnit: 'linear_ft',
    description: 'Cuarto de bocel MDF en tramos prácticos de 8 pies.',
    colors: [{ code: 'WS', name: 'White Satin', hex: '#F8F8F8' }]
  },
  {
    id: 'bb-quarter-round-eps-12',
    name: 'Quarter Round EPS Waterproof (12 ft)',
    category: 'rodapie',
    subcategory: 'Waterproof Quarter Round',
    thickness: '15 mm x 15 mm',
    size: 'MDF/EPS 12 Ft Long WaterProof',
    stripLengthFeet: 12,
    basePrice: 0.60, // $7.20 per 12ft strip
    priceUnit: 'linear_ft',
    description: '100% impermeable, ideal para cocinas, baños y áreas húmedas.',
    colors: [{ code: 'WS', name: 'White Satin', hex: '#F8F8F8' }]
  },
  {
    id: 'bb-square-1x1-mdf-8',
    name: 'Square 1x1 MDF Waterproof (8 ft)',
    category: 'rodapie',
    subcategory: 'Square Trim',
    thickness: '1" x 1"',
    size: 'MDF 8 Ft Long WaterProof',
    stripLengthFeet: 8,
    basePrice: 0.89, // $7.12 per 8ft strip
    priceUnit: 'linear_ft',
    description: 'Perfil cuadrado minimalista impermeable 1x1 en tiras de 8 ft.',
    colors: [{ code: 'WS', name: 'White Satin', hex: '#F8F8F8' }]
  },

  // ==================== PERFILES & MOLDURAS ====================
  {
    id: 'molding-cm-t-molding',
    name: 'CM T-Molding (Transición SPC)',
    category: 'perfiles',
    subcategory: 'Moldings',
    thickness: 'Matching SPC Commercial',
    size: '94" (2.40 m) - L 94 1/2" W 1 3/4" H 3/8"',
    basePrice: 30.00,
    priceUnit: 'piece',
    description: 'Perfil T de transición entre pisos del mismo nivel al tono exacto del SPC.',
    colors: [{ code: 'MATCH', name: 'Al tono del piso seleccionado', hex: '#C7B28E' }]
  },
  {
    id: 'molding-cm-reducer',
    name: 'CM Reducer (Reductor de Desnivel)',
    category: 'perfiles',
    subcategory: 'Moldings',
    thickness: 'Matching SPC Commercial',
    size: '94" (2.40 m) - L 94 1/2" W 1 3/4" H 3/8"',
    basePrice: 30.00,
    priceUnit: 'piece',
    description: 'Perfil reductor de nivel para unir piso SPC con alfombra o cerámica.',
    colors: [{ code: 'MATCH', name: 'Al tono del piso seleccionado', hex: '#C7B28E' }]
  },
  {
    id: 'molding-end-cap',
    name: 'End Cap / Terminal Cuadrado',
    category: 'perfiles',
    subcategory: 'Moldings',
    thickness: 'Matching SPC Commercial',
    size: '94" (2.40 m) - L 94 1/2" W 1 3/4" H 3/8"',
    basePrice: 30.00,
    priceUnit: 'piece',
    description: 'Perfil de remate contra puertas correderas, chimeneas y paredes.',
    colors: [{ code: 'MATCH', name: 'Al tono del piso seleccionado', hex: '#C7B28E' }]
  },
  {
    id: 'molding-aluminum-tmolding',
    name: 'Aluminum Moldings Laminate (T-Molding / End)',
    category: 'perfiles',
    subcategory: 'Aluminum Moldings',
    thickness: 'Aluminio Anodizado',
    size: 'W 1 3/4" H 1/4" L 78"',
    basePrice: 45.00,
    priceUnit: 'piece',
    description: 'Perfil de aluminio reforzado de 78" para zonas de tráfico intenso.',
    colors: [
      { code: 'AL-SILVER', name: 'Matte Silver', hex: '#CCCCCC' },
      { code: 'AL-BLACK', name: 'Matte Black', hex: '#1C1C1C' },
      { code: 'AL-BRASS', name: 'Brushed Brass', hex: '#CBB279' }
    ]
  },
  {
    id: 'molding-profile-l-skirting',
    name: 'Profile L Skirting',
    category: 'perfiles',
    subcategory: 'Wall Profiles',
    size: 'Tira 2.40 m',
    basePrice: 20.00,
    priceUnit: 'piece',
    description: 'Perfil en L para zócalos y paneles de pared.'
  },
  {
    id: 'molding-profile-concave',
    name: 'Profile Concave',
    category: 'perfiles',
    subcategory: 'Wall Profiles',
    size: 'Tira 2.40 m',
    basePrice: 20.00,
    priceUnit: 'piece',
    description: 'Perfil cóncavo de esquina interior para remate limpio.'
  },
  {
    id: 'molding-profile-endcap-wall',
    name: 'Profile Mini End Cap / End Cap',
    category: 'perfiles',
    subcategory: 'Wall Profiles',
    size: 'Tira 2.40 m',
    basePrice: 20.00,
    priceUnit: 'piece',
    description: 'Mini terminal para remate perimetral de revestimientos.'
  },

  // ==================== ESCALONES (STAIR TREADS & STEPS) ====================
  {
    id: 'steps-double-rounded',
    name: 'Escalón Double Rounded Step',
    category: 'escalones',
    subcategory: 'Stair Treads',
    thickness: '5.5 mm / 6.0 mm / 8.0 mm (20-22 Mil)',
    size: '12" x 48" (Largo de la tabla)',
    basePrice: 19.00, // per step
    priceUnit: 'piece',
    description: 'Peldaño con doble curvatura redondeada ergonómica al tono del SPC. Soporta contrahuella.',
    colors: [{ code: 'MATCH', name: 'Al tono del piso seleccionado', hex: '#C7B28E' }]
  },
  {
    id: 'steps-square-edge',
    name: 'Escalón Square Edge Step (Canto Recto)',
    category: 'escalones',
    subcategory: 'Stair Treads',
    thickness: '5.5 mm / 6.0 mm / 8.0 mm (20-22 Mil)',
    size: '12" x 48" (Largo de la tabla)',
    basePrice: 19.00,
    priceUnit: 'piece',
    description: 'Peldaño de canto cuadrado moderno estilo flotante. Compatible con Riser Plank.',
    colors: [{ code: 'MATCH', name: 'Al tono del piso seleccionado', hex: '#C7B28E' }]
  },
  {
    id: 'steps-riser-plank',
    name: 'Contrahuella (Riser Plank White Laminate)',
    category: 'escalones',
    subcategory: 'Stair Risers',
    size: 'White Laminate Plank (Length of the plank)',
    basePrice: 9.00, // per riser
    priceUnit: 'piece',
    description: 'Tabla vertical de contrahuella blanca laminada para acabado en contraste.'
  },

  // ==================== WALL PANELS (PANELES DE PARED) ====================
  {
    id: 'wall-panels-indoor',
    name: 'WPC Fluted Wall Panel Indoor',
    category: 'wall_panels',
    subcategory: 'Fluted Panels',
    size: '1" x 6 5/8" x 113" (aprox. 9.5 ft de alto)',
    basePrice: 17.00,
    priceUnit: 'piece',
    badge: 'Popular',
    description: 'Panel acanalado WPC para revestimiento de pared interior. Resistente a humedad, termitas y de fácil instalación macho-hembra.',
    colors: [
      { code: 'WP-01', name: 'Natural Oak', hex: '#C7A779' },
      { code: 'WP-02', name: 'Walnut Dark', hex: '#5A3D28' },
      { code: 'WP-03', name: 'Charcoal Black', hex: '#222222' },
      { code: 'WP-04', name: 'Smoked Gray', hex: '#8C8C8C' },
      { code: 'WP-05', name: 'Pure White', hex: '#F3F3F3' }
    ]
  },
  {
    id: 'acoustic-wall-panel',
    name: 'Acoustic Slat Wall Panel Wood',
    category: 'wall_panels',
    subcategory: 'Acoustic Wood Slats',
    size: '1" x 12" x 92" (Panel Acústico)',
    basePrice: 35.00,
    priceUnit: 'piece',
    badge: 'Premium',
    description: 'Panel acústico en listones de madera natural MDF enchapada con base de fieltro acústico negro de alta absorción de eco.',
    colors: [
      { code: 'AWP-01', name: 'Scandinavian Oak', hex: '#D2B58D' },
      { code: 'AWP-02', name: 'American Walnut', hex: '#4B3621' },
      { code: 'AWP-03', name: 'Smoked Ash', hex: '#63615E' },
      { code: 'AWP-04', name: 'Midnight Black', hex: '#1C1C1C' }
    ]
  },
  {
    id: 'wall-panel-uv-marble',
    name: 'UV Marble Wall Sheet (Lámina de Mármol)',
    category: 'wall_panels',
    subcategory: 'Marble Sheets',
    size: '48" x 96" (4x8 ft) | Espesor 3mm',
    basePrice: 55.00,
    priceUnit: 'piece',
    description: 'Lámina de PVC con acabado de mármol brillante UV de gran formato para paredes de salas, duchas y fondos de TV.',
    colors: [
      { code: 'MAR-01', name: 'Carrara White', hex: '#EBEAE8' },
      { code: 'MAR-02', name: 'Nero Marquina', hex: '#1E1E1E' },
      { code: 'MAR-03', name: 'Statuario Gold', hex: '#E5DFD3' }
    ]
  },
  {
    id: 'wall-panel-trim-metal',
    name: 'Aluminum Edge & End Cap Trim for Panels',
    category: 'wall_panels',
    subcategory: 'Panel Accessories',
    size: 'Tira de 9.5 ft (Remate perimetral)',
    basePrice: 14.00,
    priceUnit: 'piece',
    description: 'Perfil de remate final en aluminio anodizado para bordes de paneles y esquinas exteriores.',
    colors: [
      { code: 'TRIM-BLK', name: 'Matte Black', hex: '#1C1C1C' },
      { code: 'TRIM-GLD', name: 'Brushed Brass Gold', hex: '#C5A059' },
      { code: 'TRIM-SLV', name: 'Anodized Silver', hex: '#BDBDBD' }
    ]
  },

  // ==================== UNDERLAYMENTS & AISLANTES ====================
  {
    id: 'underlayment-ixpe-padding',
    name: 'Underlayment IXPE Acoustic Foam (2mm)',
    category: 'underlayment',
    subcategory: 'Acoustic Underlayment',
    size: '100 sqft / rollo | 2mm | 68 STC - 72 IIC',
    basePrice: 22.00,
    priceUnit: 'unit',
    badge: 'Standard',
    description: 'Manta acústica de alta densidad IXPE con solapa autoadhesiva para reducción de sonido y amortiguación de pisada.'
  },
  {
    id: 'underlayment-eva-gold',
    name: 'EVA Foam Heavy Duty with Gold Moisture Barrier',
    category: 'underlayment',
    subcategory: 'Acoustic & Moisture',
    size: '100 sqft / rollo | 3mm | Film de Aluminio Oro',
    basePrice: 28.00,
    priceUnit: 'unit',
    badge: 'Recomendado',
    description: 'Bajo piso EVA de 3mm con lámina de barrera de vapor integrada color oro para máxima protección y aislamiento térmico/acústico.'
  },
  {
    id: 'underlayment-vapor-barrier',
    name: 'Plastic Vapor Barrier 6 Mils (Barrera de Vapor)',
    category: 'underlayment',
    subcategory: 'Moisture Barrier',
    size: 'Poly Plastic Sheeting 6 Mils | 1,000 sqft / rollo',
    basePrice: 65.00,
    priceUnit: 'unit',
    description: 'Rollo de polietileno virgen de 6 Mils para protección estricta contra humedad ascendente en losas de concreto.'
  },
  {
    id: 'underlayment-natural-cork',
    name: 'Natural Cork Acoustic Roll Underlayment',
    category: 'underlayment',
    subcategory: 'Natural Cork',
    size: '200 sqft / rollo | 1/4" espesor (6mm)',
    basePrice: 85.00,
    priceUnit: 'unit',
    description: 'Rollo de corcho 100% natural, ideal para cumplimiento estricto de normativas acústicas de condominios y HOA en Florida.'
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  salespersonName: 'Asesor Quicksurfaces',
  salespersonPhone: '(305) 555-0199',
  defaultValidDays: 3,
  companyAddress: '13405 SW 128th St, Unit 208B, Miami, FL 33186',
  companyPhone: '(305) 555-0199',
  companyEmail: 'sales@quicksurfaces.com',
  companyLogoUrl: '',
  taxRate: 0.07, // 7%
  deliveryFee: 60.00 // $60
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-sample-1',
    name: 'Roberto Gómez (Contratista Doral)',
    phone: '(305) 777-3829',
    email: 'rgomez@flcontractor.com',
    address: '8400 NW 36th St, Doral, FL 33166',
    notes: 'Cliente recurrente instalador',
    createdAt: new Date().toISOString()
  },
  {
    id: 'client-sample-2',
    name: 'Carolina Méndez (Residencial Coral Gables)',
    phone: '(786) 443-9912',
    email: 'carolina.m@gmail.com',
    address: '1240 Ponce de Leon Blvd, Coral Gables, FL',
    notes: 'Proyecto renovación piso planta alta',
    createdAt: new Date().toISOString()
  }
];

