import React, { useState, useEffect } from 'react';
import { 
  Product, 
  ProductColor, 
  ProductCategory, 
  CartItem, 
  Client, 
  Quotation, 
  AppSettings,
  Language 
} from './types';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS, INITIAL_CLIENTS } from './data/initialProducts';
import { 
  createFloorCartItem, 
  createBaseboardCartItem, 
  createProfileCartItem, 
  createStairsCartItem,
  createWallPanelCartItem,
  createUnderlaymentCartItem,
  calculateQuoteTotals, 
  formatCurrency, 
  getValidUntilDate 
} from './utils/calculations';
import { translations } from './utils/translations';

// Components
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { FloorCalculator } from './components/FloorCalculator';
import { BaseboardCalculator } from './components/BaseboardCalculator';
import { ProfilesCalculator } from './components/ProfilesCalculator';
import { StairsCalculator } from './components/StairsCalculator';
import { WallPanelsCalculator } from './components/WallPanelsCalculator';
import { UnderlaymentCalculator } from './components/UnderlaymentCalculator';
import { CartSummary } from './components/CartSummary';
import { CustomProductModal } from './components/CustomProductModal';
import { ClientModal } from './components/ClientModal';
import { QuoteModal } from './components/QuoteModal';
import { PriceListManager } from './components/PriceListManager';
import { QuotesHistoryModal } from './components/QuotesHistoryModal';
import { fetchGoogleSheetsCatalog } from './utils/tsvExporter';
import { getAccessToken } from './services/googleAuth';

import { 
  ShoppingBag, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Sparkles, 
  User
} from 'lucide-react';

