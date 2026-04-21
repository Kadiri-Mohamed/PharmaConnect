import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function CreatePharmacyPage() {
    const { errors, flash } = usePage().props;
    const [form, setForm] = useState({ name: '', address: '', phone: '' });
    const [saving, setSaving] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        router.post('/pharmacy', form, { preserveScroll: true, onStart: () => setSaving(true), onFinish: () => setSaving(false) });
    };

    return (
        <Layout>
            <Head title="Create Pharmacy" />

            <div className="space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Pharmacy Setup</p>
                    <h1 className="mt-2 text-3xl font-semibold">Create Pharmacy</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Create your pharmacy profile to start managing medicaments, rare requests, and orders.
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
                    </div>
                    <button type="submit" className="btn-primary mt-4" disabled={saving}>
                        {saving ? 'Saving...' : 'Create pharmacy'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
