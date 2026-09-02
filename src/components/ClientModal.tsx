import React, { useState } from 'react';
import { Client, Quotation, Language } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Trash2
} from 'lucide-react';
import { translations } from '../utils/translations';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  currentClient: Client | null;
  onSelectClient: (client: Client) => void;
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  quotesHistory: Quotation[];
  language?: Language;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clients,
  currentClient,
  onSelectClient,
  onSaveClient,
  onDeleteClient,
  quotesHistory,
  language = 'en'
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // New Client Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: Client = {
      id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onSaveClient(newClient);
    onSelectClient(newClient);
    onClose();

    // Reset fields
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setActiveTab('list');
  };

  const getClientQuoteCount = (clientId: string) => {
    return quotesHistory.filter(q => q.client.id === clientId).length;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl w-full max-w-xl shadow-2xl border border-[#E5E5E5] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E5E5] bg-black text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {t.clientsModalTitle}
              </h2>
              <p className="text-[11px] text-[#8C8C8C]">
                {t.clientsModalSubtitle}
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
        <div className="p-3 bg-[#F9F9F9] border-b border-[#E5E5E5] flex gap-2">
          <button
            id="tab-client-list"
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
              activeTab === 'list'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white border border-[#E5E5E5] text-zinc-600 hover:border-black'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#FF8407]" />
            <span>{t.savedTab} ({clients.length})</span>
          </button>

          <button
            id="tab-client-create"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
              activeTab === 'create'
                ? 'bg-[#FF8407] text-white shadow-xs'
                : 'bg-white border border-[#E5E5E5] text-zinc-600 hover:border-black'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.newClientTab}</span>
          </button>
        </div>

        {/* Tab 1: Client List & Search */}
        {activeTab === 'list' ? (
          <div className="p-5 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchClientPlaceholder}
                className="w-full text-xs sm:text-sm bg-[#FAFAFA] border border-[#E5E5E5] focus:border-black rounded-lg pl-9 pr-4 py-2 outline-none font-medium"
              />
            </div>

            {/* Clients scroll area */}
            <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-[#8C8C8C] font-medium">{t.noClientsFound}</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-2 text-xs font-bold text-[#FF8407] hover:underline cursor-pointer uppercase tracking-wider"
                  >
                    {t.registerClientNow}
                  </button>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = currentClient?.id === client.id;
                  const quoteCount = getClientQuoteCount(client.id);

                  return (
                    <div
                      key={client.id}
                      className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-black bg-zinc-50 ring-1 ring-black'
                          : 'border-[#E5E5E5] hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-black text-[#FF8407]' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="truncate">
                          <h4 className="text-xs sm:text-sm font-bold text-black truncate">
                            {client.name}
                          </h4>

                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#8C8C8C] mt-0.5">
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#8C8C8C]" />
                                {client.phone}
                              </span>
                            )}
                            {client.email && (
                              <span className="flex items-center gap-1 truncate max-w-[160px]">
                                <Mail className="w-3 h-3 text-[#8C8C8C]" />
                                {client.email}
                              </span>
                            )}
                          </div>

                          {client.address && (
                            <p className="text-[10px] text-[#8C8C8C] truncate mt-0.5">
                              {client.address}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {quoteCount > 0 && (
                          <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded hidden sm:inline">
                            {quoteCount} {language === 'en' ? 'quotes' : 'cotiz.'}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onSelectClient(client);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#FF8407] text-white'
                              : 'bg-black text-white hover:bg-zinc-800'
                          }`}
                        >
                          {isSelected ? (language === 'en' ? 'Selected' : 'Seleccionado') : (language === 'en' ? 'Assign' : 'Asignar')}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteClient(client.id)}
                          className="p-1.5 text-zinc-300 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                          title="Delete client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Create Client Form */
          <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                {t.clientNameLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Robert Smith / Miami Construction LLC' : 'Ej. Roberto Gómez / Constructora Miami LLC'}
                className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(305) 555-0123"
                  className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                {t.addressLabel}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="8400 NW 36th St, Doral, FL 33166"
                className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                {t.internalNotesLabel}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'en' ? 'e.g. 2nd floor remodel project...' : 'Ej. Proyecto de remodelación 2da planta...'}
                className="w-full text-xs bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer uppercase tracking-wider"
              >
                {language === 'en' ? 'Back' : 'Volver'}
              </button>
              <button
                type="submit"
                id="btn-confirm-save-client"
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#FF8407] text-white hover:bg-[#E07300] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>{t.saveAndAssignBtn}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
