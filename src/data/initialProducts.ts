import { Product, AppSettings, Client } from "../types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "spc-5.5mm-pulse-select",
    "name": "Pulse Select Collection",
    "category": "piso",
    "subcategory": "Pulse Select",
    "badge": "BEST SELLER",
    "thickness": "5.5 mm",
    "size": "7\" x 48\"",
    "sqftPerBox": 24.26,
    "basePrice": 1.49,
    "priceUnit": "sqft",
    "description": "Capa de uso: 20 Mil. 9 tablas/caja. SPC Vinyl 5.5 mm con manta acústica integrada. Alta resistencia para hogar y oficina.",
    "colors": [
      {
        "name": "Moody Gray",
        "code": "Q-0115",
        "hex": "#30302C",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_1_moody_gray.webp"
      },
      {
        "name": "Fearless Gray",
        "code": "Q-02546",
        "hex": "#A09D99",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_2_fearless_gray.webp"
      },
      {
        "name": "Trustable Oak",
        "code": "Q-03",
        "hex": "#BDB5A4",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_3_trustable_oak.webp"
      },
      {
        "name": "Grateful Pine",
        "code": "Q-04",
        "hex": "#AE9573",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_4_grateful_pine.webp"
      },
      {
        "name": "Vital Oak",
        "code": "Q-05",
        "hex": "#E3CBAA",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_5_vital_oak.webp"
      },
      {
        "name": "Euphoric Chery",
        "code": "Q-07",
        "hex": "#986E45"
      },
      {
        "name": "Polar Pearl",
        "code": "Q-09",
        "hex": "#C9CAC9",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_9_polar_pearl.webp"
      },
      {
        "name": "Serenity Oak",
        "code": "Q-10",
        "hex": "#C2B19C",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_10_serenity_oak.webp"
      },
      {
        "name": "Classic Walnut",
        "code": "Q-11",
        "hex": "#6D5740",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_11_classic_walnut.webp"
      },
      {
        "name": "Oregon Vintage",
        "code": "Q-12",
        "hex": "#92836D",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_12_oregon_vintage.webp"
      },
      {
        "name": "Harmony Gray",
        "code": "Q-13",
        "hex": "#615B4F",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-select/plank_13_harmony_gray.webp"
      }
    ]
  },
  {
    "id": "spc-5.7mm-pulse-shield",
    "name": "Pulse Shield Collection",
    "category": "piso",
    "subcategory": "Pulse Shield",
    "badge": "PREMIUM",
    "thickness": "5.7 mm",
    "size": "9\" x 48\"",
    "sqftPerBox": 27.49,
    "basePrice": 1.69,
    "priceUnit": "sqft",
    "description": "Capa de uso: 20 Mil. 9 tablas/caja. Planchas anchas 9x48 formato Premium con capa de uso de 20 Mils.",
    "colors": [
      {
        "name": "Almond Beige",
        "code": "PS-01",
        "hex": "#D2C3B0"
      },
      {
        "name": "Smoked Ash",
        "code": "PS-02",
        "hex": "#87837F"
      },
      {
        "name": "Natural Hickory",
        "code": "PS-03",
        "hex": "#B89B72"
      },
      {
        "name": "Desert Dune",
        "code": "PS-04",
        "hex": "#D7C4A5"
      }
    ]
  },
  {
    "id": "spc-6.0mm-pulse-shield-xl",
    "name": "Pulse Shield XL Collection",
    "category": "piso",
    "subcategory": "Pulse Shield XL",
    "thickness": "6.0 mm",
    "size": "9\" x 60\" XL",
    "sqftPerBox": 22.5,
    "basePrice": 1.89,
    "priceUnit": "sqft",
    "description": "Capa de uso: 20 Mil. 6 tablas/caja. Formato extra largo 9\"x60\" para espacios amplios y elegantes.",
    "colors": [
      {
        "name": "Golden Honey",
        "code": "PX-02",
        "hex": "#D7C8A8",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_2_golden_honey.webp"
      },
      {
        "name": "N Gray",
        "code": "PX-04",
        "hex": "#AFB1B3",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_4_n_gray.webp"
      },
      {
        "name": "Variation Gray",
        "code": "PX-05",
        "hex": "#787360",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_5_variation_gray.webp"
      },
      {
        "name": "Oak Blossom",
        "code": "PX-06",
        "hex": "#AE9771",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_6_oak_blossom.webp"
      },
      {
        "name": "Maple",
        "code": "PX-07",
        "hex": "#B59D6E",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/pulse-shield-xl/plank_7_maple.webp"
      }
    ]
  },
  {
    "id": "spc-8.0mm-pulse-elegance",
    "name": "Pulse Elegance Collection",
    "category": "piso",
    "subcategory": "Pulse Elegance",
    "thickness": "8.0 mm",
    "size": "7\" x 48\"",
    "sqftPerBox": 16.83,
    "basePrice": 1.99,
    "priceUnit": "sqft",
    "description": "Capa de uso: 22 Mil. 7 tablas/caja. Máximo espesor 8mm con capa comercial de 22 Mils.",
    "colors": [
      {
        "name": "Manhattan Oak",
        "code": "PE-01",
        "hex": "#A39178"
      },
      {
        "name": "Nordic Sand",
        "code": "PE-02",
        "hex": "#C7BBA8"
      },
      {
        "name": "Savannah Walnut",
        "code": "PE-03",
        "hex": "#725C44"
      }
    ]
  },
  {
    "id": "spc-8.0mm-xl-pulse",
    "name": "XL Pulse Collection",
    "category": "piso",
    "subcategory": "XL Pulse",
    "thickness": "8.0 mm",
    "size": "9\" x 60\" XL",
    "sqftPerBox": 19.29,
    "basePrice": 2.04,
    "priceUnit": "sqft",
    "description": "Capa de uso: 22 Mil. 5 tablas/caja. SPC Premium 8mm en formato Gran Formato 9\"x60\" con 22 Mils.",
    "colors": [
      {
        "name": "Liv Oak",
        "code": "S-01",
        "hex": "#AC987B",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_1_liv_oak.webp"
      },
      {
        "name": "Kirsche Oak",
        "code": "S-02",
        "hex": "#897265",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_2_kirsche_oak.webp"
      },
      {
        "name": "Hygge Gray",
        "code": "S-03",
        "hex": "#D8D4CB",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_3_hygge_gray.webp"
      },
      {
        "name": "Serenity Oak XL",
        "code": "S-05",
        "hex": "#C0AE97",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_5_serenity_oak.webp"
      },
      {
        "name": "Japandi Oak",
        "code": "S-06",
        "hex": "#DFCCAC",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_6_japandi_oak.webp"
      },
      {
        "name": "Chic Dark",
        "code": "S-08",
        "hex": "#60615C",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_8_chic_dark.webp"
      },
      {
        "name": "Silver Oak",
        "code": "S-09",
        "hex": "#BEBEB5",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_9_silver_oak.webp"
      },
      {
        "name": "Toupe Oak",
        "code": "S-10",
        "hex": "#958264",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_10_toupe_oak.webp"
      },
      {
        "name": "Jewel Oak",
        "code": "S-11",
        "hex": "#D1C8BF",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_11_jewel_oak.webp"
      },
      {
        "name": "Cherry XL",
        "code": "S-12",
        "hex": "#986E45",
        "plankPhotoUrl": "https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/products/xl-pulse/plank_12_cherry_xl.webp"
      }
    ]
  },
  {
    "id": "spc-8.0mm-pulse-pro",
    "name": "Pulse PRO Collection",
    "category": "piso",
    "subcategory": "Pulse PRO",
    "badge": "COMMERCIAL PRO",
    "thickness": "8.0 mm",
    "size": "9\" x 54\"",
    "sqftPerBox": 20.37,
    "basePrice": 2.19,
    "priceUnit": "sqft",
    "description": "Capa de uso: 22 Mil. 6 tablas/caja. Formato 9\"x54\". Línea PRO de alta gama para proyectos comerciales y residenciales exigentes.",
    "colors": [
      {
        "name": "Estate Oak",
        "code": "PRO-01",
        "hex": "#9E886D"
      },
      {
        "name": "Castilian Sand",
        "code": "PRO-02",
        "hex": "#C2AF94"
      },
      {
        "name": "Smoked Charcoal",
        "code": "PRO-03",
        "hex": "#4A4846"
      },
      {
        "name": "Nordic Slate",
        "code": "PRO-04",
        "hex": "#73787E"
      },
      {
        "name": "Californian Walnut",
        "code": "PRO-05",
        "hex": "#5A4331"
      }
    ]
  },
  {
    "id": "spc-10mm-ultrapulse",
    "name": "UltraPULSE Collection",
    "category": "piso",
    "subcategory": "UltraPulse",
    "badge": "ULTRA MINERAL CORE",
    "thickness": "10.0 mm",
    "size": "9\" x 48\"",
    "sqftPerBox": 18.29,
    "basePrice": 2.29,
    "priceUnit": "sqft",
    "description": "Ultra Mineral Core (8 mm UMC + 2 mm HD EVA). Capa de uso: AC5 (22 Mils). Acabado Satin. 5 tablas/caja (18.29 sqft/caja). Angle Angle. Garantía: 30 años residencial / 10 años comercial.",
    "colors": [
      {
        "name": "Caliza",
        "code": "SI-20",
        "hex": "#D8D2C4"
      },
      {
        "name": "Volcanica",
        "code": "SI-10",
        "hex": "#C2BFB9"
      },
      {
        "name": "Grabo",
        "code": "SI-40",
        "hex": "#545752"
      },
      {
        "name": "Castaño",
        "code": "SI-30",
        "hex": "#261A13"
      }
    ]
  },
  {
    "id": "spc-8mm-pulsewood-herringbone",
    "name": "PULSEWood Herringbone Collection",
    "category": "piso",
    "subcategory": "PulseWood",
    "badge": "HERRINGBONE",
    "thickness": "8.0 mm",
    "size": "5\" x 27\"",
    "sqftPerBox": 11.75,
    "basePrice": 2.39,
    "priceUnit": "sqft",
    "description": "PULSEWood Herringbone. Capa de uso 22 Mil. 6 mm rigid core + 2 mm HD EVA. Acabado Satin. 12 tablas/caja (11.75 sqft/caja). Instalación Angle Angle.",
    "colors": [
      {
        "name": "Vintage",
        "code": "B-04",
        "hex": "#8F8778"
      },
      {
        "name": "Japandi H",
        "code": "B-03",
        "hex": "#D9C3A1"
      },
      {
        "name": "Natural H",
        "code": "B-05",
        "hex": "#B99868"
      }
    ]
  },
  {
    "id": "spc-8mm-pulsewood-random",
    "name": "PULSEWood Random Width Collection",
    "category": "piso",
    "subcategory": "PulseWood",
    "badge": "RANDOM WIDTH",
    "thickness": "8.0 mm",
    "size": "Random Width x 48\"",
    "sqftPerBox": 35.46,
    "basePrice": 2.39,
    "priceUnit": "sqft",
    "description": "PULSEWood Random Width. Capa de uso 22 Mil. 6 mm rigid core + 2 mm HD EVA. Acabado Satin. 15 tablas/caja (35.46 sqft/caja). Instalación Angle Angle.",
    "colors": [
      {
        "name": "Vintage",
        "code": "B-04",
        "hex": "#8F8778"
      },
      {
        "name": "Japandi H",
        "code": "B-03",
        "hex": "#D9C3A1"
      },
      {
        "name": "Natural H",
        "code": "B-05",
        "hex": "#B99868"
      }
    ]
  },
  {
    "id": "laminate-pulse-hd-core",
    "name": "PULSEHD Collection",
    "category": "piso",
    "subcategory": "Pulse HD Core",
    "badge": "HD LAMINATE",
    "thickness": "7.0 mm",
    "size": "8\" x 48\"",
    "sqftPerBox": 36.43,
    "basePrice": 1.79,
    "priceUnit": "sqft",
    "description": "Waterproof High Density Laminate. Capa de uso AC5. Acabado Satin. 14 tablas/caja (36.43 sqft/caja). Free PVC Black HD Core. Garantía: 30 años residencial / 10 años comercial.",
    "colors": [
      {
        "name": "Hera Beige",
        "code": "HD6",
        "hex": "#D1C9BC"
      },
      {
        "name": "Gala Oak",
        "code": "HD2",
        "hex": "#BD9F77"
      },
      {
        "name": "Zlato Oak",
        "code": "HD4",
        "hex": "#B49661"
      },
      {
        "name": "Koppar Oak",
        "code": "HD1",
        "hex": "#8D5432"
      },
      {
        "name": "Argenta Grey",
        "code": "HD3",
        "hex": "#9EA5AB"
      },
      {
        "name": "Kern Oak",
        "code": "HD5",
        "hex": "#7C7872"
      }
    ]
  },
  {
    "id": "laminate-spain-fe",
    "name": "Finsa Spain Laminate - Evolve Collection",
    "category": "piso",
    "subcategory": "Spain Laminate",
    "badge": "MADE IN SPAIN",
    "thickness": "8.0 mm",
    "size": "7\" x 52\"",
    "sqftPerBox": 22.24,
    "basePrice": 1.79,
    "priceUnit": "sqft",
    "description": "Finsa Waterproof Laminate Made In Spain. Commercial Intense (Clase 33 / AC6). 8 mm rigid core. 8 tablas/caja (22.24 sqft/caja). Angle Angle.",
    "colors": [
      {
        "name": "Bruno",
        "code": "EV-BR",
        "hex": "#38383A"
      },
      {
        "name": "Noz",
        "code": "EV-NZ",
        "hex": "#543D2D"
      },
      {
        "name": "Blanco",
        "code": "EV-BL",
        "hex": "#D8D9DC"
      },
      {
        "name": "Esencia",
        "code": "EV-ES",
        "hex": "#D2BA96"
      },
      {
        "name": "Crepúsculo",
        "code": "EV-CR",
        "hex": "#9D8A7E"
      }
    ]
  },
  {
    "id": "laminate-spain-fs",
    "name": "Finsa Spain Laminate - Supreme Collection",
    "category": "piso",
    "subcategory": "Spain Laminate",
    "badge": "MADE IN SPAIN",
    "thickness": "8.0 mm",
    "size": "9\" x 51\"",
    "sqftPerBox": 20.30,
    "basePrice": 1.79,
    "priceUnit": "sqft",
    "description": "Finsa Waterproof Laminate Made In Spain. Commercial Intense (Clase 33 / AC6). Formato ancho 9\"x51\". 8 tablas/caja (20.30 sqft/caja). Angle Angle.",
    "colors": [
      {
        "name": "Crudo",
        "code": "SUP-CR",
        "hex": "#DDD1BE"
      },
      {
        "name": "Santorini",
        "code": "SUP-SA",
        "hex": "#DDDCDA"
      },
      {
        "name": "Victoria",
        "code": "SUP-VI",
        "hex": "#888681"
      }
    ]
  },
  {
    "id": "tile-porcelane-pulse",
    "name": "TILE PULSE Porcelain Tiles",
    "category": "piso",
    "subcategory": "Tile Pulse",
    "badge": "PORCELAIN TILE",
    "thickness": "9.0 mm",
    "size": "24\" x 48\"",
    "sqftPerBox": 15.5,
    "basePrice": 1.79,
    "priceUnit": "sqft",
    "description": "Porcelain Floor Tiles-Coloured. Medidas: 24\" x 48\". 2 piezas/caja (15.5 sqft/caja). Clasificación PEI 3. Bordes rectificados. Acabados Satin, Glossy y Matte.",
    "colors": [
      {
        "name": "Stellar Statuario (Satin)",
        "code": "L-1",
        "hex": "#F4F3F1"
      },
      {
        "name": "Celestial Crema (Glossy / Satin)",
        "code": "L-2",
        "hex": "#F1E5D5"
      },
      {
        "name": "Titanium Grey (Glossy / Matte)",
        "code": "L-3",
        "hex": "#E6E6E6"
      },
      {
        "name": "Obsidian Noir (Glossy / Matte)",
        "code": "L-4",
        "hex": "#7E8181"
      },
      {
        "name": "Luminous Pearl (Glossy / Matte)",
        "code": "L-5",
        "hex": "#E2DFD9"
      },
      {
        "name": "Florence White (Glossy / Matte)",
        "code": "L-6",
        "hex": "#FAF5EE"
      },
      {
        "name": "Divine Statuario (Glossy / Satin)",
        "code": "L-7",
        "hex": "#F6F4F0"
      },
      {
        "name": "Lunar Onix (Glossy / Satin)",
        "code": "L-8",
        "hex": "#EFF0F2"
      },
      {
        "name": "Arbascato Blanco (Glossy / Satin)",
        "code": "L-9",
        "hex": "#F2F1EF"
      },
      {
        "name": "Sahara Pulido (Satin)",
        "code": "L-10",
        "hex": "#E8D7C0"
      },
      {
        "name": "Avant-Garde White (Glossy / Matte)",
        "code": "L-11",
        "hex": "#E5E8DD"
      }
    ]
  },
  {
    "id": "bb-1x6-14mm-pine",
    "name": "Baseboard BB1x6 (14 mm - 9/16\")",
    "category": "rodapie",
    "subcategory": "Pine Baseboard",
    "thickness": "14 mm x 135 mm",
    "size": "5 1/2\" x 1/2\" x 16 ft PINE",
    "stripLengthFeet": 16,
    "basePrice": 0.99,
    "priceUnit": "linear_ft",
    "description": "Madera de pino tratada e imprimada en blanco lista para pintar. Tiras de 16 ft.",
    "colors": [
      {
        "name": "White Primed",
        "code": "WP",
        "hex": "#F8F8F8"
      }
    ]
  },
  {
    "id": "bb-1x4-14mm-pine",
    "name": "Baseboard BB1x4 (14 mm - 9/16\")",
    "category": "rodapie",
    "subcategory": "Pine Baseboard",
    "thickness": "14 mm x 85 mm",
    "size": "3 1/2\" x 1/2\" x 16 ft PINE",
    "stripLengthFeet": 16,
    "basePrice": 0.79,
    "priceUnit": "linear_ft",
    "description": "Baseboard estándar 3 1/2\" en madera de pino blanco. Tiras de 16 ft.",
    "colors": [
      {
        "name": "White Primed",
        "code": "WP",
        "hex": "#F8F8F8"
      }
    ]
  },
  {
    "id": "bb-5180-14mm-pine",
    "name": "Baseboard BB5180 Colonial (14 mm)",
    "category": "rodapie",
    "subcategory": "Colonial Baseboard",
    "thickness": "14 mm x 133 mm",
    "size": "5 1/4\" x 9/16\" x 16 ft PINE",
    "stripLengthFeet": 16,
    "basePrice": 0.89,
    "priceUnit": "linear_ft",
    "description": "Perfil colonial clásico 5 1/4\" para acabados tradicionales. Tiras de 16 ft.",
    "colors": [
      {
        "name": "White Primed",
        "code": "WP",
        "hex": "#F8F8F8"
      }
    ]
  },
  {
    "id": "bb-1x6-18mm-heavy",
    "name": "Baseboard BB1x6 Heavy (18 mm)",
    "category": "rodapie",
    "subcategory": "Pine Baseboard",
    "thickness": "18 mm x 135 mm",
    "size": "5 1/2\" x 3/4\" x 16 ft PINE",
    "stripLengthFeet": 16,
    "basePrice": 1.15,
    "priceUnit": "linear_ft",
    "description": "Perfil robusto extra grueso de 18mm para mayor impacto visual. Tiras de 16 ft.",
    "colors": [
      {
        "name": "White Primed",
        "code": "WP",
        "hex": "#F8F8F8"
      }
    ]
  },
  {
    "id": "bb-618-curved",
    "name": "Baseboard BB618 Curved (14 mm)",
    "category": "rodapie",
    "subcategory": "Curved Baseboard",
    "thickness": "14 mm x 140 mm",
    "size": "5 1/2\" x 9/16\" x 16 ft",
    "stripLengthFeet": 16,
    "basePrice": 1.05,
    "priceUnit": "linear_ft",
    "description": "Perfil curvo moderno para remates elegantes. Tiras de 16 ft.",
    "colors": [
      {
        "name": "White Primed",
        "code": "WP",
        "hex": "#F8F8F8"
      }
    ]
  },
  {
    "id": "bb-quarter-round-pine-16",
    "name": "Quarter Round (Pine/MDF 16 ft)",
    "category": "rodapie",
    "subcategory": "Quarter Round",
    "thickness": "MDF / Pine",
    "size": "MDF 16 Ft Long",
    "stripLengthFeet": 16,
    "basePrice": 0.5,
    "priceUnit": "linear_ft",
    "description": "Moldura cuarto de bocel de 16 pies lineales para sellar juntas.",
    "colors": [
      {
        "name": "White Satin",
        "code": "WS",
        "hex": "#F8F8F8"
      }
    ]
  },
  {
    "id": "bb-quarter-round-mdf-8",
    "name": "Quarter Round MDF (8 ft)",
    "category": "rodapie",
    "subcategory": "Quarter Round",
    "thickness": "MDF",
    "size": "MDF 8 Ft Long",
    "stripLengthFeet": 8,
    "basePrice": 0.4,
    "priceUnit": "linear_ft",
    "description": "Cuarto de bocel MDF en tramos prácticos de 8 pies.",
    "colors": [
      {
        "name": "White Satin",
        "code": "WS",
        "hex": "#F8F8F8"
      }
    ]
  },
  {
    "id": "bb-quarter-round-eps-12",
    "name": "Quarter Round EPS Waterproof (12 ft)",
    "category": "rodapie",
    "subcategory": "Waterproof Quarter Round",
    "thickness": "15 mm x 15 mm",
    "size": "MDF/EPS 12 Ft Long WaterProof",
    "stripLengthFeet": 12,
    "basePrice": 0.6,
    "priceUnit": "linear_ft",
    "description": "100% impermeable, ideal para cocinas, baños y áreas húmedas.",
    "colors": [
      {
        "name": "White Satin",
        "code": "WS",
        "hex": "#F8F8F8"
      }
    ]
  },
  {
    "id": "bb-square-1x1-mdf-8",
    "name": "Square 1x1 MDF Waterproof (8 ft)",
    "category": "rodapie",
    "subcategory": "Square Trim",
    "thickness": "1\" x 1\"",
    "size": "MDF 8 Ft Long WaterProof",
    "stripLengthFeet": 8,
    "basePrice": 0.89,
    "priceUnit": "linear_ft",
    "description": "Perfil cuadrado minimalista impermeable 1x1 en tiras de 8 ft.",
    "colors": [
      {
        "name": "White Satin",
        "code": "WS",
        "hex": "#F8F8F8"
      }
    ]
  },
  {
    "id": "molding-cm-t-molding",
    "name": "CM T-Molding (Transición SPC)",
    "category": "perfiles",
    "subcategory": "Moldings",
    "thickness": "Matching SPC Commercial",
    "size": "94\" (2.40 m) - L 94 1/2\" W 1 3/4\" H 3/8\"",
    "basePrice": 30,
    "priceUnit": "piece",
    "description": "Perfil T de transición entre pisos del mismo nivel al tono exacto del SPC.",
    "colors": [
      {
        "name": "Al tono del piso seleccionado",
        "code": "MATCH",
        "hex": "#C7B28E"
      }
    ]
  },
  {
    "id": "molding-cm-reducer",
    "name": "CM Reducer (Reductor de Desnivel)",
    "category": "perfiles",
    "subcategory": "Moldings",
    "thickness": "Matching SPC Commercial",
    "size": "94\" (2.40 m) - L 94 1/2\" W 1 3/4\" H 3/8\"",
    "basePrice": 30,
    "priceUnit": "piece",
    "description": "Perfil reductor de nivel para unir piso SPC con alfombra o cerámica.",
    "colors": [
      {
        "name": "Al tono del piso seleccionado",
        "code": "MATCH",
        "hex": "#C7B28E"
      }
    ]
  },
  {
    "id": "molding-end-cap",
    "name": "End Cap / Terminal Cuadrado",
    "category": "perfiles",
    "subcategory": "Moldings",
    "thickness": "Matching SPC Commercial",
    "size": "94\" (2.40 m) - L 94 1/2\" W 1 3/4\" H 3/8\"",
    "basePrice": 30,
    "priceUnit": "piece",
    "description": "Perfil de remate contra puertas correderas, chimeneas y paredes.",
    "colors": [
      {
        "name": "Al tono del piso seleccionado",
        "code": "MATCH",
        "hex": "#C7B28E"
      }
    ]
  },
  {
    "id": "molding-aluminum-tmolding",
    "name": "Aluminum Moldings Laminate (T-Molding / End)",
    "category": "perfiles",
    "subcategory": "Aluminum Moldings",
    "thickness": "Aluminio Anodizado",
    "size": "W 1 3/4\" H 1/4\" L 78\"",
    "basePrice": 45,
    "priceUnit": "piece",
    "description": "Perfil de aluminio reforzado de 78\" para zonas de tráfico intenso.",
    "colors": [
      {
        "name": "Matte Silver",
        "code": "AL-SILVER",
        "hex": "#CCCCCC"
      },
      {
        "name": "Matte Black",
        "code": "AL-BLACK",
        "hex": "#1C1C1C"
      },
      {
        "name": "Brushed Brass",
        "code": "AL-BRASS",
        "hex": "#CBB279"
      }
    ]
  },
  {
    "id": "molding-profile-l-skirting",
    "name": "Profile L Skirting",
    "category": "perfiles",
    "subcategory": "Wall Profiles",
    "size": "Tira 2.40 m",
    "basePrice": 20,
    "priceUnit": "piece",
    "description": "Perfil en L para zócalos y paneles de pared.",
    "colors": []
  },
  {
    "id": "molding-profile-concave",
    "name": "Profile Concave",
    "category": "perfiles",
    "subcategory": "Wall Profiles",
    "size": "Tira 2.40 m",
    "basePrice": 20,
    "priceUnit": "piece",
    "description": "Perfil cóncavo de esquina interior para remate limpio.",
    "colors": []
  },
  {
    "id": "molding-profile-endcap-wall",
    "name": "Profile Mini End Cap / End Cap",
    "category": "perfiles",
    "subcategory": "Wall Profiles",
    "size": "Tira 2.40 m",
    "basePrice": 20,
    "priceUnit": "piece",
    "description": "Mini terminal para remate perimetral de revestimientos.",
    "colors": []
  },
  {
    "id": "steps-double-rounded",
    "name": "Escalón Double Rounded Step",
    "category": "escalones",
    "subcategory": "Stair Treads",
    "thickness": "5.5 mm / 6.0 mm / 8.0 mm (20-22 Mil)",
    "size": "12\" x 48\" (Largo de la tabla)",
    "basePrice": 19,
    "priceUnit": "piece",
    "description": "Peldaño con doble curvatura redondeada ergonómica al tono del SPC. Soporta contrahuella.",
    "colors": [
      {
        "name": "Al tono del piso seleccionado",
        "code": "MATCH",
        "hex": "#C7B28E"
      }
    ]
  },
  {
    "id": "steps-square-edge",
    "name": "Escalón Square Edge Step (Canto Recto)",
    "category": "escalones",
    "subcategory": "Stair Treads",
    "thickness": "5.5 mm / 6.0 mm / 8.0 mm (20-22 Mil)",
    "size": "12\" x 48\" (Largo de la tabla)",
    "basePrice": 19,
    "priceUnit": "piece",
    "description": "Peldaño de canto cuadrado moderno estilo flotante. Compatible con Riser Plank.",
    "colors": [
      {
        "name": "Al tono del piso seleccionado",
        "code": "MATCH",
        "hex": "#C7B28E"
      }
    ]
  },
  {
    "id": "steps-riser-plank",
    "name": "Contrahuella (Riser Plank White Laminate)",
    "category": "escalones",
    "subcategory": "Stair Risers",
    "size": "White Laminate Plank (Length of the plank)",
    "basePrice": 9,
    "priceUnit": "piece",
    "description": "Tabla vertical de contrahuella blanca laminada para acabado en contraste.",
    "colors": []
  },
  {
    "id": "underlayment-vapor-barrier",
    "name": "Plastic Vapor Barrier (Barrera de Vapor)",
    "category": "underlayment",
    "subcategory": "Underlayments",
    "size": "Poly Plastic Sheeting 6 Mils | 1,000 sqft / rollo",
    "basePrice": 65,
    "priceUnit": "unit",
    "description": "Rollo de polietileno de 6 Mils para protección contra humedad en losas de concreto.",
    "colors": []
  },
  {
    "id": "underlayment-ixpe-padding",
    "name": "Underlayment IXPE Padding Pat",
    "category": "underlayment",
    "subcategory": "Underlayments",
    "size": "IXPE 100 sqft / rollo | 2mm | 68 STC - 72 IIC",
    "basePrice": 22,
    "priceUnit": "unit",
    "description": "Manta acústica de alta densidad IXPE para reducción de ruido de impacto.",
    "colors": []
  },
  {
    "id": "wall-panels-indoor-wpc",
    "name": "WPC Indoor Wall Panels (9'5\")",
    "category": "wall_panels",
    "subcategory": "Indoor WPC",
    "badge": "INDOOR WPC",
    "size": "1\" x 6 5/8\" x 9'5\"",
    "basePrice": 17,
    "priceUnit": "unit",
    "description": "Wood Plastic Composite (WPC) para interior. Medidas: 1\" x 6 5/8\" x 9'5\" (113\"). Acabado ranurado elegante y resistente.",
    "colors": [
      {
        "name": "Desert",
        "code": "WPC-DESERT",
        "hex": "#C7BCA7"
      },
      {
        "name": "Gray",
        "code": "WPC-GRAY",
        "hex": "#8F9193"
      },
      {
        "name": "Dark",
        "code": "WPC-DARK",
        "hex": "#2B2D2F"
      },
      {
        "name": "Matte",
        "code": "WPC-MATTE",
        "hex": "#4D3A2F"
      },
      {
        "name": "Mocha",
        "code": "WPC-MOCHA",
        "hex": "#352520"
      }
    ]
  },
  {
    "id": "wall-panels-indoor-fluted",
    "name": "WPC Indoor Fluted Panels (16\")",
    "category": "wall_panels",
    "subcategory": "Indoor Fluted",
    "badge": "FLUTED WPC",
    "size": "1\" x 7\" x 16\"",
    "basePrice": 12,
    "priceUnit": "unit",
    "description": "Wood Plastic Composite (WPC) con diseño estriado acanalado. Medidas: 1\" x 7\" x 16\".",
    "colors": [
      {
        "name": "Ochre",
        "code": "WPC-OCHRE",
        "hex": "#A68758"
      },
      {
        "name": "Cocoa",
        "code": "WPC-COCOA",
        "hex": "#6B543B"
      },
      {
        "name": "Ashwood",
        "code": "WPC-ASHWOOD",
        "hex": "#40443D"
      }
    ]
  },
  {
    "id": "acoustic-wall-panel",
    "name": "Wooden Slat Acoustic Panels",
    "category": "wall_panels",
    "subcategory": "Acoustic Panels",
    "badge": "ACOUSTIC SLAT",
    "size": "1\" x 2' 4\" x 7' 8\" / 1\" x 7\" x 16\"",
    "basePrice": 35,
    "priceUnit": "unit",
    "description": "Paneles fonoabsorbentes con listones de madera y fieltro acústico negro de alta densidad.",
    "colors": [
      {
        "name": "Sandalwood (1\" x 2' 4\" x 7' 8\")",
        "code": "AC-SANDAL",
        "hex": "#A86C32"
      },
      {
        "name": "EchoWood (1\" x 7\" x 16\")",
        "code": "AC-ECHO",
        "hex": "#5C4B37"
      }
    ]
  },
  {
    "id": "wall-panels-outdoor-composite",
    "name": "WPC Outdoor Exterior Panels",
    "category": "wall_panels",
    "subcategory": "Outdoor WPC",
    "badge": "OUTDOOR",
    "size": "8-1/2\" x 114\" x 26 mm",
    "basePrice": 28,
    "priceUnit": "unit",
    "description": "WPC Exterior Composite para exteriores y fachadas. Medidas: 8-1/2\" x 114\" x 26 mm. Resistente a intemperie, rayos UV y humedad.",
    "colors": [
      {
        "name": "Onyx",
        "code": "OUT-ONYX",
        "hex": "#222222"
      },
      {
        "name": "Chestnut",
        "code": "OUT-CHESTNUT",
        "hex": "#7C4C2B"
      },
      {
        "name": "Sienna",
        "code": "OUT-SIENNA",
        "hex": "#A55E2B"
      }
    ]
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  salespersonName: 'Januel Design',
  salespersonPhone: '+1 (786) 555-0199',
  defaultValidDays: 15,
  companyAddress: 'Miami, FL',
  companyPhone: '+1 (786) 555-0100',
  companyEmail: 'sales@quicksurfaces.com',
  companyLogoUrl: 'https://raw.githubusercontent.com/JanuelDesign/quicksurfacesplanks/refs/heads/main/public/images/logo.png',
  taxRate: 0.07,
  deliveryFee: 60.00
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Constructora Horizon LLC',
    clientType: 'Contractor',
    phone: '+1 (786) 450-9921',
    email: 'contacto@constructorahorizon.com',
    company: 'Horizon Contractors',
    address: '742 Evergreen Terrace, Miami FL',
    notes: 'Cliente frecuente de colecciones SPC y molduras',
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'cli-002',
    name: 'Artisan Floor Installations',
    clientType: 'Installer',
    phone: '+1 (305) 882-1433',
    email: 'artisan.floors@gmail.com',
    company: 'Artisan Floors',
    address: '1200 Brickell Ave, Miami FL',
    notes: 'Instalador certificado de QuickSurfaces',
    createdAt: '2026-02-14T14:30:00.000Z'
  },
  {
    id: 'cli-003',
    name: 'Valeria Mendoza',
    clientType: 'Designer',
    phone: '+1 (954) 731-5088',
    email: 'valeria@mendozainteriors.com',
    company: 'Mendoza Interior Design',
    address: '880 Ocean Drive, Miami Beach FL',
    notes: 'Diseñadora de interiores residencial y comercial',
    createdAt: '2026-02-28T09:15:00.000Z'
  }
];
