import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import Layout from '@/layouts/Layout.jsx';

interface PharmacyFormState {
    name: string;
    address: string;
    phone: string;
    status_garde: boolean;
}

type PageProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};

export default function MyPharmacyPage({ pharmacy }: { pharmacy: PharmacyFormState }) {
    const { flash } = usePage<PageProps>().props;
    const form = useForm<PharmacyFormState>({
        name: pharmacy?.name ?? '',
        address: pharmacy?.address ?? '',
        phone: pharmacy?.phone ?? '',
        status_garde: Boolean(pharmacy?.status_garde),
    });

    useEffect(() => {
        form.setData({
            name: pharmacy?.name ?? '',
            address: pharmacy?.address ?? '',
            phone: pharmacy?.phone ?? '',
            status_garde: Boolean(pharmacy?.status_garde),
        });
    }, [pharmacy]);

    const onChange = (key: keyof PharmacyFormState, value: string | boolean) => {
        form.setData(key, value as never);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        form.patch(route('pharmacien.my-pharmacy.update'), {
            preserveScroll: true,
        });
    };

    return (
        <Layout>
            <Head title="My Pharmacy" />

            <div className="mx-auto max-w-4xl space-y-4">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#2E6E65]">My Pharmacy</h1>
                    <p className="mt-2 text-sm text-slate-600">Manage your pharmacy profile, contact details, and guard status.</p>
                </div>

                {flash?.error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{flash.error}</div>}
                {flash?.success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{flash.success}</div>}

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <form onSubmit={onSubmit} className="space-y-5">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#2B3752]">Pharmacy Name</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => onChange('name', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                                    required
                                />
                                {form.errors.name && <p className="mt-1 text-xs text-red-600">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#2B3752]">Address</label>
                                <input
                                    type="text"
                                    value={form.data.address}
                                    onChange={(e) => onChange('address', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                                    required
                                />
                                {form.errors.address && <p className="mt-1 text-xs text-red-600">{form.errors.address}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#2B3752]">Phone</label>
                                <input
                                    type="text"
                                    value={form.data.phone}
                                    onChange={(e) => onChange('phone', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                                    required
                                />
                                {form.errors.phone && <p className="mt-1 text-xs text-red-600">{form.errors.phone}</p>}
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
                                        checked={form.data.status_garde}
                                        onChange={(e) => onChange('status_garde', e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-[#2E6E65] focus:ring-[#2E6E65]"
                                    />
                                </label>
                                {form.errors.status_garde && <p className="mt-2 text-xs text-red-600">{form.errors.status_garde}</p>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-lg bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#285f57] disabled:opacity-60"
                                >
                                    {form.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                </div>
            </div>
        </Layout>
    );
}
