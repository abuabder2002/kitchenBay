'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Plus, Search, Pencil, Trash2, X, Check,
  ChevronLeft, ChevronRight, Layers, Loader2, AlertTriangle, Filter
} from 'lucide-react';

interface Category { id: string; name: string; }
interface Subcategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  categoryId: string;
  createdAt: string;
  category: { id: string; name: string };
  _count: { products: number };
}

const LIMIT = 10;

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Subcategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSubcategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: String(page),
        limit: String(LIMIT),
        ...(filterCategoryId ? { categoryId: filterCategoryId } : {}),
      });
      const res = await fetch(`/api/admin/subcategories?${params}`);
      const data = await res.json();
      setSubcategories(data.subcategories || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      console.error('Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  }, [search, page, filterCategoryId]);

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/admin/categories?limit=100');
    const data = await res.json();
    setCategories(data.categories || []);
  }, []);

  useEffect(() => { fetchSubcategories(); }, [fetchSubcategories]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function openAddModal() {
    setEditingSub(null);
    setFormName('');
    setFormCategoryId(filterCategoryId || '');
    setFormActive(true);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(sub: Subcategory) {
    setEditingSub(sub);
    setFormName(sub.name);
    setFormCategoryId(sub.categoryId);
    setFormActive(sub.isActive);
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) { setFormError('Name is required'); return; }
    if (!formCategoryId) { setFormError('Please select a parent category'); return; }
    setFormLoading(true);
    setFormError('');

    try {
      const url = editingSub ? `/api/admin/subcategories/${editingSub.id}` : '/api/admin/subcategories';
      const method = editingSub ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName.trim(), categoryId: formCategoryId, isActive: formActive }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Failed to save'); return; }
      setModalOpen(false);
      fetchSubcategories();
    } catch {
      setFormError('An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/admin/subcategories/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchSubcategories();
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="text-yellow-400" size={24} /> Subcategories
            </h1>
            <p className="text-blue-300/70 text-sm mt-1">{total} total subcategories</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20"
          >
            <Plus size={18} /> Add Subcategory
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
            <input
              type="text"
              placeholder="Search subcategories..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-blue-950/60 border border-blue-800/50 rounded-xl text-white placeholder:text-blue-400/50 focus:outline-none focus:border-yellow-400/60 transition-colors"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
            <select
              value={filterCategoryId}
              onChange={e => { setFilterCategoryId(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-blue-950/60 border border-blue-800/50 rounded-xl text-white focus:outline-none focus:border-yellow-400/60 transition-colors appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-blue-950/40 border border-blue-800/30 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-800/40 bg-blue-950/60">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Subcategory</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Parent Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Slug</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Products</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center">
                    <Loader2 className="animate-spin text-yellow-400 mx-auto" size={28} />
                  </td></tr>
                ) : subcategories.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-blue-300/50">
                    No subcategories found.
                  </td></tr>
                ) : subcategories.map((sub, i) => (
                  <tr
                    key={sub.id}
                    className={`border-b border-blue-800/20 hover:bg-blue-900/20 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-blue-900/10'}`}
                  >
                    <td className="px-6 py-4 text-white font-medium">{sub.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                        {sub.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-blue-300/70 text-sm font-mono">{sub.slug}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-900/60 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full border border-blue-800/40">
                        {sub._count.products}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sub.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                          <Check size={11} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                          <X size={11} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(sub)} className="p-2 text-blue-300 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(sub)} className="p-2 text-blue-300 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-blue-800/30">
              <p className="text-blue-300/60 text-sm">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 text-blue-300 hover:text-white disabled:opacity-30 hover:bg-blue-800/40 rounded-lg transition-all">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-yellow-400 text-blue-950' : 'text-blue-300 hover:text-white hover:bg-blue-800/40'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 text-blue-300 hover:text-white disabled:opacity-30 hover:bg-blue-800/40 rounded-lg transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-blue-950 to-slate-950 border border-blue-800/50 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-blue-800/30">
                <h2 className="text-lg font-bold text-white">
                  {editingSub ? 'Edit Subcategory' : 'Add New Subcategory'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-blue-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {formError && (
                  <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    <AlertTriangle size={16} /> {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Parent Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={e => setFormCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-blue-900/40 border border-blue-800/50 rounded-xl text-white focus:outline-none focus:border-yellow-400/60 transition-colors appearance-none"
                  >
                    <option value="">Select a category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Subcategory Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Cast Iron Cookwares"
                    className="w-full px-4 py-3 bg-blue-900/40 border border-blue-800/50 rounded-xl text-white placeholder:text-blue-400/40 focus:outline-none focus:border-yellow-400/60 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-200">Active Status</span>
                  <button
                    type="button"
                    onClick={() => setFormActive(v => !v)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${formActive ? 'bg-green-500' : 'bg-blue-800'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${formActive ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-blue-800/50 text-blue-300 hover:text-white hover:border-blue-600 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-4 py-3 rounded-xl transition-all disabled:opacity-70"
                  >
                    {formLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                    {editingSub ? 'Save Changes' : 'Add Subcategory'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-blue-950 to-slate-950 border border-red-800/40 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-400" size={28} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Delete Subcategory?</h2>
              <p className="text-blue-300/70 text-sm mb-6">
                Are you sure you want to delete <span className="text-white font-semibold">&ldquo;{deleteTarget.name}&rdquo;</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-blue-800/50 text-blue-300 hover:text-white rounded-xl transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-70"
                >
                  {deleteLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
