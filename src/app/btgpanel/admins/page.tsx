"use client";

import { useState, useEffect } from 'react';
import { Shield, UserPlus, Pencil, Trash2, Check, X, Lock, Key, ShieldCheck, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { getAdminsFromFirestore, createAdminInFirestore, updateAdminInFirestore, deleteAdminFromFirestore } from '@/lib/firestore';
import { AdminUser } from '@/types/admin';

const AVAILABLE_PAGES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'customers', label: 'Customers' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'messages', label: 'Messages' },
  { key: 'settings', label: 'Store Settings' },
  { key: 'banners', label: 'Banner Manager' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'logs', label: 'Logs' },
  { key: 'backup', label: 'Backup' },
  { key: 'admins', label: 'Admins Management' },
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [role, setRole] = useState('Staff');
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [allowedPages, setAllowedPages] = useState<string[]>(['dashboard', 'orders', 'products']);

  async function loadAdmins() {
    try {
      setLoading(true);
      const data = await getAdminsFromFirestore();
      setAdmins(data);
    } catch (err) {
      console.error('Error loading admins from Firestore:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  const openCreateModal = () => {
    setEditingAdmin(null);
    setAdminId('');
    setAdminPass('');
    setRole('Staff');
    setIsMainAdmin(false);
    setIsActive(true);
    setAllowedPages(['dashboard', 'orders', 'products']);
    setShowModal(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setAdminId(admin.adminId);
    setAdminPass(admin.adminPass);
    setRole(admin.role || 'Staff');
    setIsMainAdmin(admin.isMainAdmin || false);
    setIsActive(admin.isActive !== false);
    setAllowedPages(admin.allowedPages || []);
    setShowModal(true);
  };

  const togglePagePermission = (pageKey: string) => {
    if (allowedPages.includes(pageKey)) {
      setAllowedPages(allowedPages.filter(p => p !== pageKey));
    } else {
      setAllowedPages([...allowedPages, pageKey]);
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !adminPass.trim() || !role.trim()) {
      alert('Please fill in Admin ID, Password, and Role.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        adminId: adminId.trim(),
        adminPass: adminPass.trim(),
        role: role.trim(),
        isMainAdmin,
        isActive,
        allowedPages: isMainAdmin ? AVAILABLE_PAGES.map(p => p.key) : allowedPages,
      };

      if (editingAdmin) {
        await updateAdminInFirestore(editingAdmin.id, payload);
      } else {
        await createAdminInFirestore(payload);
      }

      setShowModal(false);
      await loadAdmins();
    } catch (err) {
      console.error('Error saving admin to Firestore:', err);
      alert('Failed to save admin to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    try {
      await updateAdminInFirestore(admin.id, { isActive: !admin.isActive });
      setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, isActive: !a.isActive } : a));
    } catch (err) {
      console.error('Error toggling admin active status:', err);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin user from Firestore?')) return;
    try {
      await deleteAdminFromFirestore(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting admin from Firestore:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Management & Roles</h1>
          <p className="text-sm text-gray-400 mt-0.5">{admins.length} admins registered in Firestore</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <UserPlus size={16} /> Add New Admin
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-sm text-blue-900 font-medium">
        <ShieldCheck size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Role-Based Access Control Active</p>
          <p className="text-xs text-blue-800 mt-0.5">
            Admin users added here require their Admin ID & Password to sign in. Page permissions restrict what sections staff members can access.
          </p>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                {['Admin ID', 'Role', 'Access Level', 'Page Permissions', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">Loading admins from Firestore...</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No admins found</td>
                </tr>
              ) : (
                admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold text-sm uppercase">
                          {admin.adminId.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{admin.adminId}</p>
                          <p className="text-[11px] text-gray-400 font-mono">ID: {admin.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {admin.role || 'Staff'}
                    </td>
                    <td className="px-5 py-4">
                      {admin.isMainAdmin ? (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-extrabold">
                          👑 Main Admin (Full Access)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          Custom Role
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {admin.isMainAdmin ? (
                          <span className="text-xs text-purple-600 font-bold">All Pages</span>
                        ) : admin.allowedPages?.length ? (
                          admin.allowedPages.slice(0, 4).map(p => (
                            <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium capitalize">
                              {p}
                            </span>
                          )).concat(admin.allowedPages.length > 4 ? [<span key="more" className="text-[10px] text-gray-400 font-bold">+{admin.allowedPages.length - 4} more</span>] : [])
                        ) : (
                          <span className="text-xs text-red-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleActive(admin)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          admin.isActive !== false
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {admin.isActive !== false ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-primary-600 text-gray-500 transition-colors"
                          title="Edit Admin"
                        >
                          <Pencil size={15} />
                        </button>
                        {!admin.isMainAdmin && (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 transition-colors"
                            title="Delete Admin"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Admin */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAdmin ? 'Edit Admin User' : 'Create New Admin User'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Admin ID *</label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={e => setAdminId(e.target.value)}
                    placeholder="e.g. staff1"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Password *</label>
                  <input
                    type="text"
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="Set password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Role Name *</label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Order Manager, Staff, Manager"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Main Admin Checkbox */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-purple-900 text-sm">👑 Main Admin (Full Access)</p>
                  <p className="text-xs text-purple-700 mt-0.5">Grants unrestricted access to all admin panel features</p>
                </div>
                <input
                  type="checkbox"
                  checked={isMainAdmin}
                  onChange={e => setIsMainAdmin(e.target.checked)}
                  className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>

              {/* Individual Page Permissions (If not Main Admin) */}
              {!isMainAdmin && (
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">Select Accessible Pages:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    {AVAILABLE_PAGES.map(page => (
                      <label key={page.key} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-primary-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={allowedPages.includes(page.key)}
                          onChange={() => togglePagePermission(page.key)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-500 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-gray-800">{page.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-gray-700">Account Active Status</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save to Firestore'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
