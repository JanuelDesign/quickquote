import React, { useState } from 'react';
import { createCustomCartItem } from '../utils/calculations';
import { CartItem, Language } from '../types';
import { X, Plus, Sparkles } from 'lucide-react';
import { translations } from '../utils/translations';

interface CustomProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: CartItem, saveToCatalog?: boolean) => void;
  language?: Language;
}

export const CustomProductModal: React.FC<CustomProductModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  language = 'en'
}) => {
  const t = translations[language];

  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitLabel, setUnitLabel] = useState(language === 'en' ? 'service' : 'servicio');
  const [unitPrice, setUnitPrice] = useState<number>(150);
  const [isTaxable, setIsTaxable] = useState(false); // Default to false for services/labor
  const [isLabor, setIsLabor] = useState(true);
  const [notes, setNotes] = useState('');
  const [saveToCatalog, setSaveToCatalog] = useState(true);

  const presets = language === 'en' ? [
    {
      label: 'Installation Labor / SPC Flooring',
      price: 2.00,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Professional SPC floor installation with cut, trim and layout adjustment'
    },
    {
      label: 'Baseboard Installation Labor',
      price: 1.50,
      unit: 'LF',
      isTaxable: false,
      isLabor: true,
      desc: 'Baseboard miter cuts, nailing and caulking'
    },
    {
      label: 'Stair Treads Installation Labor',
      price: 25.00,
      unit: 'step',
      isTaxable: false,
      isLabor: true,
      desc: 'Installation labor for flush stair tread and riser'
    },
    {
      label: 'Old Carpet / Floor Removal & Disposal',
      price: 1.00,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Demolition, rip-out and debris haul-away'
    },
    {
      label: 'Floor Subfloor Leveling Labor',
      price: 1.25,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Slab prep and self-leveling compound application'
    },
    {
      label: 'Specialty High-Performance Adhesive',
      price: 45.00,
      unit: 'bucket',
      isTaxable: true,
      isLabor: false,
      desc: 'Heavy-duty flooring adhesive bucket'
    }
  ] : [
    {
      label: 'Mano de Obra / Instalación',
      price: 2.00,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Instalación profesional de piso SPC con corte y ajuste'
    },
    {
      label: 'Instalación de Rodapié',
      price: 1.50,
      unit: 'LF',
      isTaxable: false,
      isLabor: true,
      desc: 'Colocación y clavado de rodapié/baseboard'
    },
    {
      label: 'Instalación de Escalones',
      price: 25.00,
      unit: 'peldaño',
      isTaxable: false,
      isLabor: true,
      desc: 'Mano de obra para peldaño y contrahuella'
    },
    {
      label: 'Remoción de Piso / Alfombra',
      price: 1.00,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Demolición y retiro de piso existente'
    },
    {
      label: 'Nivelación de Piso (Mano de Obra)',
      price: 1.25,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Preparación de losa y aplicación de compuesto nivelador'
    },
    {
      label: 'Pegamento / Adhesivo Especial',
      price: 45.00,
      unit: 'cubeta',
      isTaxable: true,
      isLabor: false,
      desc: 'Adhesivo de alto rendimiento para pisos'
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setDescription(p.label);
    setUnitPrice(p.price);
    setUnitLabel(p.unit);
    setIsTaxable(p.isTaxable);
    setIsLabor(p.isLabor);
    setNotes(p.desc);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || quantity <= 0 || unitPrice < 0) return;

    const item = createCustomCartItem(
      description.trim(),
      quantity,
      unitPrice,
      'otros',
      isTaxable,
      isLabor,
      unitLabel,
      notes.trim() || undefined
    );

    onAddItem(item, saveToCatalog);
    onClose();

    // Reset fields
    setDescription('');
    setQuantity(1);
    setUnitPrice(150);
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto pt-3 sm:pt-4">
      <div 
        className="bg-white rounded-xl w-full max-w-lg shadow-2xl border border-[#E5E5E5] overflow-hidden my-0 sm:my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] bg-black text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {language === 'en' ? 'Add Custom Item or Labor' : 'Agregar Ítem Personalizado o Mano de Obra'}
              </h2>
              <p className="text-[11px] text-[#8C8C8C]">
                {language === 'en' ? 'Enter installation labor, custom services or extra materials' : 'Ingresa mano de obra de instalación, servicios o materiales extra'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-zinc-800 text-[#8C8C8C] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1.5">
              {t.quickPresets}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-2.5 text-left rounded-lg border border-[#E5E5E5] hover:border-black bg-[#FAFAFA] hover:bg-white text-xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <p className="font-bold text-black group-hover:text-[#FF8407] line-clamp-2 leading-snug min-h-[32px]">
                    {p.label}
                  </p>
                  <p className="text-[11px] text-[#6B6A63] font-mono mt-1 pt-1 border-t border-zinc-100">
                    ${p.price.toFixed(2)} / {p.unit} <span className="text-[#FF8407] font-semibold">{p.isLabor ? '• Labor' : '• Product'}</span>
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E5E5] space-y-3.5">
            {/* Description */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#181818] block mb-1">
                {language === 'en' ? 'Description / Name' : 'Descripción / Nombre'}
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Professional SPC flooring labor...' : 'Ej. Mano de obra instalación piso SPC...'}
                className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-medium text-black"
              />
            </div>

            {/* Quantity & Unit Label */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#181818] block mb-1">
                  {language === 'en' ? 'Quantity' : 'Cantidad'}
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-mono font-bold text-black"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#181818] block mb-1">
                  {language === 'en' ? 'Unit (pza, sqft, LF, hour...)' : 'Unidad (pza, sqft, LF, hora...)'}
                </label>
                <input
                  type="text"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="sqft, LF, global, pza, hr"
                  className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none text-black"
                />
              </div>
            </div>

            {/* Unit Price */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#181818] block mb-1">
                {language === 'en' ? 'Unit Price ($)' : 'Precio unitario ($)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C8C8C]">
                  $
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold bg-white border border-[#E5E5E5] focus:border-black rounded-lg pl-7 pr-3 py-2 outline-none font-mono text-black"
                />
              </div>
            </div>

            {/* Taxable & Labor Checkboxes with full visible text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isTaxable}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setIsTaxable(val);
                    if (val) setIsLabor(false);
                  }}
                  className="w-4 h-4 mt-0.5 accent-[#FF8407] rounded cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-black block leading-tight">
                    {language === 'en' ? 'Tangible Product' : 'Es producto tangible'}
                  </span>
                  <span className="text-[11px] text-[#6B6A63] block mt-0.5 leading-snug">
                    {language === 'en' ? 'Applies 7% sales tax' : 'Aplica 7% de impuesto'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLabor}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setIsLabor(val);
                    if (val) setIsTaxable(false);
                  }}
                  className="w-4 h-4 mt-0.5 accent-[#FF8407] rounded cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-black block leading-tight">
                    {language === 'en' ? 'Labor / Service' : 'Es mano de obra o servicio'}
                  </span>
                  <span className="text-[11px] text-[#6B6A63] block mt-0.5 leading-snug">
                    {language === 'en' ? 'Tax-exempt (0% tax)' : 'Exento de impuesto (0% tax)'}
                  </span>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#181818] block mb-1">
                {language === 'en' ? 'Notes / Specification' : 'Notas / Especificación'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Includes site prep and trash haul...' : 'Ej. Incluye preparación y bote de basura...'}
                className="w-full text-xs bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none text-black"
              />
            </div>

            {/* Save to Catalog & Cloud Database Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-amber-200/80 bg-amber-50/50 hover:bg-amber-50 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={saveToCatalog}
                onChange={(e) => setSaveToCatalog(e.target.checked)}
                className="w-4 h-4 accent-[#FF8407] rounded cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-black block leading-tight">
                  {language === 'en' ? 'Save permanently to Database & Catalog' : 'Guardar en Base de Datos y Catálogo permanente'}
                </span>
                <span className="text-[11px] text-[#6B6A63] block mt-0.5 leading-snug">
                  {language === 'en' 
                    ? 'Syncs across all devices and stays available for future quotes' 
                    : 'Sincronizado en la nube para todos los dispositivos y futuras cotizaciones'}
                </span>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer uppercase tracking-wider"
            >
              {language === 'en' ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              id="btn-confirm-add-custom-product"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#FF8407] text-white hover:bg-[#E07300] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'en' ? 'Add to Quote' : 'Agregar a la cotización'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
