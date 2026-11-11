import React, { useState } from 'react';
import { Client, Quotation, Language, ClientCategory, CLIENT_CATEGORIES, PersonType } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Trash2,
  Tag,
  ChevronDown,
  Edit2,
  Loader2,
  AlertCircle,
  Building2,
  User,
  MapPin
} from 'lucide-react';
import { translations } from '../utils/translations';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  currentClient: Client | null;
  onSelectClient: (client: Client) => void;
  onSaveClient: (client: Client) => Promise<void> | void;
  onDeleteClient: (clientId: string) => Promise<void> | void;
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
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Editing Client state
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form state
  const [personType, setPersonType] = useState<PersonType>('natural');
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [company, setCompany] = useState('N.A.');
  const [clientType, setClientType] = useState<ClientCategory>('Contractor');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetForm = () => {
    setPersonType('natural');
    setName('');
    setLegalName('');
    setCompany('N.A.');
    setClientType('Contractor');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setEditingClient(null);
    setSaveError(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setActiveTab('create');
  };

  const handleStartEdit = (client: Client) => {
    setEditingClient(client);
    setPersonType(client.personType || (client.legalName ? 'juridica' : 'natural'));
    setName(client.name || '');
    setLegalName(client.legalName || '');
    setCompany(client.company || (client.personType === 'juridica' ? '' : 'N.A.'));
    setClientType((client.clientType as ClientCategory) || 'Contractor');
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setAddress(client.address || '');
    setNotes(client.notes || '');
    setSaveError(null);
    setActiveTab('create');
  };

  const handlePersonTypeChange = (type: PersonType) => {
    setPersonType(type);
    if (type === 'natural') {
      if (!company.trim() || company === '') {
        setCompany('N.A.');
      }
    } else {
      if (company === 'N.A.') {
        setCompany('');
      }
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.legalName && c.legalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.clientType && c.clientType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedTypeFilter === 'all' || c.clientType === selectedTypeFilter;

    return matchesSearch && matchesType;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // Mandatory Validations: Nombre, Teléfono, Correo, Compañía, Tipo, Dirección
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedAddress = address.trim();
    let trimmedCompany = company.trim();
    if (personType === 'natural' && (!trimmedCompany || trimmedCompany === '')) {
      trimmedCompany = 'N.A.';
    }

    if (!trimmedName) {
      setSaveError(language === 'en' ? 'Client Name is required.' : 'El Nombre del cliente es obligatorio.');
      return;
    }

    if (personType === 'juridica' && !legalName.trim()) {
      setSaveError(language === 'en' ? 'Legal Name / Business Name is required for Legal Entity.' : 'La Razón Social / Nombre Jurídico es obligatoria para Persona Jurídica.');
      return;
    }

    if (!trimmedPhone) {
      setSaveError(language === 'en' ? 'Phone number is required.' : 'El número de Teléfono es obligatorio.');
      return;
    }

    if (!trimmedEmail) {
      setSaveError(language === 'en' ? 'Email is required.' : 'El Correo Electrónico es obligatorio.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setSaveError(language === 'en' ? 'Please enter a valid email address.' : 'Por favor ingresa un correo electrónico válido (ej. cliente@empresa.com).');
      return;
    }

    if (!trimmedCompany) {
      setSaveError(language === 'en' ? 'Company name is required (use "N.A." for individuals).' : 'El campo Compañía es obligatorio (usa "N.A." para personas naturales).');
      return;
    }

    if (!clientType) {
      setSaveError(language === 'en' ? 'Client Type / Category is required.' : 'El Tipo / Categoría de cliente es obligatorio.');
      return;
    }

    if (!trimmedAddress) {
      setSaveError(language === 'en' ? 'Physical address is required.' : 'La Dirección física / fiscal es obligatoria.');
      return;
    }

    setIsSaving(true);

    // Explicitly clean fields: strings are trimmed, no undefined properties
    const clientToSave: Client = {
      id: editingClient?.id || `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      personType,
      legalName: personType === 'juridica' ? (legalName.trim() || trimmedName) : undefined,
      clientType: clientType,
      phone: trimmedPhone,
      email: trimmedEmail,
      company: trimmedCompany,
      address: trimmedAddress,
      notes: notes.trim() || '',
      createdAt: editingClient?.createdAt || new Date().toISOString()
    };

    try {
      await onSaveClient(clientToSave);
      onSelectClient(clientToSave);
      resetForm();
      setActiveTab('list');
      onClose();
    } catch (err: any) {
      console.error('Error saving client to cloud:', err);
      setSaveError(
        language === 'en'
          ? `Could not save client to cloud: ${err?.message || 'Check connection'}`
          : `No se pudo guardar el cliente en la nube: ${err?.message || 'Verifica la conexión'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const handleDeleteWithConfirm = (client: Client) => {
    setClientToDelete(client);
  };

  const executeDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      await onDeleteClient(clientToDelete.id);
      setClientToDelete(null);
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  const getClientQuoteCount = (clientId: string) => {
    return quotesHistory.filter(q => q.client.id === clientId).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto pt-3 sm:pt-4">
      <div 
        className="bg-white rounded-xl w-full max-w-xl shadow-2xl border border-[#E5E5E5] overflow-hidden my-0 sm:my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] bg-black text-white flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide leading-tight">
                  {t.clientsModalTitle}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{language === 'en' ? 'Synced' : 'Sincronizado'}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C] mt-1 leading-relaxed">
                {t.clientsModalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-zinc-800 text-[#8C8C8C] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-3 bg-[#F9F9F9] border-b border-[#E5E5E5] flex flex-wrap gap-2">
          <button
            id="tab-client-list"
            onClick={() => {
              setActiveTab('list');
              setSaveError(null);
            }}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
              activeTab === 'list'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white border border-[#E5E5E5] text-zinc-600 hover:border-black'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#FF8407] shrink-0" />
            <span>{t.savedTab} ({clients.length})</span>
          </button>

          <button
            id="tab-client-create"
            onClick={handleStartCreate}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
              activeTab === 'create'
                ? 'bg-[#FF8407] text-white shadow-xs'
                : 'bg-white border border-[#E5E5E5] text-zinc-600 hover:border-black'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span>{editingClient ? (language === 'en' ? 'Edit Client' : 'Editar Cliente') : t.newClientTab}</span>
          </button>
        </div>

        {/* Tab 1: Client List & Search */}
        {activeTab === 'list' ? (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Search bar & Type filter */}
            <div className="space-y-2.5">
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

              {/* Quick filter pills by client type */}
              <div className="pill-scroll-row gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer text-[10px] uppercase tracking-wider shrink-0 ${
                    selectedTypeFilter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-[#F2F1EC] text-zinc-600 hover:text-black hover:bg-zinc-200'
                  }`}
                >
                  {language === 'en' ? 'All' : 'Todos'} ({clients.length})
                </button>
                {CLIENT_CATEGORIES.map((cat) => {
                  const count = clients.filter(c => c.clientType === cat).length;
                  if (count === 0 && selectedTypeFilter !== cat) return null;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedTypeFilter(selectedTypeFilter === cat ? 'all' : cat)}
                      className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer text-[10px] flex items-center gap-1 shrink-0 ${
                        selectedTypeFilter === cat
                          ? 'bg-[#FF8407] text-white'
                          : 'bg-[#F2F1EC] text-zinc-700 hover:text-black hover:bg-zinc-200'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clients scroll area */}
            <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-[#8C8C8C] font-medium">{t.noClientsFound}</p>
                  <button
                    onClick={handleStartCreate}
                    className="mt-2 text-xs font-bold text-[#FF8407] hover:underline cursor-pointer uppercase tracking-wider"
                  >
                    {t.registerClientNow}
                  </button>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = currentClient?.id === client.id;
                  const quoteCount = getClientQuoteCount(client.id);
                  const isJuridica = client.personType === 'juridica' || Boolean(client.legalName);

                  return (
                    <div
                      key={client.id}
                      className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-black bg-zinc-50 ring-1 ring-black'
                          : 'border-[#E5E5E5] hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-black text-[#FF8407]' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {isJuridica ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-black leading-snug break-words">
                              {client.name}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isJuridica 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}>
                              {isJuridica ? (language === 'en' ? 'Legal Entity' : 'P. Jurídica') : (language === 'en' ? 'Individual' : 'P. Natural')}
                            </span>
                            {client.clientType && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                client.clientType === 'Homeowner'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-[#F2F1EC] text-[#181818] border-[#E4E2DA]'
                              }`}>
                                {client.clientType}
                                {client.clientType === 'Homeowner' && ' (+30%)'}
                              </span>
                            )}
                          </div>

                          {/* Company / Legal Name display */}
                          <div className="text-[11px] text-zinc-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            {client.company && client.company !== 'N.A.' && (
                              <span className="font-semibold text-zinc-800 flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span>{client.company}</span>
                              </span>
                            )}
                            {client.legalName && client.legalName !== client.name && (
                              <span className="text-zinc-500 text-[10px]">
                                (Razón Social: {client.legalName})
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#8C8C8C]">
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#8C8C8C] shrink-0" />
                                <span>{client.phone}</span>
                              </span>
                            )}
                            {client.email && (
                              <span className="flex items-center gap-1 min-w-0 break-all">
                                <Mail className="w-3 h-3 text-[#8C8C8C] shrink-0" />
                                <span>{client.email}</span>
                              </span>
                            )}
                          </div>

                          {client.address && (
                            <p className="text-[10px] text-[#8C8C8C] leading-snug break-words flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span>{client.address}</span>
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
                          onClick={() => handleStartEdit(client)}
                          className="p-1.5 text-zinc-400 hover:text-black rounded-md transition-colors cursor-pointer"
                          title={language === 'en' ? 'Edit client' : 'Editar cliente'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteWithConfirm(client)}
                          className="p-1.5 text-zinc-300 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                          title={language === 'en' ? 'Delete client' : 'Eliminar cliente'}
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
          /* Tab 2: Create / Edit Client Form */
          <form onSubmit={handleCreateSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {editingClient && (
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-xs font-medium text-orange-800 flex items-center justify-between">
                <span>{language === 'en' ? `Editing: ${editingClient.name}` : `Editando: ${editingClient.name}`}</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[10px] font-bold uppercase underline cursor-pointer text-orange-900"
                >
                  {language === 'en' ? 'Cancel Edit' : 'Cancelar Edición'}
                </button>
              </div>
            )}

            {saveError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="flex-1">{saveError}</span>
              </div>
            )}

            {/* Persona Natural vs Persona Jurídica Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1.5">
                {language === 'en' ? 'Person Type *' : 'Tipo de Persona *'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePersonTypeChange('natural')}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    personType === 'natural'
                      ? 'border-black bg-black text-white shadow-xs'
                      : 'border-[#E5E5E5] bg-white text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  <User className="w-4 h-4 text-[#FF8407]" />
                  <span>{language === 'en' ? 'Natural Person' : 'Persona Natural'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePersonTypeChange('juridica')}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    personType === 'juridica'
                      ? 'border-black bg-black text-white shadow-xs'
                      : 'border-[#E5E5E5] bg-white text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#FF8407]" />
                  <span>{language === 'en' ? 'Legal Entity' : 'Persona Jurídica'}</span>
                </button>
              </div>
            </div>

            {/* Name Fields according to Person Type */}
            {personType === 'natural' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                    {language === 'en' ? 'Full Name *' : 'Nombre Completo *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Roberto Gomez' : 'Ej. Roberto Gómez'}
                    className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1 flex items-center justify-between">
                    <span>{language === 'en' ? 'Company *' : 'Compañía / Empresa *'}</span>
                    <span className="text-[10px] text-zinc-400 font-normal lowercase">{language === 'en' ? 'defaults to N.A.' : 'usa N.A. si no aplica'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="N.A."
                    className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-medium"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                    {language === 'en' ? 'Legal / Registered Business Name *' : 'Razón Social / Nombre Jurídico *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Constructora San Carlos LLC' : 'Ej. Constructora San Carlos LLC'}
                    className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      {language === 'en' ? 'Trade Name / Company *' : 'Nombre Comercial / Compañía *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={language === 'en' ? 'e.g. San Carlos Builders' : 'Ej. San Carlos Builders'}
                      className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                      {language === 'en' ? 'Contact Representative *' : 'Contacto / Representante *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'en' ? 'e.g. Carlos Mendoza (Manager)' : 'Ej. Carlos Mendoza (Gerente)'}
                      className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Client Category / Segment Dropdown */}
            <div>
              <label 
                htmlFor="client-category-select" 
                className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] flex items-center justify-between mb-1"
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#FF8407]" />
                  <span>{t.clientTypeLabel} *</span>
                </div>
                {clientType === 'Homeowner' ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {language === 'en' ? 'Applies +30% Retail margin' : 'Aplica recargo automático +30% Retail'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {language === 'en' ? 'Base Contractor price' : 'Precio Base Contratista'}
                  </span>
                )}
              </label>

              <div className="relative">
                <select
                  id="client-category-select"
                  required
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value as ClientCategory)}
                  className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2.5 outline-none font-semibold text-[#181818] appearance-none cursor-pointer pr-10 shadow-2xs transition-colors hover:border-[#CCCCCC]"
                >
                  {CLIENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="font-medium text-black py-1">
                      {cat} {cat === 'Homeowner' ? '(+30% Retail)' : '(Base)'}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                  {t.phoneLabel} *
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
                  {t.emailLabel} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@empresa.com"
                  className="w-full text-xs sm:text-sm bg-white border border-[#E5E5E5] focus:border-black rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#8C8C8C] block mb-1">
                {t.addressLabel} *
              </label>
              <input
                type="text"
                required
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
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer uppercase tracking-wider"
              >
                {language === 'en' ? 'Back' : 'Volver'}
              </button>
              <button
                type="submit"
                id="btn-confirm-save-client"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#FF8407] text-white hover:bg-[#E07300] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{language === 'en' ? 'Saving...' : 'Guardando...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editingClient ? (language === 'en' ? 'Update & Assign' : 'Actualizar y Asignar') : t.saveAndAssignBtn}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* In-app Confirmation Modal for Deleting Client */}
      {clientToDelete && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#E4E2DA] space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181818]">
                {language === 'en' ? 'Delete Client?' : '¿Eliminar cliente?'}
              </h3>
              <p className="text-xs text-[#6B6A63] mt-1.5 leading-relaxed">
                {language === 'en'
                  ? `Are you sure you want to delete client "${clientToDelete.name}"?`
                  : `¿Estás seguro de eliminar al cliente "${clientToDelete.name}"?`}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E4E2DA] bg-white hover:bg-[#F2F1EC] text-xs font-bold text-[#181818] transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={executeDeleteClient}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                {language === 'en' ? 'Delete' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
