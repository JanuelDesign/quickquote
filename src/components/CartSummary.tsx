import React, { useState } from 'react';
import { CartItem, Client, Language } from '../types';
import { formatCurrency, getItemUnitPriceDetail } from '../utils/calculations';
import { translations } from '../utils/translations';
import { 
  ShoppingBag, 
  Trash2, 
  FileCheck, 
  X,
  Edit2,
  Check,
  User,
  Truck,
  CreditCard
} from 'lucide-react';

interface CartSummaryProps {
  items: CartItem[];
  client?: Client | null;
  includeDelivery: boolean;
  onToggleDelivery: (include: boolean) => void;
  deliveryFee?: number;
  onUpdateDeliveryFee?: (newFee: number) => void;
  payWithCard?: boolean;
  onTogglePayWithCard?: (include: boolean) => void;
  cardFeeAmount?: number;
  onDeleteItem: (itemId: string) => void;
  onUpdateItemQuantity: (itemId: string, newQty: number) => void;
  onUpdateItemPrice: (itemId: string, newPrice: number) => void;
  onClearCart: () => void;
  onGenerateQuote: () => void;
  onOpenClientModal?: () => void;
  isOpen: boolean;
  onClose: () => void;
  subtotalProducts: number;
  deliveryTotal: number;
  taxableBase?: number;
  taxAmount: number;
  installationTotal: number;
  total: number;
  language?: Language;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  client,
  includeDelivery,
  onToggleDelivery,
  deliveryFee = 60,
  onUpdateDeliveryFee,
  payWithCard = false,
  onTogglePayWithCard,
  cardFeeAmount = 0,
  onDeleteItem,
  onUpdateItemQuantity,
  onUpdateItemPrice,
  onClearCart,
  onGenerateQuote,
  onOpenClientModal,
  isOpen,
  onClose,
  subtotalProducts,
  deliveryTotal,
  taxAmount,
  installationTotal,
  total,
  language = 'en'
}) => {
  const t = translations[language];
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>('');
  const [deliveryInput, setDeliveryInput] = useState<string>(Math.max(60, deliveryFee).toString());

  React.useEffect(() => {
    setDeliveryInput(Math.max(60, deliveryFee).toString());
  }, [deliveryFee]);

  const deliveryInputRef = React.useRef<HTMLInputElement>(null);

  const handleDeliveryBlur = () => {
    const parsed = parseFloat(deliveryInput);
    const clamped = isNaN(parsed) || parsed < 60 ? 60 : Number(parsed.toFixed(2));
    setDeliveryInput(clamped.toString());
    if (onUpdateDeliveryFee) {
      onUpdateDeliveryFee(clamped);
    }
  };

  const handleDeliverySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleDeliveryBlur();
    deliveryInputRef.current?.blur();
  };

  const handleStartEditPrice = (item: CartItem) => {
    const currentLang: 'en' | 'es' = language === 'es' ? 'es' : 'en';
    const priceDetail = getItemUnitPriceDetail(item, currentLang);
    setEditingItemId(item.id);
    setEditPriceInput(priceDetail.unitPriceValue.toString());
  };

  const handleSavePrice = (itemId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(editPriceInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateItemPrice(itemId, Number(val.toFixed(2)));
    }
    setEditingItemId(null);
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Cart Container: Sticky Sidebar on Desktop / Slide-over Drawer on Mobile */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#F9F9F9] z-50 shadow-2xl border-l border-[#E5E5E5] flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:h-auto lg:w-full lg:rounded-xl lg:border lg:shadow-xs ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Cart Header with Client Box */}
        <div className="p-5 border-b border-[#E5E5E5] bg-white lg:rounded-t-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C]">
              {t.cartTitle}
            </span>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-[11px] font-bold text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Clear all cart items"
                >
                  {t.clearCart} ({items.length})
                </button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-md hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Client Card */}
          <div 
            onClick={onOpenClientModal}
            className="bg-white border border-[#E5E5E5] p-3 rounded-lg flex items-center justify-between gap-2 cursor-pointer hover:border-black transition-colors shadow-2xs group"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-md bg-black text-[#FF8407] flex items-center justify-center font-bold text-xs shrink-0">
                {client ? client.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-[#FF8407]" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-black block leading-snug break-words">
                    {client ? client.name : t.unassignedClient}
                  </span>
                  {client?.clientType && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F2F1EC] text-[#181818] border border-[#E4E2DA] shrink-0">
                      {client.clientType}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#8C8C8C] leading-snug break-words block mt-0.5">
                  {client?.phone || client?.email || (language === 'en' ? 'Click to select or register client' : 'Click para seleccionar o registrar')}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold text-[#FF8407] group-hover:underline tracking-wider uppercase shrink-0">
              {client ? t.changeClient : t.assignClient}
            </span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[calc(100vh-380px)] lg:max-h-[440px] divide-y divide-[#E5E5E5]">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-lg bg-zinc-200/70 text-zinc-500 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-black uppercase tracking-wider">{t.emptyCartTitle}</p>
              <p className="text-[11px] text-[#8C8C8C] mt-1 max-w-[220px] mx-auto">
                {t.emptyCartSubtitle}
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isEditingPrice = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="pt-3 first:pt-0 space-y-1.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-black text-white shrink-0">
                          {item.category}
                        </span>
                        {item.color && (
                          <span className="text-[9px] font-semibold text-[#FF8407] bg-amber-500/10 px-1.5 py-0.5 rounded border border-[#FF8407]/20 leading-snug break-words">
                            {item.color.name}
                          </span>
                        )}
                        {!item.isTaxable && (
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                            0% Tax (Labor)
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-black mt-1 leading-snug">
                        {item.productName}
                      </h4>

                      <p className="text-[11px] text-[#8C8C8C]">
                        {item.calculatedUnitsLabel}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm text-black font-mono block">
                        {formatCurrency(item.subtotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="text-[#8C8C8C] hover:text-red-600 transition-colors cursor-pointer text-[10px] font-medium inline-flex items-center gap-0.5 mt-0.5"
                        title="Remove item"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t.removeBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* Price adjustment sub-row */}
                  <div className="flex items-center justify-between text-[11px] text-[#8C8C8C] pt-1">
                    {isEditingPrice ? (
                      <form
                        onSubmit={(e) => handleSavePrice(item.id, e)}
                        className="flex items-center gap-1.5"
                      >
                        <span className="font-bold text-[#181818]">$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          enterKeyHint="done"
                          step="0.01"
                          min="0"
                          value={editPriceInput}
                          onChange={(e) => setEditPriceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.keyCode === 13) {
                              e.preventDefault();
                              handleSavePrice(item.id);
                              e.currentTarget.blur();
                            } else if (e.key === 'Escape') {
                              setEditingItemId(null);
                            }
                          }}
                          className="w-20 px-2 py-0.5 text-xs font-bold border border-[#FF8407] rounded bg-white text-[#181818] font-mono outline-none"
                          autoFocus
                        />
                        <span className="text-[10px] font-semibold text-[#6B6A63]">
                          / {getItemUnitPriceDetail(item, language === 'es' ? 'es' : 'en').displayUnit}
                        </span>
                        <button
                          type="submit"
                          className="p-1 bg-black text-white rounded text-[9px] font-bold cursor-pointer hover:bg-zinc-800"
                          title={language === 'en' ? 'Apply price' : 'Aplicar precio'}
                        >
                          <Check className="w-3 h-3 text-[#FF8407]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="p-1 bg-zinc-200 text-zinc-600 rounded text-[9px] font-bold cursor-pointer hover:bg-zinc-300"
                          title={language === 'en' ? 'Cancel' : 'Cancelar'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(() => {
                          const currentLang: 'en' | 'es' = language === 'es' ? 'es' : 'en';
                          const priceDetail = getItemUnitPriceDetail(item, currentLang);
                          return (
                            <span className="text-[11px] text-[#6B6A63]">
                              {currentLang === 'en' ? 'Unit:' : 'Unitario:'}{' '}
                              <strong className="text-black font-mono font-bold text-xs">{priceDetail.primaryRate}</strong>
                              {priceDetail.packagingRate && (
                                <span className="text-[#8C8C8C] ml-1">({priceDetail.packagingRate})</span>
                              )}
                            </span>
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() => handleStartEditPrice(item)}
                          className="text-[#8C8C8C] hover:text-[#FF8407] cursor-pointer p-0.5"
                          title="Edit unit price"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Financial Calculation & Checkout Area */}
        <div className="bg-white border-t border-[#E5E5E5] p-5 lg:rounded-b-xl space-y-3.5">
          <div className="space-y-2">
            {/* Delivery Checkbox + Editable Delivery Amount (Min $60) */}
            <div className={`border p-2.5 rounded-lg transition-colors space-y-2 ${
              includeDelivery ? 'bg-[#FFF6EC] border-[#FF8407]/40' : 'bg-[#F9F9F9] border-[#E5E5E5]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="checkbox-delivery-elegant"
                    checked={includeDelivery}
                    onChange={(e) => onToggleDelivery(e.target.checked)}
                    className="w-4 h-4 accent-[#FF8407] cursor-pointer rounded"
                  />
                  <label htmlFor="checkbox-delivery-elegant" className="text-xs font-bold text-black cursor-pointer flex items-center gap-1.5">
                    <Truck className={`w-3.5 h-3.5 ${includeDelivery ? 'text-[#FF8407]' : 'text-zinc-500'}`} />
                    <span>{language === 'en' ? `Include Delivery (${formatCurrency(Math.max(60, deliveryFee))})` : `Incluir Delivery (${formatCurrency(Math.max(60, deliveryFee))})`}</span>
                  </label>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#8C8C8C]">
                  {language === 'en' ? 'Min $60 • No Tax' : 'Mín $60 • Sin Impuesto'}
                </span>
              </div>

              {includeDelivery && onUpdateDeliveryFee && (
                <form
                  onSubmit={handleDeliverySubmit}
                  className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#FF8407]/20"
                >
                  <span className="text-[11px] font-semibold text-[#6B6A63]">
                    {language === 'en' ? 'Delivery Amount (Min. $60):' : 'Monto de Delivery (Mín. $60):'}
                  </span>
                  <div className="flex items-center gap-1 bg-white border border-[#FF8407] rounded-md pl-2 pr-1 py-0.5">
                    <span className="text-xs font-bold text-[#181818] font-mono">$</span>
                    <input
                      ref={deliveryInputRef}
                      type="number"
                      inputMode="decimal"
                      enterKeyHint="done"
                      min={60}
                      step="5"
                      value={deliveryInput}
                      onChange={(e) => {
                        setDeliveryInput(e.target.value);
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 60) {
                          onUpdateDeliveryFee(Number(val.toFixed(2)));
                        }
                      }}
                      onBlur={handleDeliveryBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.keyCode === 13) {
                          e.preventDefault();
                          handleDeliveryBlur();
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-14 text-xs font-bold font-mono text-right text-[#181818] outline-none bg-transparent py-0.5"
                    />
                    <button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeliverySubmit();
                      }}
                      className="p-1 rounded bg-[#181818] text-[#FF8407] hover:bg-black transition-colors cursor-pointer shrink-0"
                      title={language === 'en' ? 'Apply delivery amount' : 'Aplicar monto de delivery'}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Card Payment Checkbox (+3%) */}
            {onTogglePayWithCard && (
              <div className={`flex items-center justify-between border p-2.5 rounded-lg transition-colors ${
                payWithCard ? 'bg-[#FFF6EC] border-[#FF8407]/40' : 'bg-[#F9F9F9] border-[#E5E5E5]'
              }`}>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="checkbox-card-pay-cart"
                    checked={payWithCard}
                    onChange={(e) => onTogglePayWithCard(e.target.checked)}
                    className="w-4 h-4 accent-[#FF8407] cursor-pointer rounded"
                  />
                  <label htmlFor="checkbox-card-pay-cart" className="text-xs font-bold text-black cursor-pointer flex items-center gap-1.5">
                    <CreditCard className={`w-3.5 h-3.5 ${payWithCard ? 'text-[#FF8407]' : 'text-zinc-500'}`} />
                    <span>{language === 'en' ? 'Pay with Card' : 'Pagar con Tarjeta'}</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#FF8407] text-white">
                      +3%
                    </span>
                  </label>
                </div>
                <span className="text-[10px] text-[#8C8C8C]">
                  {language === 'en' ? 'Debit / Credit' : 'Débito / Crédito'}
                </span>
              </div>
            )}
          </div>

          {/* Breakdown Items */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#8C8C8C]">{t.subtotalProducts}</span>
              <span className="font-semibold text-black font-mono">{formatCurrency(subtotalProducts)}</span>
            </div>

            {includeDelivery && (
              <div className="flex justify-between items-center">
                <span className="text-[#8C8C8C]">{language === 'en' ? 'Delivery (No tax):' : 'Delivery (Sin impuesto):'}</span>
                <span className="font-semibold text-black font-mono">{formatCurrency(deliveryTotal)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-[#8C8C8C]">{language === 'en' ? 'FL Sales Tax (7% on products):' : 'Impuesto (7% solo s/materiales):'}</span>
              </div>
              <span className="font-semibold text-black font-mono">{formatCurrency(taxAmount)}</span>
            </div>

            {installationTotal > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#8C8C8C]">{t.installationServices}</span>
                <span className="font-semibold text-black font-mono">{formatCurrency(installationTotal)}</span>
              </div>
            )}

            {payWithCard && cardFeeAmount > 0 && (
              <div className="flex justify-between items-center gap-2 text-[#FF8407] bg-[#FFF6EC] px-2 py-1 rounded border border-[#FF8407]/20">
                <span className="flex items-center gap-1 font-semibold leading-snug">
                  <CreditCard className="w-3 h-3 text-[#FF8407] shrink-0" />
                  <span>{language === 'en' ? 'Card Surcharge (3% on Total + Tax):' : 'Recargo Tarjeta (3% sobre Total + Impuesto):'}</span>
                </span>
                <span className="font-bold font-mono shrink-0">{formatCurrency(cardFeeAmount)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#E5E5E5] flex justify-between items-baseline">
              <span className="text-xs font-black uppercase tracking-wider text-black">
                {t.estimatedTotal}
              </span>
              <span className="text-xl font-black text-[#FF8407] font-mono">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Primary CTA Button */}
          <button
            type="button"
            id="btn-generate-quote-action"
            onClick={onGenerateQuote}
            disabled={items.length === 0}
            className={`w-full py-3.5 px-4 rounded-lg font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_12px_rgba(255,132,7,0.3)] active:scale-98 ${
              items.length > 0
                ? 'bg-[#FF8407] text-white hover:bg-[#E07300]'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>{t.generatePdfBtn}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
