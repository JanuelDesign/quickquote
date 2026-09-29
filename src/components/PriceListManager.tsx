import React, { useState, useRef, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { 
  Settings2, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  RotateCcw, 
  MoreHorizontal, 
  Check, 
  X, 
  Palette, 
  AlertCircle,
  Layers,
  ChevronDown
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { ProductEditModal } from './ProductEditModal';
import { saveProductToDb, deleteProductFromDb, batchSaveProductsToDb } from '../services/firebaseDb';
import { formatCurrency } from '../utils/calculations';

interface PriceListManagerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (newProducts: Product[]) => void;
}

export const PriceListManager: React.FC<PriceListManagerProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Full product and variants edit modal state
  const [modalEditingProduct, setModalEditingProduct] = useState<Product | null>(null);
  
  // Quick Add new product state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('piso');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newThickness, setNewThickness] = useState('');
  const [newBasePrice, setNewBasePrice] = useState<number>(1.49);
  const [newPriceUnit, setNewPriceUnit] = useState<Product['priceUnit']>('sqft');
  const [newSqftBox, setNewSqftBox] = useState<number>(24.26);
  const [newStripLength, setNewStripLength] = useState<number>(16);
  const [newSize, setNewSize] = useState('');

  // Dropdown menu state for "⋯ Más opciones"
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Close more menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  if (!isOpen) return null;

  // Filter products by category and search term
  const filteredProducts = products.filter((p) => {
    const matchesCat = filterCategory === 'all' || p.category === filterCategory;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesCat;

    const matchesSearch = 
      p.name.toLowerCase().includes(term) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(term)) ||
      (p.thickness && p.thickness.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.colors && p.colors.some(c => c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term)));

    return matchesCat && matchesSearch;
  });

  // Handle Quick Add Product
  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      subcategory: newSubcategory.trim() || undefined,
      thickness: newThickness.trim() || undefined,
      size: newSize.trim() || undefined,
      basePrice: Number(newBasePrice) || 0,
      priceUnit: newPriceUnit,
      sqftPerBox: newCategory === 'piso' ? Number(newSqftBox) || 20 : undefined,
      stripLengthFeet: newCategory === 'rodapie' ? Number(newStripLength) || 16 : undefined,
      colors: []
    };

    try {
      await saveProductToDb(newProd);
      const updated = [newProd, ...products];
      onUpdateProducts(updated);
      showFeedback('success', `Producto "${newProd.name}" agregado con éxito.`);
      setIsAddingNew(false);
      setNewName('');
      setNewSubcategory('');
      setNewThickness('');
      setNewSize('');
    } catch (err) {
      console.error('Error guardando producto:', err);
      showFeedback('error', 'Error al sincronizar con Firestore.');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${productName}" del catálogo permanentemente?`)) {
      return;
    }

    try {
      await deleteProductFromDb(productId);
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
      showFeedback('success', `"${productName}" eliminado del catálogo.`);
    } catch (err) {
      console.error('Error eliminando producto:', err);
      showFeedback('error', 'Error al eliminar en Firestore.');
    }
  };

  // Handle Reset to Default Products
  const handleResetDefaults = async () => {
    if (!window.confirm('¿Restablecer todo el catálogo a los productos iniciales de fábrica? Esto reemplazará los productos actuales en Firestore.')) {
      return;
    }

    try {
      await batchSaveProductsToDb(INITIAL_PRODUCTS);
      onUpdateProducts(INITIAL_PRODUCTS);
      showFeedback('success', 'Catálogo restablecido a valores iniciales de fábrica.');
      setIsMoreMenuOpen(false);
    } catch (err) {
      console.error('Error restableciendo catálogo:', err);
      showFeedback('error', 'Error al restablecer en Firestore.');
    }
  };

  // CSV Helpers
  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // 1. Download Empty CSV Template
  const handleDownloadTemplate = () => {
    setIsMoreMenuOpen(false);
    const headers = [
      'id',
      'name',
      'category',
      'subcategory',
      'thickness',
      'wearLayer',
      'size',
      'basePrice',
      'priceUnit',
      'sqftPerBox',
      'stripLengthFeet',
      'isStock',
      'badge',
      'description'
    ];

    const sampleRow1 = [
      'piso-ejemplo-01',
      'Piso SPC Pulse Select 6.5mm',
      'piso',
      'Piso SPC',
      '6.5mm (5mm + 1.5mm pad)',
      '20 mil (0.5mm)',
      '9" x 60"',
      '1.99',
      'sqft',
      '22.45',
      '',
      'true',
      'BEST SELLER',
      'Piso SPC resistente al agua con capa de uso comercial'
    ];

    const sampleRow2 = [
      'rodapie-ejemplo-02',
      'Rodapié Flat Modern 5-1/4',
      'rodapie',
      'Molding & Trim',
      '9/16" x 5-1/4"',
      '',
      '16 ft',
      '1.35',
      'linear_ft',
      '',
      '16',
      'true',
      '',
      'Tira de 16 pies con acabado listo para pintar'
    ];

    const csvContent = [
      headers.join(','),
      sampleRow1.map(escapeCsv).join(','),
      sampleRow2.map(escapeCsv).join(',')
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_productos_quicksurfaces.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback('success', 'Plantilla CSV descargada.');
  };

  // 2. Export Catalog to CSV
  const handleExportCSV = () => {
    setIsMoreMenuOpen(false);
    const headers = [
      'id',
      'name',
      'category',
      'subcategory',
      'thickness',
      'wearLayer',
      'size',
      'basePrice',
      'priceUnit',
      'sqftPerBox',
      'stripLengthFeet',
      'isStock',
      'badge',
      'colors_count',
      'description'
    ];

    const rows = products.map((p) => [
      p.id,
      p.name,
      p.category,
      p.subcategory || '',
      p.thickness || '',
      p.wearLayer || '',
      p.size || '',
      p.basePrice,
      p.priceUnit,
      p.sqftPerBox || '',
      p.stripLengthFeet || '',
      p.isStock !== false ? 'true' : 'false',
      p.badge || '',
      p.colors ? p.colors.length : 0,
      p.description || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map(escapeCsv).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `catalogo_quicksurfaces_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback('success', `${products.length} productos exportados a CSV.`);
  };

  // 3. Import Products from CSV
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('El archivo CSV está vacío.');

        // Parse CSV lines respecting quotes
        const parseCsvLines = (csvText: string): string[][] => {
          const lines: string[][] = [];
          const rows = csvText.split(/\r\n|\n|\r/);
          for (const row of rows) {
            if (!row.trim()) continue;
            const values: string[] = [];
            let inQuotes = false;
            let current = '';
            for (let i = 0; i < row.length; i++) {
              const char = row[i];
              if (char === '"') {
                if (inQuotes && row[i + 1] === '"') {
                  current += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            lines.push(values);
          }
          return lines;
        };

        const parsed = parseCsvLines(text);
        if (parsed.length < 2) {
          throw new Error('El CSV debe incluir la fila de encabezados y al menos un producto.');
        }

        const headers = parsed[0].map(h => h.toLowerCase().trim());
        const idIdx = headers.indexOf('id');
        const nameIdx = headers.indexOf('name');
        const catIdx = headers.indexOf('category');
        const priceIdx = headers.indexOf('baseprice') !== -1 ? headers.indexOf('baseprice') : headers.indexOf('price');
        const unitIdx = headers.indexOf('priceunit');
        const sqftIdx = headers.indexOf('sqftperbox');
        const stripIdx = headers.indexOf('striplengthfeet');
        const thickIdx = headers.indexOf('thickness');
        const sizeIdx = headers.indexOf('size');
        const badgeIdx = headers.indexOf('badge');
        const subcatIdx = headers.indexOf('subcategory');

        if (nameIdx === -1) {
          throw new Error('No se encontró la columna "name" en el archivo CSV.');
        }

        const importedProducts: Product[] = [];

        for (let i = 1; i < parsed.length; i++) {
          const row = parsed[i];
          const name = row[nameIdx];
          if (!name) continue;

          const existing = products.find(p => (idIdx !== -1 && p.id === row[idIdx]) || p.name.toLowerCase() === name.toLowerCase());

          const categoryRaw = catIdx !== -1 ? row[catIdx]?.toLowerCase() : 'piso';
          const validCategory: ProductCategory = 
            categoryRaw === 'rodapie' || categoryRaw === 'perfiles' || categoryRaw === 'escalones' || 
            categoryRaw === 'wall_panels' || categoryRaw === 'underlayment' || categoryRaw === 'otros' 
              ? categoryRaw : 'piso';

          const prod: Product = {
            id: (idIdx !== -1 && row[idIdx]) ? row[idIdx] : (existing?.id || `prod-csv-${Date.now()}-${i}`),
            name: name,
            category: validCategory,
            subcategory: (subcatIdx !== -1 && row[subcatIdx]) || existing?.subcategory,
            thickness: (thickIdx !== -1 && row[thickIdx]) || existing?.thickness,
            size: (sizeIdx !== -1 && row[sizeIdx]) || existing?.size,
            basePrice: priceIdx !== -1 && !isNaN(parseFloat(row[priceIdx])) ? parseFloat(row[priceIdx]) : (existing?.basePrice || 1.49),
            priceUnit: (unitIdx !== -1 && row[unitIdx] as any) || existing?.priceUnit || 'sqft',
            sqftPerBox: sqftIdx !== -1 && !isNaN(parseFloat(row[sqftIdx])) ? parseFloat(row[sqftIdx]) : existing?.sqftPerBox,
            stripLengthFeet: stripIdx !== -1 && !isNaN(parseFloat(row[stripIdx])) ? parseFloat(row[stripIdx]) : existing?.stripLengthFeet,
            badge: (badgeIdx !== -1 && row[badgeIdx]) || existing?.badge,
            colors: existing?.colors || []
          };

          importedProducts.push(prod);
        }

        if (importedProducts.length === 0) {
          throw new Error('No se pudieron extraer productos válidos del archivo CSV.');
        }

        // Merge imported products with current catalog
        const map = new Map<string, Product>();
        for (const p of products) {
          map.set(p.id, p);
        }
        for (const imp of importedProducts) {
          map.set(imp.id, imp);
        }

        const merged = Array.from(map.values());
        await batchSaveProductsToDb(merged);
        onUpdateProducts(merged);
        showFeedback('success', `✓ ${importedProducts.length} productos importados y sincronizados con Firestore.`);
      } catch (err: any) {
        console.error('Error importando CSV:', err);
        showFeedback('error', err?.message || 'Error al procesar el archivo CSV.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setIsMoreMenuOpen(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-[#E4E2DA] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E2DA] bg-[#181818] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center font-bold shrink-0">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Catálogo & Lista de Precios
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF8407] text-white uppercase tracking-wider">
                  CLOUD FIRESTORE
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {products.length} productos sincronizados en tiempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className={`px-5 py-2.5 text-xs font-bold flex items-center gap-2 transition-all ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' 
              : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}>
            {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Actions & Filters Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E4E2DA] bg-[#FAFAFA] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shrink-0">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9C9A90] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, acabado, espesor o código..."
                className="w-full text-xs bg-white border border-[#E4E2DA] focus:border-[#FF8407] rounded-xl pl-9 pr-3.5 py-2.5 outline-hidden font-medium text-[#181818]"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-white border border-[#E4E2DA] focus:border-[#FF8407] rounded-xl px-3 py-2.5 outline-hidden font-bold text-[#181818] cursor-pointer shrink-0"
            >
              <option value="all">Todas las Categorías ({products.length})</option>
              <option value="piso">Pisos ({products.filter(p => p.category === 'piso').length})</option>
              <option value="rodapie">Rodapiés ({products.filter(p => p.category === 'rodapie').length})</option>
              <option value="perfiles">Perfiles ({products.filter(p => p.category === 'perfiles').length})</option>
              <option value="escalones">Escalones ({products.filter(p => p.category === 'escalones').length})</option>
              <option value="wall_panels">Wall Panels ({products.filter(p => p.category === 'wall_panels').length})</option>
              <option value="underlayment">Underlayment ({products.filter(p => p.category === 'underlayment').length})</option>
              <option value="otros">Otros / Custom ({products.filter(p => p.category === 'otros').length})</option>
            </select>
          </div>

          {/* Buttons: + Agregar Producto & ⋯ Más opciones */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Primary Action Button */}
            <button
              type="button"
              id="btn-open-add-product"
              onClick={() => setIsAddingNew(prev => !prev)}
              className="px-4 py-2.5 rounded-xl bg-[#FF8407] hover:bg-[#E07300] active:scale-95 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingNew ? 'Cancelar' : '+ Agregar Producto'}</span>
            </button>

            {/* Hidden CSV File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".csv" 
              onChange={handleFileChange} 
              className="hidden" 
            />

            {/* Secondary Options Dropdown Menu (⋯ Más opciones) */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                id="btn-price-manager-more"
                onClick={() => setIsMoreMenuOpen(prev => !prev)}
                className="h-10 px-3 rounded-xl border border-[#E4E2DA] bg-white hover:bg-[#F2F1EC] text-[#181818] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Más opciones de respaldo y CSV"
              >
                <MoreHorizontal className="w-4 h-4 text-[#6B6A63]" />
                <span className="hidden sm:inline">Más opciones</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9C9A90]" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 top-11 w-64 bg-white border border-[#E4E2DA] rounded-xl shadow-xl p-2 z-50 text-xs text-[#181818] space-y-1 animate-in fade-in duration-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] px-2.5 py-1 block">
                    Carga Masiva y Respaldo
                  </span>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F2F1EC] text-left flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#FF8407]" />
                    <div>
                      <span className="font-bold block leading-tight">Descargar Plantilla CSV</span>
                      <span className="text-[10px] text-[#6B6A63]">Formato listo para Excel/Sheets</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F2F1EC] text-left flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold block leading-tight">Exportar Catálogo a CSV</span>
                      <span className="text-[10px] text-[#6B6A63]">Descarga todos los {products.length} productos</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F2F1EC] text-left flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold block leading-tight">Importar Productos desde CSV</span>
                      <span className="text-[10px] text-[#6B6A63]">Carga o actualiza masivamente</span>
                    </div>
                  </button>

                  <div className="pt-1 border-t border-[#E4E2DA] mt-1">
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="w-full px-2.5 py-2 rounded-lg hover:bg-red-50 text-left flex items-center gap-2.5 font-medium text-red-600 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-red-500" />
                      <span>Restablecer catálogo inicial</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F9F9F8]">
          {/* Quick Add Product Collapsible Form */}
          {isAddingNew && (
            <form onSubmit={handleAddNewProduct} className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DA]">
                <span className="text-xs font-bold text-[#181818] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#FF8407]" />
                  Agregar Nuevo Producto al Catálogo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pulse Select 6.5mm"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-medium text-[#181818] focus:outline-hidden focus:border-[#FF8407]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    Categoría *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      setNewCategory(cat);
                      if (cat === 'piso') setNewPriceUnit('sqft');
                      else if (cat === 'rodapie') setNewPriceUnit('linear_ft');
                      else setNewPriceUnit('piece');
                    }}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-bold text-[#181818]"
                  >
                    <option value="piso">Piso</option>
                    <option value="rodapie">Rodapié</option>
                    <option value="perfiles">Perfiles / Trims</option>
                    <option value="escalones">Escalones</option>
                    <option value="wall_panels">Wall Panels</option>
                    <option value="underlayment">Underlayment</option>
                    <option value="otros">Otros / Servicios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    Subcategoría / Colección
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. SPC Flooring, 5-1/4, etc."
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-medium text-[#181818]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    Precio Base ($) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-bold font-mono text-[#181818]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    Unidad de Cobro *
                  </label>
                  <select
                    value={newPriceUnit}
                    onChange={(e) => setNewPriceUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-semibold text-[#181818]"
                  >
                    <option value="sqft">por sqft</option>
                    <option value="linear_ft">por pie lineal (LF)</option>
                    <option value="piece">por pieza / peldaño</option>
                    <option value="box">por caja</option>
                    <option value="strip">por tira</option>
                    <option value="unit">por unidad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    Espesor / Grosor
                  </label>
                  <input
                    type="text"
                    placeholder='Ej. 6.5mm, 9/16", etc.'
                    value={newThickness}
                    onChange={(e) => setNewThickness(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-medium text-[#181818]"
                  />
                </div>

                {newCategory === 'piso' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                      SqFt por Caja
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newSqftBox}
                      onChange={(e) => setNewSqftBox(parseFloat(e.target.value) || 20)}
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-mono font-bold text-[#181818]"
                    />
                  </div>
                )}

                {newCategory === 'rodapie' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                      Longitud Tira (Pies / FT)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={newStripLength}
                      onChange={(e) => setNewStripLength(parseFloat(e.target.value) || 16)}
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-mono font-bold text-[#181818]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    Dimensiones / Tamaño
                  </label>
                  <input
                    type="text"
                    placeholder='Ej. 9" x 60", 5-1/4, etc.'
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-medium text-[#181818]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E4E2DA] text-xs font-semibold text-[#6B6A63] hover:bg-[#F2F1EC] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#FF8407] hover:bg-[#E07300] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Producto</span>
                </button>
              </div>
            </form>
          )}

          {/* VERTICAL STACKED CARDS (Replacing old horizontal-scroll table) */}
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#E4E2DA] text-center space-y-2">
                <p className="text-xs font-bold text-[#181818]">
                  No se encontraron productos con los filtros actuales.
                </p>
                <p className="text-[11px] text-[#6B6A63]">
                  Intenta buscar con otros términos o selecciona "Todas las Categorías".
                </p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const colorCount = p.colors?.length || 0;
                // Correct singular/plural: "1 color" vs "X colores"
                const colorLabel = colorCount === 1 ? '1 color' : `${colorCount} colores`;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-[#E4E2DA] hover:border-[#181818] p-4 shadow-2xs transition-all space-y-3"
                  >
                    {/* Top Row: Category Badges, Name and Base Price */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold uppercase text-[10px] bg-[#181818] text-[#FF8407] px-2 py-0.5 rounded tracking-wider">
                            {p.category}
                          </span>
                          {p.subcategory && (
                            <span className="text-[10px] font-semibold text-zinc-600 bg-[#F2F1EC] px-1.5 py-0.5 rounded border border-[#E4E2DA]">
                              {p.subcategory}
                            </span>
                          )}
                          {p.badge && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-[#181818] leading-tight">
                          {p.name}
                        </h4>
                      </div>

                      {/* Base Price formatted */}
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-sm sm:text-base font-black font-mono text-[#FF8407]">
                          {formatCurrency(p.basePrice)}
                        </span>
                        <span className="text-[11px] text-[#6B6A63] block font-mono">
                          / {p.priceUnit || 'unidad'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Grid: Specifications, SqFt/Tira, Colores / Acabados */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-2 border-t border-zinc-100 bg-[#FAFAFA] p-3 rounded-lg">
                      {/* Specs */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#9C9A90] block">Especificaciones</span>
                        <span className="font-semibold text-[#181818] block truncate">{p.thickness || '—'}</span>
                        <span className="text-[10px] text-[#6B6A63] block truncate">{p.size || p.wearLayer || '—'}</span>
                      </div>

                      {/* Coverage / Yield */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#9C9A90] block">Rendimiento</span>
                        <span className="font-mono font-semibold text-[#181818] block truncate">
                          {p.sqftPerBox ? `${p.sqftPerBox} sqft/caja` : p.stripLengthFeet ? `Tira ${p.stripLengthFeet} ft` : 'Por unidad'}
                        </span>
                      </div>

                      {/* Colors / Variants (1 color vs X colores) */}
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-[#9C9A90] block">Colores / Acabados</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <button
                            type="button"
                            onClick={() => setModalEditingProduct(p)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF8407] hover:underline cursor-pointer"
                          >
                            <Palette className="w-3 h-3" />
                            <span>{colorCount > 0 ? colorLabel : 'Sin variantes'}</span>
                          </button>

                          {colorCount > 0 && (
                            <div className="flex items-center gap-0.5 ml-1">
                              {p.colors!.slice(0, 3).map((c, i) => (
                                <span
                                  key={i}
                                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block"
                                  style={{ backgroundColor: c.hex || '#CCC' }}
                                  title={`${c.name} (${c.code})`}
                                />
                              ))}
                              {colorCount > 3 && (
                                <span className="text-[9px] text-[#9C9A90] font-mono">+{colorCount - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions for this card */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => setModalEditingProduct(p)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#181818] hover:bg-[#F2F1EC] border border-[#E4E2DA] transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                        title="Editar especificaciones y variantes de color"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#FF8407]" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                        title="Eliminar producto del catálogo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E4E2DA] bg-white flex items-center justify-between text-xs">
          <span className="text-[#9C9A90] text-[11px]">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#181818] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal for editing product details and colors */}
      {modalEditingProduct && (
        <ProductEditModal
          isOpen={!!modalEditingProduct}
          onClose={() => setModalEditingProduct(null)}
          product={modalEditingProduct}
          onSave={async (updated) => {
            await saveProductToDb(updated);
            const newCatalog = products.map((p) => (p.id === updated.id ? updated : p));
            onUpdateProducts(newCatalog);
            setModalEditingProduct(null);
            showFeedback('success', `Producto "${updated.name}" actualizado.`);
          }}
          onDeleteProduct={async (prodId, prodName) => {
            await handleDeleteProduct(prodId, prodName);
            setModalEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};
