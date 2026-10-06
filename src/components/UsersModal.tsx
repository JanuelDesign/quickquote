import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, Language } from '../types';
import { 
  subscribeToAllUsers, 
  updateUserProfile, 
  createTeamUserAccount, 
  deleteUserDoc,
  getAuthErrorMessage 
} from '../services/authService';
import { 
  X, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Edit2, 
  Check, 
  UserCheck, 
  Mail, 
  Phone, 
  Shield, 
  Lock, 
  Loader2,
  Users as UsersIcon,
  Settings2,
  Sliders
} from 'lucide-react';

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  language: Language;
}

export const UsersModal: React.FC<UsersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('vendedor');
  const [editPhone, setEditPhone] = useState('');
  const [editCanManageCatalog, setEditCanManageCatalog] = useState(false);
  const [editCanManageUsers, setEditCanManageUsers] = useState(false);

  // New User Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('vendedor');
  const [newPhone, setNewPhone] = useState('');
  const [newCanManageCatalog, setNewCanManageCatalog] = useState(true);
  const [newCanManageUsers, setNewCanManageUsers] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const isEn = language === 'en';

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const unsub = subscribeToAllUsers((userList) => {
      setUsers(userList);
      setIsLoading(false);
    });
    return () => unsub();
  }, [isOpen]);

  const handleStartEdit = (user: UserProfile) => {
    setEditingUserId(user.uid);
    setEditName(user.displayName);
    setEditRole(user.role);
    setEditPhone(user.phone || '');
    setEditCanManageCatalog(user.canManageCatalog !== undefined ? user.canManageCatalog : true);
    setEditCanManageUsers(user.canManageUsers !== undefined ? user.canManageUsers : (user.role === 'admin'));
  };

  const handleRoleChangeInEdit = (role: UserRole) => {
    setEditRole(role);
    if (role === 'admin') {
      setEditCanManageCatalog(true);
      setEditCanManageUsers(true);
    } else {
      setEditCanManageCatalog(true);
    }
  };

  const handleSaveEdit = async (uid: string) => {
    try {
      await updateUserProfile({
        uid,
        displayName: editName.trim(),
        role: editRole,
        phone: editPhone.trim(),
        canManageCatalog: editRole === 'admin' ? true : editCanManageCatalog,
        canManageUsers: editRole === 'admin' ? true : editCanManageUsers
      });
      setEditingUserId(null);
    } catch (err) {
      console.error('Error saving user edit:', err);
    }
  };

  const handleTogglePermission = async (user: UserProfile, perm: 'canManageCatalog' | 'canManageUsers') => {
    const currentVal = perm === 'canManageCatalog' 
      ? (user.canManageCatalog !== undefined ? user.canManageCatalog : true)
      : (user.canManageUsers !== undefined ? user.canManageUsers : user.role === 'admin');
    
    const newVal = !currentVal;
    try {
      await updateUserProfile({
        uid: user.uid,
        [perm]: newVal
      });
    } catch (err) {
      console.error('Error toggling permission:', err);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (user.uid === currentUser.uid) {
      alert(isEn ? 'You cannot delete your own active account.' : 'No puedes eliminar tu propia cuenta activa.');
      return;
    }
    const confirmMsg = isEn 
      ? `Are you sure you want to remove ${user.displayName} (${user.email})?`
      : `¿Estás seguro de eliminar a ${user.displayName} (${user.email})?`;
    if (window.confirm(confirmMsg)) {
      try {
        await deleteUserDoc(user.uid);
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!newEmail.trim() || !newPassword || !newName.trim()) {
      setCreateError(isEn ? 'Please fill in all required fields.' : 'Por favor completa todos los campos requeridos.');
      return;
    }

    if (newPassword.length < 6) {
      setCreateError(isEn ? 'Password must be at least 6 characters.' : 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCreateLoading(true);
    try {
      const catalogPerm = newRole === 'admin' ? true : newCanManageCatalog;
      const usersPerm = newRole === 'admin' ? true : newCanManageUsers;

      await createTeamUserAccount(
        newEmail, 
        newPassword, 
        newName, 
        newRole, 
        newPhone,
        catalogPerm,
        usersPerm
      );

      setCreateSuccess(
        isEn 
          ? `User ${newName} successfully created!` 
          : `¡Usuario ${newName} creado con éxito!`
      );
      // Reset form
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewPhone('');
      setNewRole('vendedor');
      setNewCanManageCatalog(true);
      setNewCanManageUsers(false);
      setIsCreating(false);
      setTimeout(() => setCreateSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error creating user:', err);
      const code = err?.code || '';
      setCreateError(getAuthErrorMessage(code));
    } finally {
      setCreateLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-[#E4E2DA] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E2DA] bg-[#181818] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-[#FF8407] flex items-center justify-center font-bold shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {isEn ? 'Team & User Permissions' : 'Gestión de Usuarios y Permisos'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF8407] text-white uppercase tracking-wider">
                  {isEn ? 'Permissions' : 'Permisos'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {users.length} {isEn ? 'team accounts with granular access control' : 'cuentas del equipo con permisos granulares'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banners */}
        {createSuccess && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{createSuccess}</span>
          </div>
        )}

        {createError && (
          <div className="px-5 py-2.5 bg-red-50 border-b border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
            <X className="w-4 h-4 text-red-600 shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        {/* Top Actions Bar — Stacked in 2 rows */}
        <div className="p-4 sm:p-5 border-b border-[#E4E2DA] bg-[#FAFAFA] flex flex-col gap-3 shrink-0">
          <div className="w-full">
            <span className="text-xs font-bold text-[#181818] block">
              {isEn ? 'QuickSurfaces Sales Team' : 'Equipo Comercial de QuickSurfaces'}
            </span>
            <p className="text-[11px] text-[#6B6A63] mt-0.5 leading-relaxed">
              {isEn 
                ? 'Assign roles and grant Catalog & Price List access independently.' 
                : 'Asigna roles y otorga acceso a Catálogo y Lista de Precios de forma independiente.'}
            </p>
          </div>

          <button
            type="button"
            id="btn-open-create-user"
            onClick={() => {
              setIsCreating(prev => !prev);
              setCreateError(null);
            }}
            className="w-full sm:w-auto sm:self-end px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-[#FF8407]" />
            <span>{isCreating ? (isEn ? 'Cancel' : 'Cancelar') : (isEn ? '+ New User' : '+ Nuevo Usuario')}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F9F9F8]">
          {/* Create User Collapsible Form */}
          {isCreating && (
            <form onSubmit={handleCreateUser} className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DA]">
                <span className="text-xs font-bold text-[#181818] uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#FF8407]" />
                  {isEn ? 'Create Team User Account' : 'Crear Cuenta para Miembro del Equipo'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    {isEn ? 'Full Name' : 'Nombre Completo'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rubén Valverde"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-medium text-[#181818] focus:outline-none focus:border-[#FF8407]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    {isEn ? 'Email' : 'Correo Electrónico'} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ruben@quicksurfaces.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-medium text-[#181818] focus:outline-none focus:border-[#FF8407]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    {isEn ? 'Initial Password' : 'Contraseña Inicial'} *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-medium text-[#181818] focus:outline-none focus:border-[#FF8407]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    {isEn ? 'Phone (Optional)' : 'Teléfono (Opcional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="(305) 555-0188"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-medium text-[#181818] focus:outline-none focus:border-[#FF8407]"
                  />
                </div>

                {/* Role Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6A63] mb-1">
                    {isEn ? 'Base Role' : 'Rol Base'} *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#181818]">
                      <input
                        type="radio"
                        name="new-user-role"
                        value="vendedor"
                        checked={newRole === 'vendedor'}
                        onChange={() => {
                          setNewRole('vendedor');
                          setNewCanManageCatalog(true);
                          setNewCanManageUsers(false);
                        }}
                        className="accent-[#FF8407]"
                      />
                      <span>Vendedor (Cotizaciones, clientes, PDFs)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#181818]">
                      <input
                        type="radio"
                        name="new-user-role"
                        value="admin"
                        checked={newRole === 'admin'}
                        onChange={() => {
                          setNewRole('admin');
                          setNewCanManageCatalog(true);
                          setNewCanManageUsers(true);
                        }}
                        className="accent-[#FF8407]"
                      />
                      <span>Administrador (Acceso total)</span>
                    </label>
                  </div>
                </div>

                {/* Granular Permissions Section */}
                <div className="sm:col-span-2 bg-[#FAFAFA] p-3 rounded-xl border border-[#E4E2DA] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9A90] block">
                    {isEn ? 'Granular Permissions (Independent)' : 'Permisos Granulares Independientes'}
                  </span>
                  
                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newRole === 'admin' ? true : newCanManageCatalog}
                        disabled={newRole === 'admin'}
                        onChange={(e) => setNewCanManageCatalog(e.target.checked)}
                        className="w-4 h-4 accent-[#FF8407] rounded cursor-pointer mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#181818] block leading-tight">
                          {isEn ? 'Access to "Catalog & Price List"' : 'Acceso a "Catálogo & Lista de Precios"'}
                        </span>
                        <span className="text-[10px] text-[#6B6A63]">
                          {isEn 
                            ? 'Allows salesperson to view catalog and add new products (editing existing products is Admin only).' 
                            : 'Permite al vendedor ver el catálogo y agregar nuevos productos (editar o eliminar existentes es solo para Admin).'}
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newRole === 'admin' ? true : newCanManageUsers}
                        disabled={newRole === 'admin'}
                        onChange={(e) => setNewCanManageUsers(e.target.checked)}
                        className="w-4 h-4 accent-[#FF8407] rounded cursor-pointer mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#181818] block leading-tight">
                          {isEn ? 'Access to "User Management"' : 'Acceso a "Gestión de Usuarios"'}
                        </span>
                        <span className="text-[10px] text-[#6B6A63]">
                          {isEn 
                            ? 'Allows creating/editing team accounts and managing permissions.' 
                            : 'Permite crear o editar cuentas del equipo y gestionar permisos de acceso.'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E4E2DA] text-xs font-semibold text-[#6B6A63] hover:bg-[#F2F1EC] transition-colors cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#FF8407] hover:bg-[#E07300] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isEn ? 'Creating...' : 'Creando...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Create Account' : 'Crear Cuenta'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* User List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-[#9C9A90] flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#FF8407]" />
                <span className="text-xs">{isEn ? 'Loading team accounts...' : 'Cargando cuentas del equipo...'}</span>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-[#E4E2DA] text-center space-y-2">
                <p className="text-xs font-semibold text-[#6B6A63]">
                  {isEn ? 'No user profiles found.' : 'No se encontraron perfiles de usuario.'}
                </p>
              </div>
            ) : (
              users.map((u) => {
                const isEditing = editingUserId === u.uid;
                const isSelf = u.uid === currentUser.uid;
                const canCatalog = u.canManageCatalog !== undefined ? u.canManageCatalog : true;
                const canUsers = u.canManageUsers !== undefined ? u.canManageUsers : (u.role === 'admin');

                return (
                  <div
                    key={u.uid}
                    className={`bg-white rounded-xl border p-4 shadow-2xs transition-all ${
                      isSelf ? 'border-amber-300 ring-1 ring-amber-300/40' : 'border-[#E4E2DA] hover:border-black'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DA]">
                          <span className="font-bold text-[#181818]">{u.email}</span>
                          <span className="text-[10px] text-[#9C9A90] font-mono">UID: {u.uid.slice(0, 8)}...</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#6B6A63] mb-1">
                              {isEn ? 'Name' : 'Nombre'}
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3 py-1.5 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-semibold text-[#181818]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#6B6A63] mb-1">
                              {isEn ? 'Role' : 'Rol'}
                            </label>
                            <select
                              value={editRole}
                              onChange={(e) => handleRoleChangeInEdit(e.target.value as UserRole)}
                              className="w-full px-3 py-1.5 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-semibold text-[#181818]"
                            >
                              <option value="vendedor">Vendedor</option>
                              <option value="admin">Administrador (Admin)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#6B6A63] mb-1">
                              {isEn ? 'Phone' : 'Teléfono'}
                            </label>
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="w-full px-3 py-1.5 bg-[#FAFAFA] border border-[#E4E2DA] rounded-lg text-xs font-semibold text-[#181818]"
                            />
                          </div>
                        </div>

                        {/* Granular Permissions Checkboxes in Edit Mode */}
                        <div className="bg-[#FAFAFA] p-3 rounded-lg border border-[#E4E2DA] space-y-2">
                          <span className="text-[10px] font-bold uppercase text-[#9C9A90] block">
                            {isEn ? 'Granular Permissions' : 'Permisos de Acceso'}
                          </span>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editRole === 'admin' ? true : editCanManageCatalog}
                                disabled={editRole === 'admin'}
                                onChange={(e) => setEditCanManageCatalog(e.target.checked)}
                                className="w-4 h-4 accent-[#FF8407] rounded"
                              />
                              <span className="text-xs font-bold text-[#181818]">
                                {isEn ? 'Catalog & Price List' : 'Catálogo & Lista de Precios'}
                              </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editRole === 'admin' ? true : editCanManageUsers}
                                disabled={editRole === 'admin'}
                                onChange={(e) => setEditCanManageUsers(e.target.checked)}
                                className="w-4 h-4 accent-[#FF8407] rounded"
                              />
                              <span className="text-xs font-bold text-[#181818]">
                                {isEn ? 'User Management' : 'Gestión de Usuarios'}
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-3 py-1 rounded-lg border border-[#E4E2DA] text-xs font-semibold text-[#6B6A63] hover:bg-[#F2F1EC] transition-colors cursor-pointer"
                          >
                            {isEn ? 'Cancel' : 'Cancelar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(u.uid)}
                            className="px-3.5 py-1 rounded-lg bg-[#181818] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5 text-[#FF8407]" />
                            <span>{isEn ? 'Save' : 'Guardar'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              u.role === 'admin' ? 'bg-[#181818] text-[#FF8407]' : 'bg-[#F2F1EC] text-[#181818]'
                            }`}>
                              {u.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#181818]">
                                  {u.displayName || 'Sin nombre'}
                                </span>
                                {isSelf && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                                    {isEn ? 'You' : 'Tú'}
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  u.role === 'admin' 
                                    ? 'bg-[#181818] text-[#FF8407]' 
                                    : 'bg-[#F2F1EC] text-[#6B6A63] border border-[#E4E2DA]'
                                }`}>
                                  {u.role === 'admin' ? 'ADMIN' : 'VENDEDOR'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B6A63] mt-0.5">
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                  <Mail className="w-3 h-3 text-[#9C9A90]" />
                                  {u.email}
                                </span>
                                {u.phone && (
                                  <span className="flex items-center gap-1 font-mono text-[11px]">
                                    <Phone className="w-3 h-3 text-[#9C9A90]" />
                                    {u.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(u)}
                              className="p-2 rounded-lg border border-[#E4E2DA] hover:border-[#181818] hover:bg-[#F2F1EC] text-[#6B6A63] hover:text-[#181818] transition-colors cursor-pointer"
                              title={isEn ? 'Edit user profile' : 'Editar perfil de usuario'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-2 rounded-lg border border-[#E4E2DA] hover:border-red-300 hover:bg-red-50 text-[#6B6A63] hover:text-red-600 transition-colors cursor-pointer"
                                title={isEn ? 'Remove user' : 'Eliminar usuario'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Granular Permission Pills with 1-click toggles */}
                        <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-[10px] font-bold uppercase text-[#9C9A90] mr-1">
                            {isEn ? 'Permissions:' : 'Permisos:'}
                          </span>

                          {/* Catálogo & Precios Permission Pill */}
                          <button
                            type="button"
                            onClick={() => u.role !== 'admin' && handleTogglePermission(u, 'canManageCatalog')}
                            disabled={u.role === 'admin'}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
                              canCatalog
                                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'
                            } ${u.role !== 'admin' ? 'cursor-pointer' : 'cursor-default'}`}
                            title={u.role === 'admin' ? 'Admin siempre tiene acceso' : (isEn ? 'Click to toggle Catalog access' : 'Clic para activar/desactivar Catálogo')}
                          >
                            <Settings2 className={`w-3.5 h-3.5 ${canCatalog ? 'text-[#FF8407]' : 'text-zinc-400'}`} />
                            <span>{isEn ? 'Catalog & Prices' : 'Catálogo & Precios'}:</span>
                            <span className={canCatalog ? 'text-[#FF8407] font-black' : 'text-zinc-500'}>
                              {canCatalog ? (isEn ? 'YES' : 'SÍ') : (isEn ? 'NO' : 'NO')}
                            </span>
                          </button>

                          {/* Gestión de Usuarios Permission Pill */}
                          <button
                            type="button"
                            onClick={() => u.role !== 'admin' && handleTogglePermission(u, 'canManageUsers')}
                            disabled={u.role === 'admin'}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
                              canUsers
                                ? 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
                                : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'
                            } ${u.role !== 'admin' ? 'cursor-pointer' : 'cursor-default'}`}
                            title={u.role === 'admin' ? 'Admin siempre tiene acceso' : (isEn ? 'Click to toggle User Management access' : 'Clic para activar/desactivar Usuarios')}
                          >
                            <UsersIcon className={`w-3.5 h-3.5 ${canUsers ? 'text-blue-600' : 'text-zinc-400'}`} />
                            <span>{isEn ? 'User Management' : 'Gestión Usuarios'}:</span>
                            <span className={canUsers ? 'text-blue-600 font-black' : 'text-zinc-500'}>
                              {canUsers ? (isEn ? 'YES' : 'SÍ') : (isEn ? 'NO' : 'NO')}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E4E2DA] bg-white flex items-center justify-between text-xs">
          <span className="text-[#9C9A90] text-[11px]">
            {isEn 
              ? 'Permissions take effect immediately for the user upon next refresh or click.' 
              : 'Los permisos tienen efecto inmediato para el usuario en tiempo real.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#181818] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {isEn ? 'Close' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
