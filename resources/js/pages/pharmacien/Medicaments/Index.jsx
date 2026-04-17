import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

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
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Manage Medicaments</h1>
                    <p className="mt-2 text-sm text-gray-600">Use one simple form to create or update medicaments.</p>
                </div>

                <FlashMessages flash={flash} />

                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div><label className="block text-sm font-medium">Name</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.name} /></div>
                        <div><label className="block text-sm font-medium">Description</label><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.description} /></div>
                        <div><label className="block text-sm font-medium">Price</label><input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.price} /></div>
                        <div><label className="block text-sm font-medium">Stock</label><input value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.stock} /></div>
                    </div>
                    <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.requires_prescription} onChange={(event) => setForm({ ...form, requires_prescription: event.target.checked })} /> Requires prescription</label>
                    <div className="mt-4 flex gap-2">
                        <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update medicament' : 'Create medicament'}</button>
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>}
                    </div>
                </form>

                <div className="rounded-lg border bg-white p-6 shadow">
                    {medicaments.length === 0 ? (
                        <p className="text-sm text-gray-600">No medicaments found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-3 py-2">Name</th>
                                        <th className="px-3 py-2">Price</th>
                                        <th className="px-3 py-2">Stock</th>
                                        <th className="px-3 py-2">Prescription</th>
                                        <th className="px-3 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicaments.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="px-3 py-2">{item.name}</td>
                                            <td className="px-3 py-2">${Number(item.price || 0).toFixed(2)}</td>
                                            <td className="px-3 py-2">{item.stock}</td>
                                            <td className="px-3 py-2">{item.requires_prescription ? 'Yes' : 'No'}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => edit(item)} className="rounded-lg border px-3 py-2 text-sm">Edit</button>
                                                    <button type="button" onClick={() => remove(item.id)} className="rounded-lg border px-3 py-2 text-sm" disabled={deletingId === item.id}>{deletingId === item.id ? 'Deleting...' : 'Delete'}</button>
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
