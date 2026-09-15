import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, ProductColor } from '../types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Palette, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Layers, 
  Info,
  DollarSign,
  Maximize2,
  Edit2
} from 'lucide-react';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => Promise<void>;
  onDeleteProduct?: (productId: string, productName: string) => Promise<void>;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  onDeleteProduct
}) => {
  // Form state for all base fields
  const [formData, setFormData] = useState<Product>(() => product || {
    id: '',
    name: '',
    category: 'piso',
    basePrice: 0,
    priceUnit: 'sqft',
    colors: []
  });
  
  // Color variants state (nested array)
  const [colorVariants, setColorVariants] = useState<ProductColor[]>(() =>
    product?.colors ? [...product.colors] : []
  );

  // Active section tab: 'specs' | 'variants'
  const [activeSection, setActiveSection] = useState<'specs' | 'variants'>(() =>
    product?.category === 'piso' || product?.category === 'wall_panels' ? 'variants' : 'specs'
  );

  // Sub-form for adding a new variant
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantCode, setNewVariantCode] = useState('');
  const [newVariantHex, setNewVariantHex] = useState('#BDB5A4');
  const [newVariantPlankUrl, setNewVariantPlankUrl] = useState('');

  // Sub-form for editing an existing variant
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [editVarName, setEditVarName] = useState('');
  const [editVarCode, setEditVarCode] = useState('');
  const [editVarHex, setEditVarHex] = useState('#BDB5A4');
  const [editVarPlankUrl, setEditVarPlankUrl] = useState('');

  // Confirmation for deleting a variant
  const [variantToDeleteIndex, setVariantToDeleteIndex] = useState<number | null>(null);

  // Saving state & feedback
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setColorVariants(product.colors ? [...product.colors] : []);
      setIsAddingVariant(false);
      setEditingVariantIndex(null);
      setVariantToDeleteIndex(null);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [product]);

  // Handle reordering variants
  const handleMoveVariant = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= colorVariants.length) return;
    const updated = [...colorVariants];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setColorVariants(updated);
  };

  // Handle adding new variant
  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariantName.trim() || !newVariantCode.trim()) {
      alert('Por favor ingresa el nombre y el código de la variante (ej. Q-01).');
      return;
    }

    const newVariant: ProductColor = {
      name: newVariantName.trim(),
      code: newVariantCode.trim().toUpperCase(),
      hex: newVariantHex || '#BDB5A4',
      plankPhotoUrl: newVariantPlankUrl.trim() || undefined
    };

    setColorVariants([...colorVariants, newVariant]);
    setNewVariantName('');
    setNewVariantCode('');
    setNewVariantHex('#BDB5A4');
    setNewVariantPlankUrl('');
    setIsAddingVariant(false);
  };

  // Handle starting edit of existing variant
  const handleStartEditVariant = (index: number) => {
    const v = colorVariants[index];
    if (!v) return;
    setEditingVariantIndex(index);
    setEditVarName(v.name);
    setEditVarCode(v.code);
    setEditVarHex(v.hex || '#BDB5A4');
    setEditVarPlankUrl(v.plankPhotoUrl || '');
  };

  // Handle saving edited variant
  const handleSaveEditedVariant = (index: number) => {
    if (!editVarName.trim() || !editVarCode.trim()) return;
    const updated = [...colorVariants];
    updated[index] = {
      ...updated[index],
      name: editVarName.trim(),
      code: editVarCode.trim().toUpperCase(),
      hex: editVarHex || '#BDB5A4',
      plankPhotoUrl: editVarPlankUrl.trim() || undefined
    };
    setColorVariants(updated);
    setEditingVariantIndex(null);
  };

  // Handle deleting a variant
  const handleConfirmDeleteVariant = (index: number) => {
    const updated = colorVariants.filter((_, idx) => idx !== index);
    setColorVariants(updated);
    setVariantToDeleteIndex(null);
  };

  // Handle final save
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('El nombre del producto es obligatorio.');
      return;
    }
    if (formData.basePrice === undefined || formData.basePrice <= 0) {
      setErrorMessage('El precio base debe ser mayor a 0.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const productToSave: Product = {
      ...formData,
      name: formData.name.trim(),
      subcategory: formData.subcategory?.trim() || undefined,
      model: formData.model?.trim() || undefined,
      badge: formData.badge?.trim() || undefined,
      thickness: formData.thickness?.trim() || undefined,
      wearLayer: formData.wearLayer?.trim() || undefined,
      size: formData.size?.trim() || undefined,
      dimensions: formData.dimensions?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      sqftPerBox: formData.sqftPerBox ? Number(formData.sqftPerBox) : undefined,
      planksPerBox: formData.planksPerBox ? Number(formData.planksPerBox) : undefined,
      stripLengthFeet: formData.stripLengthFeet ? Number(formData.stripLengthFeet) : undefined,
      basePrice: Number(formData.basePrice),
      colors: colorVariants.length > 0 ? colorVariants : []
    };

    try {
      await onSave(productToSave);
      setSuccessMessage('¡Producto y variantes guardados en Firestore exitosamente!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1100);
    } catch (err: any) {
      console.error('Error al guardar producto:', err);
      setErrorMessage(`Error al sincronizar con Firestore: ${err.message || 'Error de conexión'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* MODAL HEADER - QuickSurfaces Black Header */}
        <div className="bg-black text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF8407] text-white flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Editar Producto & Variantes
                </h3>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-[#FF8407] text-[10px] font-mono uppercase font-bold tracking-wider">
                  {formData.category}
                </span>
                {formData.badge && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold">
                    {formData.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-md">
                {formData.name || 'Sin nombre'} · ID: <span className="font-mono text-zinc-300">{formData.id}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Cerrar editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-[#F8F8F8] px-5 py-2.5 border-b border-[#E5E5E5] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('specs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'specs'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-300 hover:border-black'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#FF8407]" />
              <span>1. Especificaciones y Precios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('variants')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'variants'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-300 hover:border-black'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#FF8407]" />
              <span>2. Colores y Acabados ({colorVariants.length})</span>
            </button>
          </div>

          {onDeleteProduct && (
            <button
              type="button"
              onClick={() => onDeleteProduct(formData.id, formData.name)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
              title="Eliminar este producto del catálogo"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eliminar Producto</span>
            </button>
          )}
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* ========================================================================= */}
          {/* SECTION 1: ESPECIFICACIONES COMPLETAS DEL PRODUCTO                        */}
          {/* ========================================================================= */}
          {activeSection === 'specs' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#FF8407]"></span>
                  Datos Principales del Producto
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Categoría */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                      className="w-full text-xs font-bold bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    >
                      <option value="piso">Piso (Flooring SPC / Laminado / Tile)</option>
                      <option value="rodapie">Rodapié (Baseboards / Molding)</option>
                      <option value="perfiles">Perfiles (Reducers, T-Molding, End Caps)</option>
                      <option value="escalones">Escalones (Stairs, Bullnose, Risers)</option>
                      <option value="wall_panels">Wall Panels (Revestimientos Acústicos / WPC)</option>
                      <option value="underlayment">Underlayment (Mantas y Aislamiento)</option>
                      <option value="otros">Otros (Adhesivos y Accesorios)</option>
                    </select>
                  </div>

                  {/* Nombre del Producto */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Nombre del Producto / Colección *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. Pulse Select Collection"
                      className="w-full text-xs font-bold bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  {/* Colección / Subcategoría */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Colección / Subcategoría
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory || ''}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="Ej. Pulse Select"
                      className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none font-medium"
                    />
                  </div>

                  {/* Modelo Específico */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Modelo / Serie
                    </label>
                    <input
                      type="text"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Ej. Series 500"
                      className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none font-medium"
                    />
                  </div>

                  {/* Badge */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Badge / Etiqueta Comercial
                    </label>
                    <input
                      type="text"
                      value={formData.badge || ''}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="Ej. BEST SELLER, PREMIUM, NUEVO..."
                      className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none font-semibold text-[#FF8407]"
                    />
                  </div>
                </div>
              </div>

              {/* Especificaciones Técnicas */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#FF8407]"></span>
                  Dimensiones y Especificaciones Técnicas
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Espesor */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Espesor (Thickness)
                    </label>
                    <input
                      type="text"
                      value={formData.thickness || ''}
                      onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                      placeholder='Ej. 5.5 mm, 14 mm...'
                      className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  {/* Capa de Uso */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Capa de Uso (Wear Layer)
                    </label>
                    <input
                      type="text"
                      value={formData.wearLayer || ''}
                      onChange={(e) => setFormData({ ...formData, wearLayer: e.target.value })}
                      placeholder="Ej. 20 Mil, 12 Mil..."
                      className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  {/* Medidas / Formato */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Medidas / Formato (Plank / Sheet Size)
                    </label>
                    <input
                      type="text"
                      value={formData.size || ''}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder='Ej. 7" x 48", 9" x 48", 9.5ft...'
                      className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Precios y Unidades de Venta */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#FF8407]"></span>
                  Precios, Unidades y Rendimiento
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Precio Base */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Precio Base ($) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs font-bold font-mono bg-white border border-[#E5E5E5] focus:border-black rounded-lg pl-7 pr-2.5 py-2.5 outline-none"
                      />
                    </div>
                  </div>

                  {/* Unidad de Precio */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Unidad de Venta *
                    </label>
                    <select
                      value={formData.priceUnit}
                      onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value as any })}
                      className="w-full text-xs font-bold bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    >
                      <option value="sqft">por SqFt (Pie²)</option>
                      <option value="linear_ft">por Pie Lineal (LF)</option>
                      <option value="strip">por Tira Completa</option>
                      <option value="piece">por Pieza / Unidad</option>
                      <option value="box">por Caja Cerrada</option>
                      <option value="unit">por Unidad</option>
                    </select>
                  </div>

                  {/* Cobertura por Caja (SqFt/Caja) */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      SqFt por Caja
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.sqftPerBox || ''}
                      onChange={(e) => setFormData({ ...formData, sqftPerBox: parseFloat(e.target.value) || undefined })}
                      placeholder="Ej. 24.26"
                      className="w-full text-xs font-mono font-bold bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  {/* Longitud de Tira (Feet) para rodapié/molduras */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Largo de Tira (Pies / LF)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.stripLengthFeet || ''}
                      onChange={(e) => setFormData({ ...formData, stripLengthFeet: parseFloat(e.target.value) || undefined })}
                      placeholder="Ej. 16 ft o 8 ft"
                      className="w-full text-xs font-mono font-bold bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {/* Tablas por caja */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Tablas por Caja (Planks / Box)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.planksPerBox || ''}
                      onChange={(e) => setFormData({ ...formData, planksPerBox: parseInt(e.target.value) || undefined })}
                      placeholder="Ej. 9 tablas"
                      className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  {/* Rendimiento textual */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      Etiqueta de Rendimiento (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.yieldPerUnit || ''}
                      onChange={(e) => setFormData({ ...formData, yieldPerUnit: e.target.value })}
                      placeholder="Ej. 24.26 sqft/caja o 16 LF/tira"
                      className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                {/* Descripción / Notas */}
                <div className="mt-3">
                  <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                    Descripción / Especificaciones Adicionales
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalles de garantía, composición acústica, o instrucciones para el instalador..."
                    className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg p-2.5 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: GESTIÓN COMPLETA DE VARIANTES DE COLOR / ACABADOS              */}
          {/* ========================================================================= */}
          {activeSection === 'variants' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Variants Section Banner */}
              <div className="p-4 rounded-xl bg-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#FF8407]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Colores y Acabados de la Colección
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#FF8407] text-white text-[10px] font-bold">
                      {colorVariants.length} variantes
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Gestiona los colores disponibles para los vendedores al cotizar pisos y wall panels. Se guardan en Firestore en tiempo real sin romper cotizaciones anteriores.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddingVariant(true);
                    setEditingVariantIndex(null);
                  }}
                  className="px-3.5 py-2 bg-[#FF8407] hover:bg-[#E07300] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar Variante</span>
                </button>
              </div>

              {/* SUB-FORM: AGREGAR NUEVA VARIANTE */}
              {isAddingVariant && (
                <form onSubmit={handleAddVariant} className="p-4 rounded-xl bg-amber-50/70 border-2 border-[#FF8407]/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#FF8407]/20 pb-2">
                    <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF8407]" />
                      Nueva Variante de Color / Acabado
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingVariant(false)}
                      className="text-zinc-400 hover:text-black cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* Código ej Q-01 */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-600 block mb-1">
                        Código (ej. Q-14) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newVariantCode}
                        onChange={(e) => setNewVariantCode(e.target.value)}
                        placeholder="Ej. Q-14, PS-05..."
                        className="w-full text-xs font-bold font-mono uppercase bg-white border border-zinc-300 focus:border-[#FF8407] rounded-lg p-2 outline-none"
                      />
                    </div>

                    {/* Nombre del Acabado */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-600 block mb-1">
                        Nombre del Color / Tono *
                      </label>
                      <input
                        type="text"
                        required
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        placeholder="Ej. Nordic Oak, Honey Amber, Warm Walnut..."
                        className="w-full text-xs font-bold bg-white border border-zinc-300 focus:border-[#FF8407] rounded-lg p-2 outline-none"
                      />
                    </div>

                    {/* Selector de Color Hex */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-600 block mb-1">
                        Color / Tono HEX
                      </label>
                      <div className="flex items-center gap-1.5 bg-white border border-zinc-300 rounded-lg p-1">
                        <input
                          type="color"
                          value={newVariantHex}
                          onChange={(e) => setNewVariantHex(e.target.value)}
                          className="w-7 h-7 rounded border-none cursor-pointer p-0 bg-transparent"
                          title="Seleccionar tono visual"
                        />
                        <input
                          type="text"
                          value={newVariantHex}
                          onChange={(e) => setNewVariantHex(e.target.value)}
                          className="w-full text-xs font-mono font-bold uppercase outline-none"
                          placeholder="#A09D99"
                        />
                      </div>
                    </div>
                  </div>

                  {/* URL de Foto de Tabla / Textura (Opcional) */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-600 block mb-1">
                      URL Foto de Tabla / Textura Plank (Opcional)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={newVariantPlankUrl}
                          onChange={(e) => setNewVariantPlankUrl(e.target.value)}
                          placeholder="https://.../plank_photo.webp (enlace a foto de muestra)"
                          className="w-full text-xs bg-white border border-zinc-300 focus:border-[#FF8407] rounded-lg pl-8 pr-2.5 py-2 outline-none font-mono"
                        />
                      </div>
                      {newVariantPlankUrl && (
                        <div className="w-8 h-8 rounded-md border border-zinc-300 overflow-hidden shrink-0 bg-zinc-100">
                          <img
                            src={newVariantPlankUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview de la nueva variante */}
                  <div className="p-2.5 rounded-lg bg-white border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-full border border-black/20 shadow-2xs shrink-0 flex items-center justify-center font-bold text-[9px]"
                        style={{ backgroundColor: newVariantHex }}
                      >
                        {newVariantPlankUrl && <ImageIcon className="w-3.5 h-3.5 text-white drop-shadow" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-black">
                          {newVariantName || 'Nombre de ejemplo'}
                        </span>
                        <span className="text-[11px] font-mono text-[#FF8407] font-bold ml-2">
                          {newVariantCode || 'Q-XX'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingVariant(false)}
                        className="px-3 py-1 text-xs text-zinc-600 hover:text-black cursor-pointer font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#FF8407] text-white text-xs font-bold rounded-lg hover:bg-[#E07300] cursor-pointer uppercase tracking-wider"
                      >
                        Añadir a la Lista
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* LISTA DE VARIANTES */}
              {colorVariants.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50">
                  <Palette className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-700">Este producto aún no tiene variantes de color configuradas</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Puedes agregar acabados con código, color hex y foto de tabla para que el vendedor los seleccione en la cotización.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddingVariant(true)}
                    className="mt-3 px-3 py-1.5 bg-[#FF8407] text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Primera Variante</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {colorVariants.map((variant, index) => {
                    const isEditingThis = editingVariantIndex === index;
                    const isConfirmingDelete = variantToDeleteIndex === index;

                    if (isEditingThis) {
                      return (
                        <div key={index} className="p-3 rounded-xl bg-amber-50 border border-[#FF8407] space-y-2.5">
                          <div className="flex items-center justify-between text-xs font-bold text-black uppercase">
                            <span>Modificar Variante #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => setEditingVariantIndex(null)}
                              className="text-zinc-400 hover:text-black cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-0.5">Código</label>
                              <input
                                type="text"
                                value={editVarCode}
                                onChange={(e) => setEditVarCode(e.target.value)}
                                className="w-full text-xs font-bold font-mono bg-white border border-zinc-300 rounded p-1.5"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-0.5">Nombre</label>
                              <input
                                type="text"
                                value={editVarName}
                                onChange={(e) => setEditVarName(e.target.value)}
                                className="w-full text-xs font-bold bg-white border border-zinc-300 rounded p-1.5"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-0.5">Tono HEX</label>
                              <div className="flex items-center gap-1 bg-white border border-zinc-300 rounded p-0.5">
                                <input
                                  type="color"
                                  value={editVarHex}
                                  onChange={(e) => setEditVarHex(e.target.value)}
                                  className="w-6 h-6 rounded border-none cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={editVarHex}
                                  onChange={(e) => setEditVarHex(e.target.value)}
                                  className="w-full text-xs font-mono font-bold uppercase outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-0.5">URL Foto de Plank</label>
                            <input
                              type="text"
                              value={editVarPlankUrl}
                              onChange={(e) => setEditVarPlankUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full text-xs font-mono bg-white border border-zinc-300 rounded p-1.5"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingVariantIndex(null)}
                              className="px-3 py-1 text-xs font-bold text-zinc-600 hover:text-black cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditedVariant(index)}
                              className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded cursor-pointer uppercase tracking-wider"
                            >
                              Guardar Variante
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={index}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isConfirmingDelete 
                            ? 'bg-red-50 border-red-300' 
                            : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-2xs'
                        }`}
                      >
                        {/* Variant Swatch & Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Order index */}
                          <span className="text-[10px] font-mono font-bold text-zinc-400 w-5 text-center">
                            #{index + 1}
                          </span>

                          {/* Visual Swatch */}
                          <div className="relative w-9 h-9 rounded-lg border border-black/15 overflow-hidden shadow-2xs shrink-0 flex items-center justify-center bg-zinc-100">
                            {variant.plankPhotoUrl ? (
                              <img
                                src={variant.plankPhotoUrl}
                                alt={variant.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to hex color if image fails
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`absolute inset-0 ${variant.plankPhotoUrl ? 'opacity-30' : ''}`}
                              style={{ backgroundColor: variant.hex || '#BDB5A4' }}
                            />
                          </div>

                          {/* Code and Name */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-black text-white text-[10px] font-mono font-bold">
                                {variant.code}
                              </span>
                              <span className="text-xs font-bold text-black truncate">
                                {variant.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 font-mono">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full inline-block border border-black/20" style={{ backgroundColor: variant.hex }}></span>
                                {variant.hex}
                              </span>
                              {variant.plankPhotoUrl && (
                                <span className="text-[#FF8407] font-semibold flex items-center gap-0.5">
                                  <ImageIcon className="w-2.5 h-2.5" /> Foto vinculada
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Reorder Buttons */}
                          <div className="flex items-center bg-zinc-100 rounded-lg p-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveVariant(index, 'up')}
                              className="p-1 text-zinc-500 hover:text-black disabled:opacity-25 disabled:hover:text-zinc-500 cursor-pointer rounded"
                              title="Mover arriba"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === colorVariants.length - 1}
                              onClick={() => handleMoveVariant(index, 'down')}
                              className="p-1 text-zinc-500 hover:text-black disabled:opacity-25 disabled:hover:text-zinc-500 cursor-pointer rounded"
                              title="Mover abajo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleStartEditVariant(index)}
                            className="p-1.5 text-zinc-500 hover:text-[#FF8407] hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                            title="Editar datos de este color"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete with Confirmation */}
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1 bg-red-100 p-1 rounded-lg">
                              <span className="text-[10px] font-bold text-red-800 px-1">¿Borrar?</span>
                              <button
                                type="button"
                                onClick={() => handleConfirmDeleteVariant(index)}
                                className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 cursor-pointer"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setVariantToDeleteIndex(null)}
                                className="px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded text-[10px] font-bold hover:bg-zinc-300 cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setVariantToDeleteIndex(index)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Eliminar este color"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-[#F8F8F8] px-5 py-3.5 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#FF8407]" />
            <span>Al guardar, los cambios se replican en tiempo real en la nube Firestore.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-black border border-zinc-300 hover:border-black rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit()}
              className="px-5 py-2 bg-[#FF8407] hover:bg-[#E07300] disabled:bg-zinc-400 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs uppercase tracking-wider"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando en Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Producto y Variantes</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
