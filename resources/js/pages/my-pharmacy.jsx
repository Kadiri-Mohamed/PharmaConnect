import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function MyPharmacyPage({ pharmacy }) {
    const { errors, flash } = usePage().props;
    const [form, setForm] = useState({ name: pharmacy?.name || '', address: pharmacy?.address || '', phone: pharmacy?.phone || '', status_garde: Boolean(pharmacy?.status_garde) });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm({ name: pharmacy?.name || '', address: pharmacy?.address || '', phone: pharmacy?.phone || '', status_garde: Boolean(pharmacy?.status_garde) });
    }, [pharmacy]);

    const submit = (event) => {
        event.preventDefault();
        router.patch('/my-pharmacy', form, { preserveScroll: true, onStart: () => setSaving(true), onFinish: () => setSaving(false) });
    };

    return (
        <Layout>
            <Head title="My Pharmacy" />

            <div className="space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Profile Management</p>
                    <h1 className="mt-2 text-3xl font-semibold">My Pharmacy</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Update your pharmacy information and control your on-duty status from one place.
                    </p>
                </div>

                <FlashMessages flash={flash} />

                <form onSubmit={submit} className="page-card-static">
                    <div className="grid gap-4">
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
                            <label className="form-label">Address</label>
                            <input
                                value={form.address}
                                onChange={(event) => setForm({ ...form, address: event.target.value })}
                                className="form-input"
                            />
                            <FormError message={errors.address} />
                        </div>
                        <div>
                            <label className="form-label">Phone</label>
                            <input
                                value={form.phone}
                                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                                className="form-input"
                            />
                            <FormError message={errors.phone} />
                        </div>
                        <label className="flex items-center gap-3 rounded-2xl border border-pharmacy-light/70 bg-pharmacy-light/10 px-4 py-3 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={form.status_garde}
                                onChange={(event) =>
                                    setForm({ ...form, status_garde: event.target.checked })
                                }
                                className="form-checkbox"
                            />
                            De garde
                        </label>
                        <FormError message={errors.status_garde} />
                    </div>
                    <button type="submit" className="btn-primary mt-4" disabled={saving}>
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
