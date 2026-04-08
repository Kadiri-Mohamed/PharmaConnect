import axios from 'axios';
import { Head } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import Layout from '@/layouts/Layout.jsx';
import type { AxiosError } from 'axios';

interface PharmacyFormState {
    name: string;
    address: string;
    phone: string;
    status_garde: boolean;
}

interface ApiErrorResponse {
    message?: string;
    errors?: Record<string, string[] | string>;
}

export default function MyPharmacyPage() {
    const [form, setForm] = useState<PharmacyFormState>({
        name: '',
        address: '',
        phone: '',
        status_garde: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadPharmacy = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await axios.get('/api/pharmacien/pharmacy', {
                    headers: { Accept: 'application/json' },
                });

                const data = response.data?.data;
                setForm({
                    name: data?.name ?? '',
                    address: data?.address ?? '',
                    phone: data?.phone ?? '',
                    status_garde: Boolean(data?.status_garde),
                });
            } catch (err: unknown) {
                const axiosError = err as AxiosError<ApiErrorResponse>;
                setError(axiosError.response?.data?.message || 'Unable to load pharmacy information.');
            } finally {
                setLoading(false);
            }
        };

        loadPharmacy();
    }, []);

    const onChange = (key: keyof PharmacyFormState, value: string | boolean) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        try {
            const response = await axios.put(
                '/api/pharmacien/pharmacy',
                {
                    name: form.name,
                    address: form.address,
                    phone: form.phone,
                    status_garde: form.status_garde,
                },
                { headers: { Accept: 'application/json' } },
            );

            const data = response.data?.data;
            setForm({
                name: data?.name ?? form.name,
                address: data?.address ?? form.address,
                phone: data?.phone ?? form.phone,
                status_garde: Boolean(data?.status_garde),
            });
            setSuccess('Pharmacy profile updated successfully.');
        } catch (err: unknown) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            const backendErrors = axiosError.response?.data?.errors;
            if (backendErrors) {
                const normalized = Object.fromEntries(
                    Object.entries(backendErrors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)]),
                );
                setFieldErrors(normalized);
            } else {
                setError(axiosError.response?.data?.message || 'Unable to update pharmacy profile.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <Head title="My Pharmacy" />

            <div className="mx-auto max-w-4xl space-y-4">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#2E6E65]">My Pharmacy</h1>
                    <p className="mt-2 text-sm text-slate-600">Manage your pharmacy profile, contact details, and guard status.</p>
                </div>

                {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {loading ? (
                        <p className="text-sm text-slate-500">Loading pharmacy profile...</p>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-5">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#2B3752]">Pharmacy Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => onChange('name', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                                    required
                                />
                                {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#2B3752]">Address</label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => onChange('address', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                                    required
                                />
                                {fieldErrors.address && <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#2B3752]">Phone</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => onChange('phone', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                                    required
                                />
                                {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-[#F4F7ED] p-4">
                                <label className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2B3752]">Pharmacy De Garde</p>
                                        <p className="text-xs text-slate-600">
                                            Toggle this when your pharmacy is currently on guard duty.
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={form.status_garde}
                                        onChange={(e) => onChange('status_garde', e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-[#2E6E65] focus:ring-[#2E6E65]"
                                    />
                                </label>
                                {fieldErrors.status_garde && <p className="mt-2 text-xs text-red-600">{fieldErrors.status_garde}</p>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#285f57] disabled:opacity-60"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
}
