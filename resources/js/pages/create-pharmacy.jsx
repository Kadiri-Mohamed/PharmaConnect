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
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Create Pharmacy</h1>
                    <p className="mt-2 text-sm text-gray-600">Create your pharmacy profile to start managing medicaments and orders.</p>
                </div>

                <FlashMessages flash={flash} />

                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <div className="grid gap-4">
                        <div><label className="block text-sm font-medium">Name</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.name} /></div>
                        <div><label className="block text-sm font-medium">Address</label><input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.address} /></div>
                        <div><label className="block text-sm font-medium">Phone</label><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.phone} /></div>
                    </div>
                    <button type="submit" className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={saving}>
                        {saving ? 'Saving...' : 'Create pharmacy'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
