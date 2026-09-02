import React, { useState } from 'react';
import { Product, ProductColor, Language } from '../types';
import { formatCurrency } from '../utils/calculations';
import { translations } from '../utils/translations';
import { Check, Plus, Minus, CornerDownRight } from 'lucide-react';

interface ProfilesCalculatorProps {
  products: Product[];
  language?: Language;
  onAddToCart: (
    product: Product,
    pieceCount: number,
    unitPrice: number,
    color?: ProductColor,
    notes?: string
  ) => void;
}

export const ProfilesCalculator: React.FC<ProfilesCalculatorProps> = ({
  products,
  language = 'en',
  onAddToCart
}) => {
  const t = translations[language];
  const profileProducts = products.filter(p => p.category === 'perfiles');
  
  const [selectedProduct, setSelectedProduct] = useState<Product>(profileProducts[0] || {} as Product);
  const [quantity, setQuantity] = useState<number>(4);
  const [unitPrice, setUnitPrice] = useState<number>(profileProducts[0]?.basePrice || 30.00);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    profileProducts[0]?.colors?.[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleProductChange = (prod: Product) => {
    setSelectedProduct(prod);
    setUnitPrice(prod.basePrice);
    setSelectedColor(prod.colors?.[0]);
  };

  const subtotal = Number((quantity * unitPrice).toFixed(2));

  const handlePriceMarkup = (delta: number) => {
    setUnitPrice(Math.max(1, Number((unitPrice + delta).toFixed(2))));
  };

  const handleAddToCart = () => {
    if (quantity <= 0) return;
    onAddToCart(selectedProduct, quantity, unitPrice, selectedColor, notes);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Product Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C]">
            {t.selectModel} ({profileProducts.length})
          </span>
          <span className="text-[11px] font-semibold text-[#8C8C8C]">
            {language === 'en' ? 'T-Molding • Reducer • End Cap • Aluminum' : 'T-Molding, Reductores, End Caps y Aluminio'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {profileProducts.map((product) => {
            const isSelected = selectedProduct.id === product.id;

            return (
              <div
                key={product.id}
                id={`profile-card-${product.id}`}
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
                  {product.size || '94"'}
                </span>

                <div className="pr-16">
                  <h3 className="text-base font-bold text-black leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#8C8C8C] mt-1">
                    {product.description || (language === 'en' ? 'Matching transition profile' : 'Perfil de terminación')}
                  </p>
                </div>

                <div className="flex items-baseline justify-between mt-4 pt-2 border-t border-[#E5E5E5]">
                  <div>
                    <span className="text-lg font-bold text-black font-mono">
                      ${product.basePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#8C8C8C] ml-1">/ {language === 'en' ? 'pc' : 'pza'}</span>
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

      {/* Finishes / Colors if available */}
      {selectedProduct.colors && selectedProduct.colors.length > 1 && (
        <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-2xs space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block">
            {t.selectColor}
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedProduct.colors.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  selectedColor?.code === c.code
                    ? 'border-black bg-zinc-50 text-black ring-1 ring-black shadow-xs'
                    : 'border-[#E5E5E5] text-zinc-600 bg-white hover:border-zinc-400'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-2xs" style={{ backgroundColor: c.hex }} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Redesigned 4-Card Visual Calculation Module */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E5E5E5] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-black text-[#FF8407] flex items-center justify-center font-bold text-xs">
              <CornerDownRight className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">
                {t.enterQuantity}
              </h3>
              <p className="text-[11px] text-[#8C8C8C]">
                {selectedProduct.name} • {selectedProduct.size || '94" length'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Quantity Stepper */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2 flex flex-col justify-between">
            <div>
              <label htmlFor="input-profile-quantity" className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#8C8C8C] block">
                {t.profileQtyLabel}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-[#E5E5E5] hover:border-black bg-white flex items-center justify-center text-black active:scale-95 cursor-pointer font-bold shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  id="input-profile-quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full text-center text-2xl font-black text-black bg-white border border-[#E5E5E5] focus:border-black rounded-lg py-1.5 outline-none font-mono"
                />

                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-black hover:bg-zinc-800 text-[#FF8407] flex items-center justify-center active:scale-95 cursor-pointer font-bold shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {[2, 4, 6, 8, 12].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQuantity(amt)}
                  className="px-2 py-0.5 bg-white border border-[#E5E5E5] hover:border-black rounded text-[10px] font-bold text-black cursor-pointer shadow-2xs"
                >
                  {amt} {language === 'en' ? 'pcs' : 'pzas'}
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Visual Item Specs Display */}
          <div className="p-4 rounded-xl bg-black text-white border border-black space-y-2 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#8C8C8C]">
                  {language === 'en' ? 'Pieces to Dispatch' : 'Piezas a Despachar'}
                </span>
                <CornerDownRight className="w-4 h-4 text-[#FF8407]" />
              </div>

              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#FF8407] font-mono">
                  {quantity}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  {t.profilePieces}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-0.5 text-[11px] text-gray-300">
              <div className="flex justify-between">
                <span>{language === 'en' ? 'Standard Length:' : 'Largo Estándar:'}</span>
                <strong className="text-white font-mono">{selectedProduct.size || '94 inches'}</strong>
              </div>
            </div>
          </div>

          {/* Card 3: Price per Piece & Markup */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-2 flex flex-col justify-between">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#8C8C8C] block">
                {t.profilePricePerPiece}
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8C8C8C]">
                  $
                </span>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  min="1"
                  step="1"
                  className="w-full text-xl font-black text-black bg-white border border-[#E5E5E5] focus:border-black rounded-lg pl-7 pr-2 py-2 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-[#8C8C8C] mb-1">
                <span>{language === 'en' ? 'Base List:' : 'Lista Base:'} <strong className="text-black font-mono">${selectedProduct.basePrice.toFixed(2)}</strong></span>
              </div>
              <div className="flex gap-1">
                {[+1, +2, +5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handlePriceMarkup(m)}
                    className="flex-1 py-0.5 bg-amber-500/10 border border-[#FF8407]/20 rounded text-[10px] font-bold text-[#FF8407] hover:bg-amber-500/20 cursor-pointer"
                  >
                    +${m}
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
              id="btn-add-profile-to-cart"
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 ${
                addedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-[#FF8407] text-white hover:bg-[#E07300] shadow-[0_4px_12px_rgba(255,132,7,0.3)]'
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
                  <span>{language === 'en' ? `Add ${quantity} Pieces` : `Agregar ${quantity} Piezas`}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notes */}
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
