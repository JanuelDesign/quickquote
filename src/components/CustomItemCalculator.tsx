import React, { useState } from 'react';
import { createCustomCartItem, formatCurrency } from '../utils/calculations';
import { CartItem, Language } from '../types';
import { 
  Wrench, 
  Plus, 
  Sparkles, 
  Check, 
  DollarSign, 
  Hash, 
  Layers, 
  FileText,
  Database
} from 'lucide-react';
import { translations } from '../utils/translations';

interface CustomItemCalculatorProps {
  onAddItem: (item: CartItem, saveToCatalog?: boolean) => void;
  language?: Language;
}

export const CustomItemCalculator: React.FC<CustomItemCalculatorProps> = ({
  onAddItem,
  language = 'en'
}) => {
  const isEn = language === 'en';
  const t = translations[language];

  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitLabel, setUnitLabel] = useState(isEn ? 'service' : 'servicio');
  const [unitPrice, setUnitPrice] = useState<number>(150);
  const [isTaxable, setIsTaxable] = useState(false); // Default false for services/labor
  const [isLabor, setIsLabor] = useState(true);
  const [notes, setNotes] = useState('');
  const [saveToCatalog, setSaveToCatalog] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const presets = isEn ? [
    {
      label: 'Installation Labor / SPC Flooring',
      price: 2.00,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Professional SPC floor installation, layout prep and trim fitting'
    },
    {
      label: 'Stair Treads Installation Labor',
      price: 25.00,
      unit: 'step',
      isTaxable: false,
      isLabor: true,
      desc: 'Installation labor for flush stair tread and matching riser'
    },
    {
      label: 'Baseboard Installation Labor',
      price: 1.50,
      unit: 'LF',
      isTaxable: false,
      isLabor: true,
      desc: 'Baseboard miter cuts, secure nailing and professional caulking'
    },
    {
      label: 'Demolition & Old Floor Removal',
      price: 1.00,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Rip-out of carpet/laminate/tile and debris haul-away'
    },
    {
      label: 'Subfloor Prep & Leveling Labor',
      price: 1.25,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Concrete slab grinding and self-leveling underlayment compound'
    },
    {
      label: 'High-Tack Adhesive / Materials',
      price: 45.00,
      unit: 'bucket',
      isTaxable: true,
      isLabor: false,
      desc: 'Commercial grade flooring adhesive bucket'
    }
  ] : [
    {
      label: 'Mano de Obra / Instalación Piso SPC',
      price: 2.00,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Instalación profesional de piso SPC con corte y ajuste perimetral'
    },
    {
      label: 'Instalación de Escalones (Peldaños)',
      price: 25.00,
      unit: 'peldaño',
      isTaxable: false,
      isLabor: true,
      desc: 'Mano de obra para peldaño y contrahuella'
    },
    {
      label: 'Instalación de Rodapié / Baseboard',
      price: 1.50,
      unit: 'LF',
      isTaxable: false,
      isLabor: true,
      desc: 'Cortes en inglete, fijación y sellado con calafateo'
    },
    {
      label: 'Demolición y Retiro de Piso Existente',
      price: 1.00,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Remoción de alfombra/vinil/cerámica y acarreo de escombros'
    },
    {
      label: 'Nivelación de Losa / Mano de Obra',
      price: 1.25,
      unit: 'sqft',
      isTaxable: false,
      isLabor: true,
      desc: 'Desbaste de losa y aplicación de compuesto autonivelante'
    },
    {
      label: 'Pegamento Especial / Materiales',
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || quantity <= 0 || unitPrice < 0) return;

    const item = createCustomCartItem(
      description.trim(),
      quantity,
      unitPrice,
      'otros',
      isTaxable,
      isLabor,
      unitLabel.trim() || (isEn ? 'unit' : 'unidad'),
      notes.trim() || undefined
    );

    onAddItem(item, saveToCatalog);

    // Show quick feedback
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2500);

    // Reset fields to sensible defaults
    setDescription('');
    setQuantity(1);
    setUnitPrice(150);
    setNotes('');
  };

  const subtotal = Number((quantity * unitPrice).toFixed(2));

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner with distinct amber accent */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border-b border-amber-200/80 flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-amber-950 tracking-tight leading-tight">
                {isEn ? 'Custom Item / Labor Calculator' : 'Calculador de Ítem / Mano de Obra'}
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                {isEn ? 'DIRECT 1-STEP' : '1 SOLO PASO'}
              </span>
            </div>
            <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
              {isEn 
                ? 'Add installation labor, custom services, or non-catalog items with flexible units and tax control.' 
                : 'Agrega mano de obra de instalación, servicios especiales o materiales no listados con control de impuestos.'}
            </p>
          </div>
        </div>

        {/* Live calculated subtotal preview chip */}
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span className="text-[10px] uppercase font-bold text-amber-800/80 tracking-wider">
            {isEn ? 'Subtotal Preview' : 'Subtotal Estimado'}
          </span>
          <span className="font-mono text-lg font-black text-amber-950">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Quick Presets Section */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6A63] flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8407]" />
            <span>{isEn ? 'Quick Labors & Presets (Tap to fill)' : 'Labores más comunes (Toca para autocompletar)'}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-3 text-left rounded-xl border border-[#E4E2DA] hover:border-[#FF8407] bg-[#FAFAFA] hover:bg-white text-xs transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-1.5 min-w-0">
                  <p className="font-bold text-[#181818] group-hover:text-[#FF8407] line-clamp-2 leading-tight">
                    {p.label}
                  </p>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                    p.isLabor ? 'bg-zinc-100 text-zinc-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.isLabor ? (isEn ? 'Labor' : 'Labor') : (isEn ? 'Product' : 'Prod')}
                  </span>
                </div>
                <div className="mt-2 pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-[#6B6A63] font-mono">
                  <span className="font-bold text-[#181818]">${p.price.toFixed(2)} / {p.unit}</span>
                  <span className="text-[10px] text-zinc-400 font-sans">{p.isTaxable ? '7% Tax' : '0% Tax'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 1-Step Form */}
        <form onSubmit={handleAdd} className="pt-2 border-t border-zinc-100 space-y-4">
          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#181818] block">
              {isEn ? 'Description / Labor Name' : 'Descripción / Nombre de la Labor o Ítem'} *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isEn ? 'e.g. Professional SPC flooring labor, layout prep and trim fitting...' : 'Ej. Mano de obra instalación piso SPC, ajuste perimetral...'}
              className="w-full text-xs sm:text-sm bg-white border border-[#E4E2DA] focus:border-[#FF8407] rounded-xl px-3.5 py-2.5 outline-hidden font-medium text-[#181818] placeholder:text-[#9C9A90] shadow-2xs"
            />
          </div>

          {/* Quantity, Unit & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#181818] block">
                {isEn ? 'Quantity' : 'Cantidad'} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm bg-white border border-[#E4E2DA] focus:border-[#FF8407] rounded-xl px-3.5 py-2.5 outline-hidden font-mono font-bold text-[#181818] shadow-2xs"
                />
              </div>
            </div>

            {/* Unit */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#181818] block">
                {isEn ? 'Unit' : 'Unidad de Medida'} *
              </label>
              <input
                type="text"
                required
                value={unitLabel}
                onChange={(e) => setUnitLabel(e.target.value)}
                placeholder="sqft, LF, step, hr, job"
                className="w-full text-sm bg-white border border-[#E4E2DA] focus:border-[#FF8407] rounded-xl px-3.5 py-2.5 outline-hidden font-medium text-[#181818] shadow-2xs"
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#181818] block">
                {isEn ? 'Unit Price ($)' : 'Precio Unitario ($)'} *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9C9A90]">
                  $
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-mono font-bold bg-white border border-[#E4E2DA] focus:border-[#FF8407] rounded-xl pl-8 pr-3.5 py-2.5 outline-hidden text-[#181818] shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Notes / Specifications */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6A63] block">
              {isEn ? 'Notes / Specifications (Optional)' : 'Notas / Especificaciones adicionales (Opcional)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isEn ? 'e.g. Requires site inspection prior to install...' : 'Ej. Requiere inspección previa del área...'}
              className="w-full text-xs bg-white border border-[#E4E2DA] focus:border-[#FF8407] rounded-xl px-3.5 py-2 outline-hidden text-[#181818] placeholder:text-[#9C9A90] shadow-2xs"
            />
          </div>

          {/* Checkboxes with EXPLANATORY TEXT */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C9A90] block">
              {isEn ? 'Taxation & Category Rules' : 'Reglas de Impuesto y Clasificación'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Checkbox 1: Taxable */}
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer select-none ${
                isTaxable ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40' : 'bg-[#FAFAFA] border-[#E4E2DA] hover:bg-white'
              }`}>
                <input
                  type="checkbox"
                  checked={isTaxable}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsTaxable(checked);
                    if (checked) setIsLabor(false);
                  }}
                  className="w-4 h-4 mt-0.5 accent-[#FF8407] rounded cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#181818] block leading-tight">
                    {isEn ? 'Aplica impuesto del 7% (Taxable)' : 'Aplica impuesto del 7% (Taxable)'}
                  </span>
                  <p className="text-[11px] text-[#6B6A63] mt-1 leading-relaxed">
                    {isEn 
                      ? 'Mark if this is a physical product or tangible material. Uncheck for tax-exempt services.' 
                      : 'Marcar si es un material o producto físico gravable. Desmarcar para mano de obra o servicios exentos.'}
                  </p>
                </div>
              </label>

              {/* Checkbox 2: Labor / Service */}
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer select-none ${
                isLabor ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40' : 'bg-[#FAFAFA] border-[#E4E2DA] hover:bg-white'
              }`}>
                <input
                  type="checkbox"
                  checked={isLabor}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsLabor(checked);
                    if (checked) setIsTaxable(false);
                  }}
                  className="w-4 h-4 mt-0.5 accent-[#FF8407] rounded cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#181818] block leading-tight">
                    {isEn ? 'Es mano de obra o servicio (Labor)' : 'Es mano de obra o servicio (Labor)'}
                  </span>
                  <p className="text-[11px] text-[#6B6A63] mt-1 leading-relaxed">
                    {isEn 
                      ? 'Displays itemized under Installation / Labor section in the quote and PDF (0% tax).' 
                      : 'Se muestra desglosado en el subtotal de Mano de Obra en la cotización y el PDF (0% tax).'}
                  </p>
                </div>
              </label>
            </div>

            {/* Checkbox 3: Save to Database & Catalog */}
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer select-none ${
              saveToCatalog ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40' : 'bg-[#FAFAFA] border-[#E4E2DA] hover:bg-white'
            }`}>
              <input
                type="checkbox"
                checked={saveToCatalog}
                onChange={(e) => setSaveToCatalog(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#FF8407] rounded cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#181818] block leading-tight flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#FF8407]" />
                  <span>{isEn ? 'Guardar en catálogo para futuras cotizaciones' : 'Guardar en catálogo para futuras cotizaciones'}</span>
                </span>
                <p className="text-[11px] text-[#6B6A63] mt-1 leading-relaxed">
                  {isEn 
                    ? 'Saves this item to the shared catalog so all sales team members can select it on any device.' 
                    : 'Guarda este ítem en el catálogo compartido para que todo el equipo pueda volver a usarlo.'}
                </p>
              </div>
            </label>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-3 border-t border-[#E4E2DA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B6A63] font-medium">
                {isEn ? 'Total to add:' : 'Total a agregar:'}
              </span>
              <span className="font-mono text-lg font-black text-[#181818]">
                {formatCurrency(subtotal)}
              </span>
              {addedFeedback && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  {isEn ? 'Added to quote!' : '¡Agregado a la cotización!'}
                </span>
              )}
            </div>

            <button
              type="submit"
              id="btn-add-custom-item-to-quote"
              className="py-3 px-6 rounded-xl bg-[#FF8407] hover:bg-[#E07300] active:scale-[0.99] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer group"
            >
              <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform" />
              <span>{isEn ? 'Add Custom Item / Labor' : 'Agregar Ítem / Mano de Obra'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
