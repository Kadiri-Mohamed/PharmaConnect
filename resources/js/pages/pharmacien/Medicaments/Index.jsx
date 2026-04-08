import axios from 'axios';
import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import MedicamentForm, { defaultMedicamentValues } from '@/components/pharmacien/MedicamentForm.jsx';
import Layout from '@/layouts/Layout.jsx';

const initialPagination = {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
};
const PER_PAGE = 10;

export default function PharmacienMedicamentsIndex() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [medicaments, setMedicaments] = useState([]);
    const [pagination, setPagination] = useState(initialPagination);
    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingMedicament, setEditingMedicament] = useState(null);
    const [formValues, setFormValues] = useState(defaultMedicamentValues);
    const [formErrors, setFormErrors] = useState({});

    const isEditing = Boolean(editingMedicament);

    const fetchMedicaments = useCallback(async (page = 1) => {
        setLoading(true);
        setErrorMessage('');

        try {
            const params = { page, per_page: PER_PAGE };
            if (search.trim()) params.search = search.trim();
            if (stockFilter === 'in_stock' || stockFilter === 'out_of_stock') params.stock = stockFilter;

            const res = await axios.get('/api/pharmacien/medicaments', {
                params,
                headers: { Accept: 'application/json' },
            });

            setMedicaments(res.data?.data ?? []);
            setPagination(res.data?.pagination ?? initialPagination);
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Unable to load medicaments.');
        } finally {
            setLoading(false);
        }
    }, [search, stockFilter]);

    useEffect(() => {
        if (!user) return;

        if (user.role !== 'pharmacien') {
            router.visit('/dashboard');
            return;
        }

        fetchMedicaments(1);
    }, [user, fetchMedicaments]);

    const resetForm = () => {
        setFormValues(defaultMedicamentValues);
        setFormErrors({});
        setEditingMedicament(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (medicament) => {
        setEditingMedicament(medicament);
        setFormValues({
            name: medicament.name ?? '',
            description: medicament.description ?? '',
            price: String(medicament.price ?? ''),
            stock: String(medicament.stock ?? ''),
            requires_prescription: Boolean(medicament.requires_prescription),
        });
        setFormErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const setField = (field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        const errors = {};

        if (!formValues.name.trim()) {
            errors.name = 'Name is required.';
        }

        const price = Number(formValues.price);
        if (!formValues.price || Number.isNaN(price) || price <= 0) {
            errors.price = 'Price must be a positive number.';
        }

        const stock = Number(formValues.stock);
        if (formValues.stock === '' || Number.isNaN(stock) || stock < 0) {
            errors.stock = 'Stock must be zero or a positive integer.';
        }

        return errors;
    };

    const submitForm = async (event) => {
        event.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        setProcessing(true);
        setFormErrors({});

        const payload = {
            name: formValues.name.trim(),
            description: formValues.description?.trim() || null,
            price: Number(formValues.price),
            stock: Number(formValues.stock),
            requires_prescription: Boolean(formValues.requires_prescription),
        };

        try {
            if (isEditing && editingMedicament) {
                await axios.put(`/api/pharmacien/medicaments/${editingMedicament.id}`, payload, {
                    headers: { Accept: 'application/json' },
                });
                setSuccessMessage('Medicament updated successfully.');
            } else {
                await axios.post('/api/pharmacien/medicaments', payload, {
                    headers: { Accept: 'application/json' },
                });
                setSuccessMessage('Medicament created successfully.');
            }

            closeModal();
            await fetchMedicaments(pagination.current_page);
        } catch (error) {
            const responseErrors = error?.response?.data?.errors ?? null;
            if (responseErrors) {
                const flatErrors = Object.fromEntries(
                    Object.entries(responseErrors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)]),
                );
                setFormErrors(flatErrors);
            } else {
                setErrorMessage(error?.response?.data?.message || 'Unable to save medicament.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (medicament) => {
        const confirmed = window.confirm(`Delete "${medicament.name}"? This action cannot be undone.`);
        if (!confirmed) return;

        setProcessing(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await axios.delete(`/api/pharmacien/medicaments/${medicament.id}`, {
                headers: { Accept: 'application/json' },
            });
            setSuccessMessage('Medicament deleted successfully.');
            await fetchMedicaments(pagination.current_page);
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Unable to delete medicament.');
        } finally {
            setProcessing(false);
        }
    };

    const lowStockCount = useMemo(() => medicaments.filter((m) => Number(m.stock) < 5).length, [medicaments]);

    return (
        <Layout>
            <Head title="Manage Medicaments" />

            <div className="space-y-6">
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#2E6E65]">Manage Medicaments</h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {pagination.total} medicament(s) - {lowStockCount} low stock item(s)
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white hover:bg-[#449b48]"
                        >
                            Add Medicament
                        </button>
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name..."
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                        />
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                        >
                            <option value="all">All</option>
                            <option value="in_stock">In stock</option>
                            <option value="out_of_stock">Out of stock</option>
                        </select>
                        <button
                            type="button"
                            onClick={() => fetchMedicaments(1)}
                            className="rounded-lg bg-[#2E6E65] px-3 py-2 text-sm font-semibold text-white hover:bg-[#285f57]"
                        >
                            Apply Filters
                        </button>
                    </div>
                </section>

                {successMessage && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}
                {errorMessage && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}

                <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center text-sm text-slate-500">Loading medicaments...</div>
                    ) : medicaments.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-sm font-medium text-slate-700">No medicaments found.</p>
                            <p className="mt-1 text-xs text-slate-500">Create your first medicament to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-[#F4F7ED] text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Stock</th>
                                        <th className="px-4 py-3">Prescription Required</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicaments.map((medicament) => (
                                        <tr key={medicament.id} className="border-t border-slate-100">
                                            <td className="px-4 py-3 font-medium text-[#2B3752]">{medicament.name}</td>
                                            <td className="px-4 py-3 text-slate-700">${Number(medicament.price ?? 0).toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                {Number(medicament.stock) < 5 ? (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                        {medicament.stock} (Low)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                        {medicament.stock}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{medicament.requires_prescription ? 'Yes' : 'No'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(medicament)}
                                                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(medicament)}
                                                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                                        disabled={processing}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm text-slate-600">
                        Page {pagination.current_page} of {pagination.last_page}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={pagination.current_page <= 1 || loading}
                            onClick={() => fetchMedicaments(pagination.current_page - 1)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            disabled={pagination.current_page >= pagination.last_page || loading}
                            onClick={() => fetchMedicaments(pagination.current_page + 1)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </section>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-[#2B3752]">{isEditing ? 'Edit Medicament' : 'Create Medicament'}</h2>
                            <button type="button" onClick={closeModal} className="text-sm text-slate-500 hover:text-slate-700">
                                Close
                            </button>
                        </div>

                        <MedicamentForm
                            values={formValues}
                            errors={formErrors}
                            processing={processing}
                            submitLabel={isEditing ? 'Update Medicament' : 'Create Medicament'}
                            onChange={setField}
                            onSubmit={submitForm}
                            onCancel={closeModal}
                        />
                    </div>
                </div>
            )}
        </Layout>
    );
}
