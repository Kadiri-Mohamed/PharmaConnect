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
        router.patch('/pharmacien/my-pharmacy', form, { preserveScroll: true, onStart: () => setSaving(true), onFinish: () => setSaving(false) });
    };

    return (
        <Layout>
            <Head title="My Pharmacy" />

            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">My Pharmacy</h1>
                    <p className="mt-2 text-sm text-gray-600">Update your pharmacy information with a simple form.</p>
                </div>

                <FlashMessages flash={flash} />

                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <div className="grid gap-4">
                        <div><label className="block text-sm font-medium">Name</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.name} /></div>
                        <div><label className="block text-sm font-medium">Address</label><input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.address} /></div>
                        <div><label className="block text-sm font-medium">Phone</label><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.phone} /></div>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.status_garde} onChange={(event) => setForm({ ...form, status_garde: event.target.checked })} /> De garde</label>
                        <FormError message={errors.status_garde} />
                    </div>
                    <button type="submit" className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={saving}>
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
