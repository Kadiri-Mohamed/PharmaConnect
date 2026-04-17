import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function PasswordPage({ status }) {
    const { errors, flash } = usePage().props;
    const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [saving, setSaving] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        router.put('/settings/password', form, { preserveScroll: true, onStart: () => setSaving(true), onFinish: () => setSaving(false) });
    };

    return (
        <Layout>
            <Head title="Password Settings" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow"><h1 className="text-2xl font-bold">Password Settings</h1></div>
                <FlashMessages flash={flash} status={status} />
                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <div><label className="block text-sm font-medium">Current password</label><input type="password" value={form.current_password} onChange={(event) => setForm({ ...form, current_password: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.current_password} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">New password</label><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.password} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">Confirm password</label><input type="password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /></div>
                    <button type="submit" className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={saving}>{saving ? 'Saving...' : 'Save password'}</button>
                </form>
            </div>
        </Layout>
    );
}