export default function App() {
  // Language state (defaults to English 'en' as requested, with instant Spanish toggle)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('qs_app_language');
    if (saved === 'es' || saved === 'en') return saved;
    return 'en';
  });

  const t = translations[language];

  // Persistence state
  const [products, setProducts] = useState<Product[]>(() => {
    const savedVersion = localStorage.getItem('qs_catalog_version');
    if (savedVersion !== 'v2_januel_sync_2026_09_07') {
      localStorage.setItem('qs_catalog_version', 'v2_januel_sync_2026_09_07');
      localStorage.setItem('qs_products_catalog', JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const saved = localStorage.getItem('qs_products_catalog');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('qs_clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CLIENTS;
      }
    }
    return INITIAL_CLIENTS;
  });

  const [currentClient, setCurrentClient] = useState<Client | null>(() => {
    const savedClientId = localStorage.getItem('qs_active_client_id');
    if (savedClientId) {
      const found = clients.find(c => c.id === savedClientId);
      if (found) return found;
    }
    return clients[0] || null;
  });

  const [quotesHistory, setQuotesHistory] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('qs_quotes_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('qs_app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Current Quotation Working State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [includeDelivery, setIncludeDelivery] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('piso');
  const [quoteValidDays, setQuoteValidDays] = useState<number>(settings.defaultValidDays || 3);
  const [salespersonName, setSalespersonName] = useState<string>(() => {
    return localStorage.getItem('qs_salesperson_name') || 'Esteban Gavotti';
  });
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [sameAsBillingAddress, setSameAsBillingAddress] = useState<boolean>(true);

  const handleAddAIParsedItems = (parsedItems: CartItem[]) => {
    setCartItems(prev => [...prev, ...parsedItems]);
    setIsCartOpen(true);
  };

  // Modal open states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isPriceManagerOpen, setIsPriceManagerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Silent background auto-sync from Google Sheets on app load and window focus
  useEffect(() => {
    const syncQuietly = async () => {
      const savedUrl = localStorage.getItem('qs_google_sheet_url');
      const isAuto = localStorage.getItem('qs_google_sheet_autosync') !== 'false';
      const tabName = localStorage.getItem('qs_google_sheet_tab_name') || undefined;
      if (!savedUrl || !isAuto) return;

      try {
        const token = await getAccessToken();
        const res = await fetchGoogleSheetsCatalog(savedUrl, products, tabName, token || undefined);
        if (res && res.updatedProducts && res.updatedProducts.length > 0) {
          setProducts(res.updatedProducts);
          localStorage.setItem('qs_products_catalog', JSON.stringify(res.updatedProducts));
          const now = new Date();
          const nowStr = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${now.toLocaleDateString()}`;
          localStorage.setItem('qs_google_sheet_last_sync', nowStr);
        }
      } catch (err) {
        console.warn('Silent Google Sheet sync:', err);
      }
    };

    syncQuietly();

    const handleWindowFocus = () => {
      syncQuietly();
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('qs_app_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('qs_products_catalog', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('qs_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (currentClient) {
      localStorage.setItem('qs_active_client_id', currentClient.id);
    }
  }, [currentClient]);

  useEffect(() => {
    localStorage.setItem('qs_quotes_history', JSON.stringify(quotesHistory));
  }, [quotesHistory]);

  useEffect(() => {
    localStorage.setItem('qs_app_settings', JSON.stringify(settings));
  }, [settings]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'es' : 'en'));
  };

  // Financial calculations (with 7% tax calculated on Subtotal Products + Delivery)
  const { subtotalProducts, taxableBase, taxAmount, installationTotal, deliveryTotal, total } = calculateQuoteTotals(
    cartItems,
    includeDelivery,
    settings.deliveryFee,
    settings.taxRate
  );

  // Handlers for adding items
  const handleAddFloor = (
    product: Product,
    sqft: number,
    pricePerSqft: number,
    color?: ProductColor,
    notes?: string
  ) => {
    const item = createFloorCartItem(product, sqft, pricePerSqft, color, notes);
    setCartItems(prev => [...prev, item]);
  };

  const handleAddBaseboard = (
    product: Product,
    linearFeet: number,
    pricePerLinearFt: number,
    color?: ProductColor,
    notes?: string
  ) => {
    const item = createBaseboardCartItem(product, linearFeet, pricePerLinearFt, color, notes);
    setCartItems(prev => [...prev, item]);
  };

  const handleAddProfile = (
    product: Product,
    pieceCount: number,
    unitPrice: number,
    color?: ProductColor,
    notes?: string
  ) => {
    const item = createProfileCartItem(product, pieceCount, unitPrice, color, notes);
    setCartItems(prev => [...prev, item]);
  };

  const handleAddStairs = (
    product: Product,
    stepCount: number,
    stepUnitPrice: number,
    includeRiser: boolean,
    riserUnitPrice: number,
    color?: ProductColor,
    notes?: string
  ) => {
    const item = createStairsCartItem(
      product,
      stepCount,
      stepUnitPrice,
      includeRiser,
      riserUnitPrice,
      color,
      notes
    );
    setCartItems(prev => [...prev, item]);
  };

  const handleAddWallPanel = (
    product: Product,
    pieceCount: number,
    unitPrice: number,
    color?: ProductColor,
    notes?: string
  ) => {
    const item = createWallPanelCartItem(product, pieceCount, unitPrice, color, notes);
    setCartItems(prev => [...prev, item]);
  };

  const handleAddUnderlayment = (
    product: Product,
    rollCount: number,
    unitPrice: number,
    notes?: string
  ) => {
    const item = createUnderlaymentCartItem(product, rollCount, unitPrice, notes);
    setCartItems(prev => [...prev, item]);
  };

  const handleAddCustomItem = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  };

  const handleDeleteCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateItemQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        if (item.category === 'piso') {
          return createFloorCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'piso',
              basePrice: item.unitPrice,
              sqftPerBox: item.sqftPerBox || 20,
              priceUnit: 'sqft'
            },
            newQuantity,
            item.unitPrice,
            item.color,
            item.notes
          );
        }
        if (item.category === 'rodapie') {
          return createBaseboardCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'rodapie',
              basePrice: item.unitPrice,
              stripLengthFeet: item.stripLengthFeet || 16,
              priceUnit: 'linear_ft'
            },
            newQuantity,
            item.unitPrice,
            item.color,
            item.notes
          );
        }
        if (item.category === 'perfiles') {
          return createProfileCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'perfiles',
              basePrice: item.unitPrice,
              priceUnit: 'piece'
            },
            newQuantity,
            item.unitPrice,
            item.color,
            item.notes
          );
        }
        if (item.category === 'escalones') {
          return createStairsCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'escalones',
              basePrice: item.unitPrice,
              priceUnit: 'piece'
            },
            newQuantity,
            item.unitPrice,
            item.stepIncludesRiser || false,
            item.riserUnitPrice || 9.00,
            item.color,
            item.notes
          );
        }
        if (item.category === 'wall_panels') {
          return createWallPanelCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'wall_panels',
              basePrice: item.unitPrice,
              priceUnit: 'piece'
            },
            newQuantity,
            item.unitPrice,
            item.color,
            item.notes
          );
        }
        if (item.category === 'underlayment') {
          return createUnderlaymentCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'underlayment',
              basePrice: item.unitPrice,
              priceUnit: 'unit'
            },
            newQuantity,
            item.unitPrice,
            item.notes
          );
        }
        // Custom item update
        const sub = Number((newQuantity * item.unitPrice).toFixed(2));
        return {
          ...item,
          userEnteredQuantity: newQuantity,
          subtotal: sub
        };
      }
      return item;
    }));
  };

  const handleUpdateItemPrice = (itemId: string, newPrice: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        if (item.category === 'piso') {
          return createFloorCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'piso',
              basePrice: newPrice,
              sqftPerBox: item.sqftPerBox || 20,
              priceUnit: 'sqft'
            },
            item.userEnteredQuantity,
            newPrice,
            item.color,
            item.notes
          );
        }
        if (item.category === 'rodapie') {
          return createBaseboardCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'rodapie',
              basePrice: newPrice,
              stripLengthFeet: item.stripLengthFeet || 16,
              priceUnit: 'linear_ft'
            },
            item.userEnteredQuantity,
            newPrice,
            item.color,
            item.notes
          );
        }
        if (item.category === 'perfiles') {
          return createProfileCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'perfiles',
              basePrice: newPrice,
              priceUnit: 'piece'
            },
            item.userEnteredQuantity,
            newPrice,
            item.color,
            item.notes
          );
        }
        if (item.category === 'escalones') {
          return createStairsCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'escalones',
              basePrice: newPrice,
              priceUnit: 'piece'
            },
            item.userEnteredQuantity,
            newPrice,
            item.stepIncludesRiser || false,
            item.riserUnitPrice || 9.00,
            item.color,
            item.notes
          );
        }
        if (item.category === 'wall_panels') {
          return createWallPanelCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'wall_panels',
              basePrice: newPrice,
              priceUnit: 'piece'
            },
            item.userEnteredQuantity,
            newPrice,
            item.color,
            item.notes
          );
        }
        if (item.category === 'underlayment') {
          return createUnderlaymentCartItem(
            {
              id: item.productId,
              name: item.productName,
              category: 'underlayment',
              basePrice: newPrice,
              priceUnit: 'unit'
            },
            item.userEnteredQuantity,
            newPrice,
            item.notes
          );
        }
        const sub = Number((item.userEnteredQuantity * newPrice).toFixed(2));
        return {
          ...item,
          unitPrice: newPrice,
          subtotal: sub
        };
      }
      return item;
    }));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Active Quote object for modal/export
  const activeQuote: Quotation = {
    id: `quote-${Date.now()}`,
    quoteNumber: `QS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    validDays: quoteValidDays,
    validUntil: getValidUntilDate(quoteValidDays),
    client: currentClient || {
      id: 'default',
      name: language === 'en' ? 'General Client' : 'Cliente General',
      phone: '(305) 555-0123',
      createdAt: new Date().toISOString()
    },
    salespersonName: salespersonName,
    salespersonPhone: salespersonName === 'Ruben Valverde' ? '(305) 555-0188' : '(305) 555-0199',
    items: cartItems,
    subtotalProducts,
    taxRate: settings.taxRate,
    taxableBase,
    taxAmount,
    installationTotal,
    includeDelivery,
    deliveryCost: deliveryTotal,
    deliveryTotal,
    total,
    status: 'draft',
    shippingAddress: sameAsBillingAddress ? (currentClient?.address || '') : shippingAddress,
    sameAsBillingAddress,
    createdAt: new Date().toISOString()
  };

  const handleSaveQuoteToHistory = () => {
    setQuotesHistory(prev => [activeQuote, ...prev.filter(q => q.quoteNumber !== activeQuote.quoteNumber)]);
  };

  const handleLoadQuoteFromHistory = (quote: Quotation) => {
    setCartItems(quote.items);
    setIncludeDelivery(quote.includeDelivery);
    setCurrentClient(quote.client);
    setQuoteValidDays(quote.validDays);
    if (quote.shippingAddress) {
      setShippingAddress(quote.shippingAddress);
    }
    if (quote.sameAsBillingAddress !== undefined) {
      setSameAsBillingAddress(quote.sameAsBillingAddress);
    }
  };

  const handleSaveClient = (client: Client) => {
    setClients(prev => {
      const exists = prev.some(c => c.id === client.id);
      if (exists) {
        return prev.map(c => c.id === client.id ? client : c);
      }
      return [client, ...prev];
    });
    setCurrentClient(client);
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    if (currentClient?.id === clientId) {
      setCurrentClient(clients.find(c => c.id !== clientId) || null);
    }
  };

  const categoryItemCounts: Record<ProductCategory, number> = {
    piso: cartItems.filter(i => i.category === 'piso').length,
    rodapie: cartItems.filter(i => i.category === 'rodapie').length,
    perfiles: cartItems.filter(i => i.category === 'perfiles').length,
    escalones: cartItems.filter(i => i.category === 'escalones').length,
    wall_panels: cartItems.filter(i => i.category === 'wall_panels').length,
    underlayment: cartItems.filter(i => i.category === 'underlayment').length,
    otros: cartItems.filter(i => i.category === 'otros').length
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-black flex flex-col font-sans pb-24 lg:pb-10">
      {/* Top Header with Language Switcher, Salesperson and Menu */}
      <Header
        quoteNumber={activeQuote.quoteNumber}
        client={currentClient}
        clientName={currentClient?.name}
        salespersonName={salespersonName}
        onSelectSalesperson={(name) => {
          setSalespersonName(name);
          localStorage.setItem('qs_salesperson_name', name);
        }}
        cartItemsCount={cartItems.length}
        cartTotal={total}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenClientModal={() => setIsClientModalOpen(true)}
        onOpenPriceManager={() => setIsPriceManagerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewQuote={() => setCartItems([])}
        language={language}
        onToggleLanguage={toggleLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Client Banner (100% width, flex-1 min-w-0, no premature truncation) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E4E2DA] shadow-xs w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#181818] text-[#FF8407] flex items-center justify-center font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] shrink-0">
                  {t.quotingFor}:
                </span>
                <span className="text-sm font-bold text-[#181818] truncate">
                  {currentClient?.name || t.unassignedClient}
                </span>
              </div>
              {currentClient?.phone && (
                <p className="text-[11px] text-[#6B6A63] font-mono truncate">
                  Tel: {currentClient.phone} {currentClient.address && `• ${currentClient.address}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-switch-client"
              onClick={() => setIsClientModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-[#E4E2DA] hover:border-[#181818] bg-[#F2F1EC] text-[#181818] text-xs font-bold transition-colors cursor-pointer uppercase tracking-wider"
            >
              {currentClient ? t.changeClient : t.assignClient}
            </button>
            <button
              type="button"
              id="btn-add-other-product"
              onClick={() => setIsCustomModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-[#E4E2DA] hover:border-[#181818] bg-white text-[#6B6A63] hover:text-[#181818] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF8407]" />
              <span>{t.customProductTabBtn}</span>
            </button>
          </div>
        </div>

        {/* 4 Category Tabs */}
        <div>
          <CategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onOpenCustomItem={() => setIsCustomModalOpen(true)}
            itemCounts={categoryItemCounts}
            language={language}
          />
        </div>

        {/* Two-Column Grid: Calculators on Left, Cart Summary on Right (Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calculators Column */}
          <div className="lg:col-span-8 space-y-6">
            {activeCategory === 'piso' && (
              <FloorCalculator
                products={products}
                onAddToCart={handleAddFloor}
                language={language}
              />
            )}

            {activeCategory === 'rodapie' && (
              <BaseboardCalculator
                products={products}
                onAddToCart={handleAddBaseboard}
                language={language}
              />
            )}

            {activeCategory === 'perfiles' && (
              <ProfilesCalculator
                products={products}
                onAddToCart={handleAddProfile}
                language={language}
              />
            )}

            {activeCategory === 'escalones' && (
              <StairsCalculator
                products={products}
                onAddToCart={handleAddStairs}
                language={language}
              />
            )}

            {activeCategory === 'wall_panels' && (
              <WallPanelsCalculator
                products={products}
                onAddToCart={handleAddWallPanel}
                language={language}
              />
            )}

            {activeCategory === 'underlayment' && (
              <UnderlaymentCalculator
                products={products}
                onAddToCart={handleAddUnderlayment}
                language={language}
              />
            )}

            {activeCategory === 'otros' && (
              <div className="bg-white rounded-xl p-8 border border-[#E5E5E5] shadow-2xs text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-black text-[#FF8407] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-black uppercase tracking-wider">
                  {t.customProductTitle}
                </h3>
                <p className="text-xs text-[#8C8C8C] max-w-md mx-auto">
                  {t.customProductSubtitle}
                </p>
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="px-5 py-2.5 bg-[#FF8407] text-white text-xs font-bold rounded-lg hover:bg-[#E07300] transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addToQuote}</span>
                </button>
              </div>
            )}
          </div>

          {/* Cart Column (Sticky Sidebar on Desktop) */}
          <div className="lg:col-span-4 hidden lg:block sticky top-24">
            <CartSummary
              items={cartItems}
              client={currentClient}
              includeDelivery={includeDelivery}
              onToggleDelivery={setIncludeDelivery}
              onDeleteItem={handleDeleteCartItem}
              onUpdateItemQuantity={handleUpdateItemQuantity}
              onUpdateItemPrice={handleUpdateItemPrice}
              onClearCart={handleClearCart}
              onGenerateQuote={() => setIsQuoteModalOpen(true)}
              onOpenClientModal={() => setIsClientModalOpen(true)}
              isOpen={true}
              onClose={() => setIsCartOpen(false)}
              subtotalProducts={subtotalProducts}
              deliveryTotal={deliveryTotal}
              taxableBase={taxableBase}
              taxAmount={taxAmount}
              installationTotal={installationTotal}
              total={total}
              language={language}
            />
          </div>
        </div>
      </main>

      {/* Floating Bottom Bar (Mobile & Desktop Accessible) */}
      <div className="fixed bottom-0 left-0 right-0 p-2.5 sm:p-3 bg-white/95 backdrop-blur-md border-t border-[#E4E2DA] shadow-2xl z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Cart Icon + Badge + Accumulated Total (Entire Left Block is a Single Clickable Trigger) */}
          <button 
            type="button"
            id="btn-bottom-bar-cart"
            onClick={() => setIsCartOpen((prev) => !prev)} 
            className="flex items-center gap-3 cursor-pointer select-none group text-left bg-transparent border-0 p-0 focus:outline-none flex-1 min-w-0"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#181818] group-hover:bg-black text-white flex items-center justify-center transition-colors shadow-xs">
                <ShoppingBag className="w-4 h-4 text-[#FF8407]" />
              </div>
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF8407] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartItems.length}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#9C9A90] uppercase font-bold tracking-wider truncate">
                  {language === 'en' ? 'Cart Total' : 'Total Carrito'} ({cartItems.length} {cartItems.length === 1 ? (language === 'en' ? 'item' : 'ítem') : (language === 'en' ? 'items' : 'ítems')}):
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Price and Chevron on the exact same line, never wrapped */}
                <div className="inline-flex items-center gap-1.5 shrink-0">
                  <span className="text-lg sm:text-xl font-black text-[#181818] font-mono leading-tight whitespace-nowrap">
                    {formatCurrency(total)}
                  </span>
                  {/* Single 18px chevron in brand orange (#FF8407), rotates 180° when cart items are shown */}
                  <ChevronDown 
                    className={`w-[18px] h-[18px] text-[#FF8407] shrink-0 transition-transform duration-300 stroke-[2.5] ${
                      isCartOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
                    }`} 
                  />
                </div>

                {subtotalProducts > 0 && (
                  <span className="text-[10px] text-[#6B6A63] hidden md:inline font-normal truncate">
                    ({language === 'en' ? 'Prod' : 'Prod'}: {formatCurrency(subtotalProducts)} + 7% Tax)
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Siguiente / Next: Review Quote button (sole solid action on this bar) */}
          <div className="flex items-center">
            <button
              type="button"
              id="btn-bottom-bar-next"
              onClick={() => {
                if (cartItems.length > 0) {
                  setIsQuoteModalOpen(true);
                } else {
                  setIsCartOpen(true);
                }
              }}
              disabled={cartItems.length === 0}
              className={`py-2.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer ${
                cartItems.length > 0
                  ? 'bg-[#FF8407] hover:bg-[#E07300] text-white'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <span>{language === 'en' ? 'Next: Review Quote' : 'Siguiente: Ver Cotización'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cart Drawer Overlay (Works on both mobile & desktop when triggered) */}
      {isCartOpen && (
        <CartSummary
          items={cartItems}
          client={currentClient}
          includeDelivery={includeDelivery}
          onToggleDelivery={setIncludeDelivery}
          onDeleteItem={handleDeleteCartItem}
          onUpdateItemQuantity={handleUpdateItemQuantity}
          onUpdateItemPrice={handleUpdateItemPrice}
          onClearCart={handleClearCart}
          onGenerateQuote={() => {
            setIsCartOpen(false);
            setIsQuoteModalOpen(true);
          }}
          onOpenClientModal={() => {
            setIsCartOpen(false);
            setIsClientModalOpen(true);
          }}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          subtotalProducts={subtotalProducts}
          deliveryTotal={deliveryTotal}
          taxableBase={taxableBase}
          taxAmount={taxAmount}
          installationTotal={installationTotal}
          total={total}
          language={language}
        />
      )}

      {/* Modals */}
      <CustomProductModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddItem={handleAddCustomItem}
        language={language}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clients={clients}
        currentClient={currentClient}
        onSelectClient={setCurrentClient}
        onSaveClient={handleSaveClient}
        onDeleteClient={handleDeleteClient}
        quotesHistory={quotesHistory}
        language={language}
      />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        quote={activeQuote}
        settings={settings}
        shippingAddress={shippingAddress}
        onUpdateShippingAddress={setShippingAddress}
        sameAsBillingAddress={sameAsBillingAddress}
        onToggleSameAsBilling={setSameAsBillingAddress}
        onUpdateQuoteDays={setQuoteValidDays}
        onToggleDelivery={setIncludeDelivery}
        onSaveToHistory={handleSaveQuoteToHistory}
        language={language}
      />

      <PriceListManager
        isOpen={isPriceManagerOpen}
        onClose={() => setIsPriceManagerOpen(false)}
        products={products}
        onUpdateProducts={(newProducts) => setProducts(newProducts)}
      />

      <QuotesHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={quotesHistory}
        settings={settings}
        onLoadQuote={handleLoadQuoteFromHistory}
        onDeleteQuote={(id) => setQuotesHistory(prev => prev.filter(q => q.id !== id))}
        onClearHistory={() => setQuotesHistory([])}
        language={language}
      />
    </div>
  );
}
