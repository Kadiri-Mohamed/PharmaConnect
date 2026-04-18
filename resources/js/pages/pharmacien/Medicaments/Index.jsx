import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';
import {
    formatCurrency,
    getPrescriptionRequirementBadgeClass,
    getStockBadgeClass,
} from '@/utils/ui.js';

const emptyForm = { name: '', description: '', price: '', stock: '', requires_prescription: false };

export default function PharmacienMedicamentsPage({ medicaments = [] }) {
    const { errors, flash } = usePage().props;
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const submit = (event) => {
        event.preventDefault();
        const url = editingId ? `/pharmacien/medicaments/${editingId}` : '/pharmacien/medicaments';
        const method = editingId ? 'put' : 'post';
        router[method](url, form, { preserveScroll: true, onStart: () => setSaving(true), onSuccess: () => { setForm(emptyForm); setEditingId(null); }, onFinish: () => setSaving(false) });
    };

    const edit = (item) => {
        setEditingId(item.id);
        setForm({ name: item.name || '', description: item.description || '', price: item.price || '', stock: item.stock || '', requires_prescription: Boolean(item.requires_prescription) });
    };

    const remove = (id) => {
        if (!window.confirm('Delete this medicament?')) return;
        router.delete(`/pharmacien/medicaments/${id}`, { preserveScroll: true, onStart: () => setDeletingId(id), onFinish: () => setDeletingId(null) });
    };

    return (
        <Layout>
            <Head title="Manage Medicaments" />

            <div className="space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Inventory Control</p>
                    <h1 className="mt-2 text-3xl font-semibold">Manage Medicaments</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Create, edit, and review your medicament catalog with a cleaner inventory workflow.
                    </p>
                </div>

                <FlashMessages flash={flash} />

                <form onSubmit={submit} className="page-card-static">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="form-label">Name</label>
                            <input
                                value={form.name}
                                onChange={(event) => setForm({ ...form, name: event.target.value })}
                                className="form-input"
                            />
                            <FormError message={errors.name} />
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            <input
                                value={form.description}
                                onChange={(event) =>
                                    setForm({ ...form, description: event.target.value })
                                }
                                className="form-input"
                            />
                            <FormError message={errors.description} />
                        </div>
                        <div>
                            <label className="form-label">Price</label>
                            <input
                                value={form.price}
                                onChange={(event) => setForm({ ...form, price: event.target.value })}
                                className="form-input"
                            />
                            <FormError message={errors.price} />
                        </div>
                        <div>
                            <label className="form-label">Stock</label>
                            <input
                                value={form.stock}
                                onChange={(event) => setForm({ ...form, stock: event.target.value })}
                                className="form-input"
                            />
                            <FormError message={errors.stock} />
                        </div>
                    </div>
                    <label className="mt-4 flex items-center gap-3 rounded-2xl border border-pharmacy-light/70 bg-pharmacy-light/10 px-4 py-3 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={form.requires_prescription}
                            onChange={(event) =>
                                setForm({ ...form, requires_prescription: event.target.checked })
                            }
                            className="form-checkbox"
                        />
                        Requires prescription
                    </label>
                    <div className="mt-4 flex gap-2">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : editingId ? 'Update medicament' : 'Create medicament'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setForm(emptyForm);
                                }}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <div className="table-card">
                    {medicaments.length === 0 ? (
                        <p className="px-6 py-5 text-sm text-slate-500">No medicaments found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="table-head">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Name</th>
                                        <th className="px-4 py-3 font-semibold">Price</th>
                                        <th className="px-4 py-3 font-semibold">Stock</th>
                                        <th className="px-4 py-3 font-semibold">Prescription</th>
                                        <th className="px-4 py-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicaments.map((item) => (
                                        <tr key={item.id} className="table-row">
                                            <td className="px-4 py-3 font-medium text-pharmacy-deepest">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-pharmacy-dark">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={getStockBadgeClass(item.stock)}>
                                                    Stock {item.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={getPrescriptionRequirementBadgeClass(
                                                        item.requires_prescription,
                                                    )}
                                                >
                                                    {item.requires_prescription ? 'Required' : 'Not required'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => edit(item)}
                                                        className="btn-secondary"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(item.id)}
                                                        className="btn-danger"
                                                        disabled={deletingId === item.id}
                                                    >
                                                        {deletingId === item.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
