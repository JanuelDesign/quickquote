import React, { useState } from 'react';
import { Product, ProductColor, Language } from '../types';
import { calculateBaseboardUnits, formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { 
  Check, 
  Plus, 
  Ruler, 
  Layers
} from 'lucide-react';

interface BaseboardCalculatorProps {
  products: Product[];
  language?: Language;
  onAddToCart: (
    product: Product,
    linearFeet: number,
    pricePerLinearFt: number,
    color?: ProductColor,
    notes?: string
  ) => void;
}

export const BaseboardCalculator: React.FC<BaseboardCalculatorProps> = ({
  products,
  language = 'en',
  onAddToCart
}) => {
  const t = translations[language];
  const baseboardProducts = products.filter(p => p.category === 'rodapie');
  
  const [selectedProduct, setSelectedProduct] = useState<Product>(baseboardProducts[0] || {} as Product);
  const [linearFeetInput, setLinearFeetInput] = useState<string>('134');
  const [pricePerLinearFt, setPricePerLinearFt] = useState<number>(baseboardProducts[0]?.basePrice || 0.99);
  const [notes, setNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleProductChange = (prod: Product) => {
    setSelectedProduct(prod);
    setPricePerLinearFt(prod.basePrice);
  };

  const stripLength = selectedProduct.stripLengthFeet || 16;
  const lfNumber = parseFloat(linearFeetInput) || 0;
  const { stripsNeeded, totalLinearFeetCovered, surplusFeet } = calculateBaseboardUnits(lfNumber, stripLength);

  const stripUnitPrice = Number((stripLength * pricePerLinearFt).toFixed(2));
  const subtotal = Number((stripsNeeded * stripUnitPrice).toFixed(2));

  const handleAddLF = (amount: number) => {
    const current = parseFloat(linearFeetInput) || 0;
    setLinearFeetInput(Math.max(0, current + amount).toString());
  };

  const handlePriceMarkup = (delta: number) => {
    const newPrice = Math.max(0.1, Number((pricePerLinearFt + delta).toFixed(2)));
    setPricePerLinearFt(newPrice);
  };

  const handleAddToCart = () => {
    if (lfNumber <= 0) return;
    onAddToCart(
      selectedProduct,
      lfNumber,
      pricePerLinearFt,
      selectedProduct.colors?.[0],
      notes
    );
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Product Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C]">
            {t.selectModel} ({baseboardProducts.length})
          </span>
          <span className="text-[11px] font-semibold text-[#8C8C8C]">
            {language === 'en' ? 'Primed White Pine & MDF (16 ft Strips)' : 'Pino blanco imprimado (Tiras de 16 ft)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {baseboardProducts.map((product) => {
            const isSelected = selectedProduct.id === product.id;
            const len = product.stripLengthFeet || 16;
            const stripCost = len * product.basePrice;

            return (
              <div
                key={product.id}
                id={`bb-card-${product.id}`}
                onClick={() => handleProductChange(product)}
                className={`bg-white border rounded-xl p-4 flex flex-col justify-between relative transition-all cursor-pointer shadow-2xs group hover:border-black ${
                  isSelected
                    ? 'border-black ring-1 ring-black bg-zinc-50/50'
                    : 'border-[#E5E5E5]'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider absolute top-3 right-3 ${
                  isSelected ? 'bg-[#FF8407] text-white' : 'bg-black text-white'
                }`}>
                  {len} FT {language === 'en' ? 'STRIPS' : 'TIRAS'}
                </span>

                <div className="pr-16">
                  <h3 className="text-base font-bold text-black leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#8C8C8C] mt-1">
                    {product.size || '3 1/4" - 5 1/4"'} • ${stripCost.toFixed(2)}/{language === 'en' ? 'strip' : 'tira'}
                  </p>
                </div>

                <div className="flex items-baseline justify-between mt-4 pt-2 border-t border-[#E5E5E5]">
                  <div>
                    <span className="text-lg font-bold text-black font-mono">
                      ${product.basePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#8C8C8C] ml-1">/ LF</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductChange(product);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF8407] text-white'
                        : 'bg-black text-white hover:bg-zinc-800'
                    }`}
                  >
                    {isSelected ? (language === 'en' ? 'Selected' : 'Seleccionado') : (language === 'en' ? 'Select' : 'Seleccionar')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redesigned 4-Card Visual Calculation Module */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E5E5E5] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-black text-[#FF8407] flex items-center justify-center font-bold text-xs">
              <Ruler className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">
                {t.enterQuantity}
              </h3>
              <p className="text-[11px] text-[#8C8C8C]">
                {selectedProduct.name} • {selectedProduct.stripLengthFeet || 16} ft {language === 'en' ? 'per strip' : 'por tira'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Linear Feet Input */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2 flex flex-col justify-between">
            <div>
              <label htmlFor="input-bb-linear-feet" className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#8C8C8C] block">
                {t.linearFeetRequired}
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  id="input-bb-linear-feet"
                  value={linearFeetInput}
                  onChange={(e) => setLinearFeetInput(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  className="w-full text-2xl font-black text-black bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C8C8C]">
                  LF
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {[+16, +32, +64, +100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddLF(amt)}
                  className="px-2 py-1 bg-white border border-[#E5E5E5] hover:border-black rounded text-[10px] font-bold text-black cursor-pointer shadow-2xs transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: 16ft Strips Computation Display */}
          <div className="p-4 rounded-xl bg-black text-white border border-black space-y-2 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#8C8C8C]">
                  {t.stripsNeededLabel}
                </span>
                <Ruler className="w-4 h-4 text-[#FF8407]" />
              </div>

              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#FF8407] font-mono">
                  {stripsNeeded}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  {language === 'en' ? 'Strips' : 'Tiras'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-0.5">
              <div className="flex justify-between text-[11px] text-gray-300">
                <span>{language === 'en' ? 'Covers:' : 'Cubre:'}</span>
                <strong className="text-white font-mono">{totalLinearFeetCovered} LF</strong>
              </div>
              <div className="flex justify-between text-[10px] text-[#8C8C8C]">
                <span>{stripLength} ft/{language === 'en' ? 'strip' : 'tira'}</span>
                {surplusFeet > 0 && (
                  <span className="text-amber-400 font-medium">+{surplusFeet} ft {t.surplusText}</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Price per LF & Markup */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2 flex flex-col justify-between">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#8C8C8C] block">
                {t.pricePerLF}
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8C8C8C]">
                  $
                </span>
                <input
                  type="number"
                  value={pricePerLinearFt}
                  onChange={(e) => setPricePerLinearFt(parseFloat(e.target.value) || 0)}
                  step="0.05"
                  className="w-full text-xl font-black text-black bg-white border border-[#E5E5E5] focus:border-black rounded-lg pl-7 pr-2 py-2 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-[#8C8C8C] mb-1">
                <span>{language === 'en' ? 'Strip Cost:' : 'Costo Tira:'} <strong className="text-black font-mono">${stripUnitPrice.toFixed(2)}</strong></span>
              </div>
              <div className="flex gap-1">
                {[+0.05, +0.10, +0.25].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handlePriceMarkup(m)}
                    className="flex-1 py-0.5 bg-amber-500/10 border border-[#FF8407]/20 rounded text-[10px] font-bold text-[#FF8407] hover:bg-amber-500/20 cursor-pointer"
                  >
                    +${m.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Subtotal & Big CTA Action */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-[#E5E5E5] space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#8C8C8C] block">
                {t.subtotalLabel}
              </span>
              <div className="mt-0.5">
                <span className="text-2xl font-black text-black font-mono">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-add-bb-to-cart"
              onClick={handleAddToCart}
              disabled={lfNumber <= 0}
              className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 ${
                addedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : lfNumber > 0
                  ? 'bg-[#FF8407] text-white hover:bg-[#E07300] shadow-[0_4px_12px_rgba(255,132,7,0.3)]'
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.addedToCart}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{language === 'en' ? `Add ${stripsNeeded} Strips` : `Agregar ${stripsNeeded} Tiras`}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Notes Input */}
        <div className="pt-2 border-t border-[#E5E5E5]">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            className="w-full text-xs text-black bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2 outline-none focus:border-black focus:bg-white"
          />
        </div>
      </div>
    </div>
  );
};
