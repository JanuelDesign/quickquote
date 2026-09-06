import React, { useState } from 'react';
import { Product, ProductCategory } from '../types';
import { 
  Settings2, 
  Table, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Plus, 
  Edit3, 
  Save, 
  RotateCcw, 
  Search, 
  Check, 
  X, 
  Copy, 
  Info,
  RefreshCw,
  Link as LinkIcon
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { 
  generateProductsTSV, 
  generateServicesTSV, 
  copyTextToClipboard,
  fetchGoogleSheetsCatalog,
  parseProductsFromText
} from '../utils/tsvExporter';

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
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'table' | 'sheets-guide' | 'json-csv'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Edit row form state
  const [editBasePrice, setEditBasePrice] = useState<number>(0);
  const [editSqftBox, setEditSqftBox] = useState<number>(0);
  const [editName, setEditName] = useState<string>('');

  // JSON/CSV state
  const [jsonText, setJsonText] = useState(JSON.stringify(products, null, 2));
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [copiedTabla1, setCopiedTabla1] = useState(false);
  const [copiedTabla2, setCopiedTabla2] = useState(false);
  const [previewTsvType, setPreviewTsvType] = useState<'tabla1' | 'tabla2' | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Google Sheets live sync state
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('qs_google_sheet_url') || '');
  const [sheetTabName, setSheetTabName] = useState(() => localStorage.getItem('qs_google_sheet_tab_name') || '');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => localStorage.getItem('qs_google_sheet_autosync') !== 'false');
  const [lastSyncTime, setLastSyncTime] = useState(() => localStorage.getItem('qs_google_sheet_last_sync') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedTsvText, setPastedTsvText] = useState('');

  // New product form
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState<ProductCategory>('piso');
  const [newName, setNewName] = useState('');
  const [newThickness, setNewThickness] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newSqftBox, setNewSqftBox] = useState<number>(20);
  const [newBasePrice, setNewBasePrice] = useState<number>(1.99);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.thickness && p.thickness.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCat = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleStartEdit = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditBasePrice(prod.basePrice);
    setEditSqftBox(prod.sqftPerBox || 0);
    setEditName(prod.name);
  };

  const handleSaveEdit = (prodId: string) => {
    const updated = products.map(p => {
      if (p.id === prodId) {
        return {
          ...p,
          name: editName || p.name,
          basePrice: editBasePrice,
          sqftPerBox: editSqftBox > 0 ? editSqftBox : p.sqftPerBox
        };
      }
      return p;
    });

    onUpdateProducts(updated);
    setEditingProductId(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Estás seguro de restablecer todos los precios al catálogo base inicial?')) {
      onUpdateProducts(INITIAL_PRODUCTS);
      setJsonText(JSON.stringify(INITIAL_PRODUCTS, null, 2));
    }
  };

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newBasePrice <= 0) return;

    const newProd: Product = {
      id: `custom-prod-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      thickness: newThickness || undefined,
      size: newSize || undefined,
      sqftPerBox: newCategory === 'piso' ? newSqftBox : undefined,
      stripLengthFeet: newCategory === 'rodapie' ? 16 : undefined,
      basePrice: newBasePrice,
      priceUnit: newCategory === 'piso' ? 'sqft' : newCategory === 'rodapie' ? 'linear_ft' : 'piece',
      isCustom: true
    };

    const updated = [...products, newProd];
    onUpdateProducts(updated);
    setIsAddingNew(false);
    setNewName('');
    setNewThickness('');
    setNewSize('');
  };

  const handleApplyJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdateProducts(parsed);
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => setImportSuccess(false), 2500);
      } else {
        setImportError('El formato debe ser un arreglo de productos válido.');
      }
    } catch (e) {
      setImportError('JSON inválido. Revisa la sintaxis de comas y comillas.');
    }
  };

  const copyGoogleSheetsHeader = () => {
    const header = "id\tname\tcategory\tthickness\twear_layer\tplank_size\tsqft_box\tplanks_box\tprice_client\tprice_dealer\tstrip_length\tcolors_list";
    navigator.clipboard.writeText(header);
    setCopiedGuide(true);
    setTimeout(() => setCopiedGuide(false), 2000);
  };

  const handleCopyTabla1 = async () => {
    const tsv = generateProductsTSV(products);
    await copyTextToClipboard(tsv);
    setCopiedTabla1(true);
    setTimeout(() => setCopiedTabla1(false), 2500);
  };

  const handleCopyTabla2 = async () => {
    const tsv = generateServicesTSV();
    await copyTextToClipboard(tsv);
    setCopiedTabla2(true);
    setTimeout(() => setCopiedTabla2(false), 2500);
  };

  const handleSyncGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      setSyncFeedback({
        success: false,
        message: 'Por favor escribe o pega el enlace de tu Google Sheet (ej. https://docs.google.com/spreadsheets/d/.../edit)'
      });
      return;
    }
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      localStorage.setItem('qs_google_sheet_url', sheetUrl.trim());
      localStorage.setItem('qs_google_sheet_tab_name', sheetTabName.trim());
      localStorage.setItem('qs_google_sheet_autosync', autoSyncEnabled ? 'true' : 'false');

      const res = await fetchGoogleSheetsCatalog(sheetUrl.trim(), products, sheetTabName.trim() || undefined);
      onUpdateProducts(res.updatedProducts);

      const now = new Date();
      const nowStr = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${now.toLocaleDateString()}`;
      localStorage.setItem('qs_google_sheet_last_sync', nowStr);
      setLastSyncTime(nowStr);

      setSyncFeedback({
        success: true,
        message: `¡Sincronización exitosa! Se actualizaron precios y datos de ${res.rowCount} filas desde tu Google Sheet.`
      });
    } catch (err: any) {
      setSyncFeedback({
        success: false,
        message: err.message || 'No se pudo leer el archivo. Asegúrate de que el documento tenga acceso público ("Cualquier persona con el enlace puede ver") o esté publicado en la Web.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApplyPastedSheetData = () => {
    if (!pastedTsvText.trim()) return;
    try {
      const res = parseProductsFromText(pastedTsvText, products);
      onUpdateProducts(res.updatedProducts);
      setSyncFeedback({
        success: true,
        message: `¡Actualizado con éxito! Se procesaron ${res.rowCount} filas copiadas desde tu hoja de cálculo.`
      });
      setPastedTsvText('');
      setShowPasteBox(false);
    } catch (err: any) {
      setSyncFeedback({
        success: false,
        message: err.message || 'Error al procesar el texto pegado. Verifica que incluya la fila de encabezados.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl w-full max-w-4xl shadow-2xl border border-[#E5E5E5] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E5E5] bg-black text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Administrador de Lista de Precios
              </h2>
              <p className="text-[11px] text-[#8C8C8C]">
                Edita precios base de fábrica, agrega modelos o sincroniza datos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-zinc-800 text-[#8C8C8C] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-3 bg-[#F9F9F9] border-b border-[#E5E5E5] flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
              activeTab === 'table'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:border-black border border-[#E5E5E5]'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-[#FF8407]" />
            <span>Tabla de Precios ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets-guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
              activeTab === 'sheets-guide'
                ? 'bg-[#FF8407] text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:border-black border border-[#E5E5E5]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Guía Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('json-csv')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
              activeTab === 'json-csv'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:border-black border border-[#E5E5E5]'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#FF8407]" />
            <span>Importar / Exportar JSON</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
            title="Restaurar a los precios iniciales de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: EDITABLE TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              {/* Filter and search bar */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre, espesor, colección..."
                      className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg pl-9 pr-3 py-2 outline-none font-medium"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-xs bg-white border border-[#E5E5E5] rounded-lg px-2.5 py-2 outline-none font-bold"
                  >
                    <option value="all">Todas ({products.length})</option>
                    <option value="piso">Pisos</option>
                    <option value="rodapie">Rodapiés</option>
                    <option value="perfiles">Perfiles</option>
                    <option value="escalones">Escalones</option>
                    <option value="wall_panels">Wall Panels</option>
                    <option value="underlayment">Underlayments</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingNew(!isAddingNew)}
                  className="px-3.5 py-2 rounded-lg bg-[#FF8407] text-white text-xs font-bold hover:bg-[#E07300] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar Producto</span>
                </button>
              </div>

              {/* Add New Product Form */}
              {isAddingNew && (
                <form onSubmit={handleCreateNewProduct} className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-3">
                  <span className="text-xs font-bold text-black uppercase tracking-wider block">
                    Registrar Nuevo Producto al Catálogo
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">Categoría</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                        className="w-full text-xs bg-white border border-[#E5E5E5] rounded-lg p-2"
                      >
                        <option value="piso">Piso</option>
                        <option value="rodapie">Rodapié</option>
                        <option value="perfiles">Perfiles</option>
                        <option value="escalones">Escalones</option>
                        <option value="wall_panels">Wall Panels</option>
                        <option value="underlayment">Underlayments</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">Nombre del Producto</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ej. Pulse Ultra 12mm..."
                        className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                        Precio Base ($)
                      </label>
                      <input
                        type="number"
                        required
                        min="0.1"
                        step="0.01"
                        value={newBasePrice}
                        onChange={(e) => setNewBasePrice(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold font-mono bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">Espesor</label>
                      <input
                        type="text"
                        value={newThickness}
                        onChange={(e) => setNewThickness(e.target.value)}
                        placeholder="Ej. 6.5 mm"
                        className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">Medida / Formato</label>
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        placeholder='Ej. 9" x 60"'
                        className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2"
                      />
                    </div>

                    {newCategory === 'piso' && (
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">SqFt por Caja</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newSqftBox}
                          onChange={(e) => setNewSqftBox(parseFloat(e.target.value) || 20)}
                          className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-lg cursor-pointer uppercase tracking-wider"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#FF8407] text-white text-xs font-bold rounded-lg hover:bg-[#E07300] cursor-pointer uppercase tracking-wider"
                    >
                      Guardar en Catálogo
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table */}
              <div className="overflow-x-auto border border-[#E5E5E5] rounded-xl shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">Categoría</th>
                      <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">Nombre del Producto</th>
                      <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">Especificaciones</th>
                      <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider">SqFt / Tira</th>
                      <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider text-right">Precio Base</th>
                      <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {filteredProducts.map((p, idx) => {
                      const isEditing = editingProductId === p.id;

                      return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white hover:bg-zinc-50' : 'bg-[#FAFAFA] hover:bg-zinc-50'}>
                          <td className="p-2.5">
                            <span className="font-bold uppercase text-[10px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                              {p.category}
                            </span>
                          </td>

                          <td className="p-2.5 font-semibold text-black">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full text-xs font-bold border border-[#FF8407] rounded px-1.5 py-0.5 bg-white"
                              />
                            ) : (
                              <div>
                                <p className="font-bold">{p.name}</p>
                                {p.subcategory && <p className="text-[10px] text-[#8C8C8C]">{p.subcategory}</p>}
                              </div>
                            )}
                          </td>

                          <td className="p-2.5 text-zinc-600">
                            <span className="text-[11px] block">{p.thickness || '—'}</span>
                            <span className="text-[10px] text-[#8C8C8C]">{p.size || '—'}</span>
                          </td>

                          <td className="p-2.5 text-zinc-700 font-mono">
                            {isEditing && p.category === 'piso' ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editSqftBox}
                                onChange={(e) => setEditSqftBox(parseFloat(e.target.value) || 0)}
                                className="w-20 text-xs font-bold border border-[#FF8407] rounded px-1.5 py-0.5 bg-white"
                              />
                            ) : p.sqftPerBox ? (
                              `${p.sqftPerBox} sqft/caja`
                            ) : p.stripLengthFeet ? (
                              `Tira ${p.stripLengthFeet} ft`
                            ) : (
                              'Unidad'
                            )}
                          </td>

                          <td className="p-2.5 text-right font-mono font-bold text-black">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-zinc-400">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editBasePrice}
                                  onChange={(e) => setEditBasePrice(parseFloat(e.target.value) || 0)}
                                  className="w-20 text-xs font-bold border border-[#FF8407] rounded px-1.5 py-0.5 bg-white text-right"
                                />
                              </div>
                            ) : (
                              <span className="text-black font-bold">
                                ${p.basePrice.toFixed(2)}
                                <span className="text-[10px] text-[#8C8C8C] ml-1 font-normal">
                                  /{p.priceUnit}
                                </span>
                              </span>
                            )}
                          </td>

                          <td className="p-2.5 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(p.id)}
                                  className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                                  title="Guardar cambios"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProductId(null)}
                                  className="p-1 bg-zinc-200 text-zinc-600 rounded hover:bg-zinc-300 cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(p)}
                                className="p-1.5 text-zinc-400 hover:text-[#FF8407] hover:bg-amber-50 rounded transition-colors cursor-pointer"
                                title="Editar precio o datos"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS STRUCTURE GUIDE */}
          {activeTab === 'sheets-guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black text-white flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Estructura y Sincronización con Google Sheets
                  </h3>
                  <p className="text-xs text-[#8C8C8C] mt-0.5 leading-relaxed">
                    Sincroniza tus precios en tiempo real conectando el enlace de tu Google Sheet o exporta los datos iniciales para tu hoja.
                  </p>
                </div>
              </div>

              {/* LIVE SYNC MODULE */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                      <RefreshCw className={`w-4 h-4 text-[#FF8407] ${isSyncing ? 'animate-spin' : ''}`} />
                      Sincronización en Vivo y Automática desde Google Sheets
                    </h4>
                    <p className="text-[11px] text-zinc-600">
                      Conecta el enlace de tu hoja de Google para que tus precios se actualicen automáticamente sin tener que cambiarlos a mano.
                    </p>
                  </div>
                  {lastSyncTime && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Sincronizado: {lastSyncTime}</span>
                    </div>
                  )}
                </div>

                {/* Input URL and Tab Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 relative">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="url"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                      className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8407]"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={sheetTabName}
                      onChange={(e) => setSheetTabName(e.target.value)}
                      placeholder="Pestaña (ej. Hoja 1, opcional)"
                      className="w-full text-xs px-3 py-2 bg-white border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8407]"
                      title="Nombre de la pestaña o déjalo vacío para usar la primera pestaña"
                    />
                  </div>
                </div>

                {/* Auto-sync Switch & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAutoSyncEnabled(checked);
                        localStorage.setItem('qs_google_sheet_autosync', checked ? 'true' : 'false');
                      }}
                      className="w-4 h-4 text-[#FF8407] rounded border-zinc-300 focus:ring-[#FF8407] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-zinc-700">
                      Actualizar automáticamente al abrir o usar la app
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleSyncGoogleSheet}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-[#FF8407] hover:bg-[#E07300] disabled:bg-zinc-400 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
                  </button>
                </div>

                {/* Feedback Message */}
                {syncFeedback && (
                  <div className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2.5 ${
                    syncFeedback.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {syncFeedback.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                    <div className="space-y-1">
                      <p className="leading-relaxed font-semibold">{syncFeedback.message}</p>
                      {!syncFeedback.success && (
                        <div className="text-[11px] text-red-700 bg-white/70 p-2 rounded border border-red-200 space-y-1 mt-1">
                          <p className="font-bold">👉 Cómo solucionar el acceso en Google Sheets:</p>
                          <ol className="list-decimal list-inside space-y-0.5 text-zinc-800">
                            <li>Abre tu hoja en Google Sheets.</li>
                            <li>Haz clic en el botón <strong>"Compartir"</strong> (arriba a la derecha).</li>
                            <li>En <em>Acceso general</em>, cámbialo de <strong>"Restringido"</strong> a <strong>"Cualquier persona con el enlace"</strong> (Rol: <strong>Lector</strong>).</li>
                            <li>Haz clic en <strong>"Copiar enlace"</strong> y pégalo aquí arriba.</li>
                          </ol>
                          <p className="pt-1 text-[10px] text-zinc-600">
                            O también: En tu hoja ve a <strong>Archivo &gt; Compartir &gt; Publicar en la Web &gt; Publicar</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick note on permissions & manual paste toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/80 gap-1">
                  <span>
                    💡 Consejo: No necesitas recargar la página. Al cambiar los precios en Google Sheets se reflejan de inmediato.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPasteBox(!showPasteBox)}
                    className="text-[#FF8407] hover:underline font-semibold cursor-pointer shrink-0"
                  >
                    {showPasteBox ? 'Ocultar importación manual' : '¿Prefieres copiar y pegar celdas directamente?'}
                  </button>
                </div>

                {/* Manual paste toggleable area */}
                {showPasteBox && (
                  <div className="p-3 bg-white border border-zinc-200 rounded-lg space-y-2 pt-2">
                    <label className="text-[11px] font-bold text-black uppercase tracking-wider block">
                      Pegar celdas copiadas desde Google Sheets:
                    </label>
                    <textarea
                      value={pastedTsvText}
                      onChange={(e) => setPastedTsvText(e.target.value)}
                      placeholder="Copia las filas desde Google Sheets (con la fila de encabezados) y pégalas aquí..."
                      rows={4}
                      className="w-full text-xs font-mono p-2.5 border border-zinc-300 rounded-md outline-none focus:ring-1 focus:ring-[#FF8407] resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleApplyPastedSheetData}
                        disabled={!pastedTsvText.trim()}
                        className="px-3 py-1.5 bg-black hover:bg-zinc-800 disabled:bg-zinc-300 text-white font-bold text-xs rounded uppercase tracking-wider cursor-pointer"
                      >
                        Actualizar desde texto pegado
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TSV Direct Export for Google Sheets */}
              <div className="p-4 rounded-xl border-2 border-[#FF8407]/40 bg-orange-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                      <Table className="w-4 h-4 text-[#FF8407]" />
                      Exportación TSV Directa (Listo para Pegar en Google Sheets)
                    </h4>
                    <p className="text-[11px] text-zinc-600">
                      Haz clic para copiar al portapapeles y pega directo en la celda A1 de tu Google Sheet.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* TABLA 1: PRODUCTOS */}
                  <div className="bg-white p-3.5 rounded-lg border border-[#E5E5E5] flex flex-col justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-black uppercase tracking-wider">TABLA 1: Productos</span>
                        <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">70 filas</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Pisos, rodapiés, molduras, escalones y accesorios desglosados por color con imágenes y especificaciones.
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyTabla1}
                          className="flex-1 py-2 px-3 bg-[#FF8407] hover:bg-[#E07300] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider shadow-2xs"
                        >
                          {copiedTabla1 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedTabla1 ? '¡Copiado!' : 'Copiar TSV'}</span>
                        </button>
                        <a
                          href="/tabla_1_productos.tsv"
                          download="tabla_1_productos.tsv"
                          className="p-2 border border-zinc-200 hover:border-black text-zinc-700 hover:text-black rounded-lg transition-colors"
                          title="Descargar archivo .tsv"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewTsvType('tabla1')}
                        className="text-[11px] text-[#FF8407] hover:underline text-center font-medium py-0.5 cursor-pointer"
                      >
                        Ver texto / Copiar manualmente
                      </button>
                    </div>
                  </div>

                  {/* TABLA 2: SERVICIOS Y LABOR */}
                  <div className="bg-white p-3.5 rounded-lg border border-[#E5E5E5] flex flex-col justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-black uppercase tracking-wider">TABLA 2: Servicios y Labor</span>
                        <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">7 filas</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Mano de obra (SPC, baseboard, escaleras), remoción/disposal, nivelación, adhesivo y delivery.
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyTabla2}
                          className="flex-1 py-2 px-3 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider shadow-2xs"
                        >
                          {copiedTabla2 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedTabla2 ? '¡Copiado!' : 'Copiar TSV'}</span>
                        </button>
                        <a
                          href="/tabla_2_servicios_labor.tsv"
                          download="tabla_2_servicios_labor.tsv"
                          className="p-2 border border-zinc-200 hover:border-black text-zinc-700 hover:text-black rounded-lg transition-colors"
                          title="Descargar archivo .tsv"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewTsvType('tabla2')}
                        className="text-[11px] text-zinc-600 hover:text-black hover:underline text-center font-medium py-0.5 cursor-pointer"
                      >
                        Ver texto / Copiar manualmente
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info banner about the 2 tabs in Google Sheets */}
                <div className="bg-white/80 p-3 rounded-lg border border-[#FF8407]/30 text-xs text-zinc-700 space-y-1">
                  <div className="font-bold text-black flex items-center gap-1.5">
                    <span>📋</span>
                    <span>¿Cómo organizar tus pestañas en Google Sheets?</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Crea <strong>2 pestañas (hojas)</strong> en tu documento de Google Sheets usando el botón <strong>"+"</strong> en la barra inferior:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                      <span className="font-bold text-black block">Pestaña 1: "Productos"</span>
                      <span className="text-zinc-500">Pega aquí el contenido de la <strong>TABLA 1</strong> en la celda <code>A1</code> (16 columnas).</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                      <span className="font-bold text-black block">Pestaña 2: "Servicios_Labor"</span>
                      <span className="text-zinc-500">Pega aquí el contenido de la <strong>TABLA 2</strong> en la celda <code>A1</code> (7 columnas).</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column Structure Reference */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C]">
                    Encabezados de Columnas (Fila 1 de Google Sheets):
                  </span>
                  <button
                    onClick={copyGoogleSheetsHeader}
                    className="text-xs font-bold text-[#FF8407] hover:underline flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedGuide ? '¡Copiado!' : 'Copiar encabezados'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-2">
                    <span className="font-bold text-[#FF8407] block border-b border-[#E5E5E5] pb-1 uppercase tracking-wider text-[11px]">
                      1. Identificación y Medidas
                    </span>
                    <ul className="space-y-1 text-zinc-600">
                      <li><strong className="text-black">id:</strong> Código único (ej. `spc-5.5mm-pulse-select`)</li>
                      <li><strong className="text-black">name:</strong> Nombre comercial (ej. `Pulse Select Collection`)</li>
                      <li><strong className="text-black">category:</strong> `piso` | `rodapie` | `perfiles` | `escalones`</li>
                      <li><strong className="text-black">thickness:</strong> Espesor (ej. `5.5 mm`, `14 mm x 135 mm`)</li>
                      <li><strong className="text-black">wear_layer:</strong> Capa de uso (ej. `20 Mil`, `22 Mil`)</li>
                      <li><strong className="text-black">plank_size:</strong> Formato (ej. `7" x 48"`, `9" x 60" XL`, `16 ft`)</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-2">
                    <span className="font-bold text-[#FF8407] block border-b border-[#E5E5E5] pb-1 uppercase tracking-wider text-[11px]">
                      2. Rendimiento y Precios
                    </span>
                    <ul className="space-y-1 text-zinc-600">
                      <li><strong className="text-black">sqft_box:</strong> Pies cuadrados por caja (ej. `24.26`, `27.49`)</li>
                      <li><strong className="text-black">planks_box:</strong> Tablas por caja (ej. `9`, `6`, `5`)</li>
                      <li><strong className="text-black">price_client:</strong> Precio venta base por unidad (ej. `1.49`, `1.99`)</li>
                      <li><strong className="text-black">price_dealer:</strong> Precio costo/distribuidor</li>
                      <li><strong className="text-black">strip_length:</strong> Largo de tira para rodapié (`16`)</li>
                      <li><strong className="text-black">colors_list:</strong> Códigos de color (`Q-01, Q-02`)</li>
                    </ul>
                  </div>
                </div>

                {/* Formula notes */}
                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2 text-xs text-zinc-700">
                  <span className="font-bold text-black flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Info className="w-4 h-4 text-[#FF8407]" />
                    Fórmulas Clave de Cálculo en Google Sheets:
                  </span>
                  <div className="space-y-1 font-mono text-[11px] bg-white p-3 rounded-lg border border-[#E5E5E5]">
                    <p><strong className="text-black">Cajas de Piso:</strong> =ROUND(PiesCuadradosDeseados / RendimientoPorCaja, 0)</p>
                    <p><strong className="text-black">Tiras de Rodapié:</strong> =CEILING(PiesLinealesDeseados / 16, 1)</p>
                    <p><strong className="text-black">Sales Tax Miami (7%):</strong> =ROUND(SubtotalMateriales * 0.07, 2)</p>
                    <p><strong className="text-black">Total Estimado:</strong> =SubtotalMateriales + Tax + ManoDeObra + Delivery60</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JSON IMPORT/EXPORT */}
          {activeTab === 'json-csv' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">
                    Editor y Respaldo JSON
                  </h3>
                  <p className="text-xs text-[#8C8C8C]">
                    Copia o pega tu catálogo de productos en formato JSON
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(products, null, 2));
                    setImportSuccess(true);
                    setTimeout(() => setImportSuccess(false), 2000);
                  }}
                  className="px-3 py-1.5 text-xs font-bold border border-[#E5E5E5] hover:border-black rounded-lg flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar JSON</span>
                </button>
              </div>

              {importSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>¡Catálogo actualizado con éxito!</span>
                </div>
              )}

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-bold flex items-center gap-2">
                  <X className="w-4 h-4 text-red-600" />
                  <span>{importError}</span>
                </div>
              )}

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={12}
                className="w-full text-xs font-mono bg-black text-[#FF8407] p-3.5 rounded-xl outline-none focus:ring-1 focus:ring-[#FF8407] border border-zinc-800"
                placeholder="Pega aquí el arreglo JSON de productos..."
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleApplyJsonImport}
                  className="px-5 py-2.5 bg-[#FF8407] text-white text-xs font-bold rounded-lg hover:bg-[#E07300] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Catálogo JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TSV Manual Selection & Preview Sub-modal */}
      {previewTsvType && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-black text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-4 h-4 text-[#FF8407]" />
                  {previewTsvType === 'tabla1' ? 'TABLA 1: Productos (70 filas)' : 'TABLA 2: Servicios y Labor (7 filas)'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {previewTsvType === 'tabla1' ? 'Pega este contenido en la pestaña "Productos" (Celda A1)' : 'Pega este contenido en la pestaña "Servicios_Labor" (Celda A1)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTsvType(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-hidden flex flex-col bg-zinc-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-600 gap-1">
                <span>Haz clic dentro del cuadro para auto-seleccionar todo el texto, o presiona el botón copiar:</span>
                <span className="font-mono text-[10px] bg-white border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded shrink-0">
                  Separado por tabulaciones (TSV)
                </span>
              </div>
              
              <textarea
                readOnly
                value={previewTsvType === 'tabla1' ? generateProductsTSV(products) : generateServicesTSV()}
                onFocus={(e) => e.target.select()}
                className="flex-1 w-full p-3 font-mono text-[11px] bg-white border border-zinc-300 rounded-lg select-all outline-none focus:ring-2 focus:ring-[#FF8407] resize-none overflow-auto leading-relaxed"
                rows={14}
              />
            </div>

            <div className="p-4 bg-white border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-zinc-500">
                💡 En Google Sheets solo presiona <strong>Ctrl+V</strong> (o <strong>Cmd+V</strong>) en la celda <strong>A1</strong>.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={async () => {
                    const text = previewTsvType === 'tabla1' ? generateProductsTSV(products) : generateServicesTSV();
                    await copyTextToClipboard(text);
                    if (previewTsvType === 'tabla1') {
                      setCopiedTabla1(true);
                      setTimeout(() => setCopiedTabla1(false), 2500);
                    } else {
                      setCopiedTabla2(true);
                      setTimeout(() => setCopiedTabla2(false), 2500);
                    }
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#FF8407] hover:bg-[#E07300] text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{(previewTsvType === 'tabla1' ? copiedTabla1 : copiedTabla2) ? '¡Copiado al Portapapeles!' : 'Copiar Todo el Texto'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTsvType(null)}
                  className="px-4 py-2 border border-zinc-300 hover:border-black text-zinc-700 hover:text-black font-bold text-xs rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
