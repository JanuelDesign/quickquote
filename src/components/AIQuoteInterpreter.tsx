import React, { useState } from 'react';
import { Sparkles, MessageSquareQuote, ArrowRight, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Product, CartItem, Language } from '../types';
import { interpretCustomerRequest, mapParsedItemsToCart } from '../utils/aiQuoteParser';

interface AIQuoteInterpreterProps {
  catalog: Product[];
  onAddParsedItems: (items: CartItem[], summaryNotes?: string) => void;
  language?: Language;
}

export const AIQuoteInterpreter: React.FC<AIQuoteInterpreterProps> = ({
  catalog,
  onAddParsedItems,
  language = 'en'
}) => {
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastParsedCount, setLastParsedCount] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const samplePrompts = [
    {
      label: '300 sqft piso + 134 ft rodapié + 2 escalones + instalación',
      text: 'Necesito piso 5.5mm, 300 pies, con rodapié 134 pies y 2 escalones, con instalación'
    },
    {
      label: '450 sqft Pulse Shield Moody Gray + 160 LF rodapié',
      text: 'Cotizar 450 pies de Pulse Shield en color Moody Gray y 160 pies de rodapié blanco'
    }
  ];

  const handleInterpret = async () => {
    if (!promptText.trim()) return;

    setIsLoading(true);
    setLastParsedCount(null);

    try {
      const parsedResponse = await interpretCustomerRequest(promptText);
      const { items, summaryNotes } = mapParsedItemsToCart(parsedResponse, catalog);

      if (items.length > 0) {
        onAddParsedItems(items, summaryNotes);
        setLastParsedCount(items.length);
        setTimeout(() => setLastParsedCount(null), 5000);
      } else {
        alert(language === 'en' 
          ? 'No specific items could be detected. Please verify your text.' 
          : 'No se detectaron productos específicos en el texto. Revisa la redacción.');
      }
    } catch (err) {
      console.error('Error interpreting request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E4E2DA] shadow-xs overflow-hidden transition-all">
      {/* Header bar to toggle or show */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-gradient-to-r from-zinc-900 to-[#181818] text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FF8407] text-white flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {language === 'en' ? 'Smart Quote via AI' : 'Pegar Solicitud del Cliente (IA)'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FF8407] text-white uppercase tracking-wider">
                BETA
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {language === 'en' 
                ? 'Paste raw WhatsApp text to generate an editable draft in cart'
                : 'Pega el texto libre de WhatsApp para generar un borrador en el carrito'}
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-md border border-zinc-700 bg-zinc-800/80 font-medium cursor-pointer"
        >
          {isOpen ? (language === 'en' ? 'Hide' : 'Ocultar') : (language === 'en' ? 'Open' : 'Abrir')}
        </button>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-3 bg-[#FAFAFA] border-t border-[#E4E2DA]">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6A63] flex items-center gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#FF8407]" />
              {language === 'en' ? 'Customer message text:' : 'Mensaje o pedido del cliente:'}
            </label>
            <textarea
              id="ai-customer-request-input"
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={language === 'en'
                ? 'e.g., "Need 5.5mm floor, 300 sqft, 134 ft baseboard and 2 stair steps, with installation"'
                : 'Ej: "Necesito piso 5.5mm, 300 pies, con rodapié 134 pies y 2 escalones, con instalación"'
              }
              className="w-full bg-white border border-[#E4E2DA] rounded-xl p-3 text-xs text-[#181818] placeholder:text-[#9C9A90] focus:outline-hidden focus:border-[#FF8407] focus:ring-1 focus:ring-[#FF8407]"
            />
          </div>

          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-[#9C9A90] font-semibold uppercase">
              {language === 'en' ? 'Examples:' : 'Ejemplos rápidos:'}
            </span>
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptText(s.text)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#E4E2DA] hover:border-[#181818] text-[#6B6A63] hover:text-[#181818] transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              id="btn-interpret-request"
              type="button"
              onClick={handleInterpret}
              disabled={isLoading || !promptText.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                isLoading || !promptText.trim()
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-[#FF8407] hover:bg-[#E07300] text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'en' ? 'Interpreting...' : 'Interpretando con IA...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'en' ? 'Interpret Request' : 'Interpretar Solicitud'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {lastParsedCount !== null && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {language === 'en'
                    ? `✓ ${lastParsedCount} items added as an editable draft to the cart.`
                    : `✓ ${lastParsedCount} ítems agregados como borrador editable al carrito.`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
