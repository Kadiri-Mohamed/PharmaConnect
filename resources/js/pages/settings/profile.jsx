import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function ProfilePage({ status }) {
    const { auth, errors, flash } = usePage().props;
    const [form, setForm] = useState({ name: auth.user?.name || '', email: auth.user?.email || '' });
    const [deletePassword, setDeletePassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const save = (event) => {
        event.preventDefault();
        router.patch('/settings/profile', form, { preserveScroll: true, onStart: () => setSaving(true), onFinish: () => setSaving(false) });
    };

    const destroy = () => {
        if (!window.confirm('Delete your account?')) return;
        router.delete('/settings/profile', { data: { password: deletePassword }, preserveScroll: true, onStart: () => setDeleting(true), onFinish: () => setDeleting(false) });
    };

    return (
        <Layout>
            <Head title="Profile Settings" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow"><h1 className="text-2xl font-bold">Profile Settings</h1></div>
                <FlashMessages flash={flash} status={status} />
                <form onSubmit={save} className="rounded-lg border bg-white p-6 shadow">
                    <div><label className="block text-sm font-medium">Name</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.name} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">Email</label><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.email} /></div>
                    <button type="submit" className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
                </form>
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold">Delete Account</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter your password and confirm deletion.</p>
                    <input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className="mt-4 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Current password" />
                    <FormError message={errors.password} />
                    <button type="button" onClick={destroy} className="mt-4 rounded-lg border px-4 py-2 text-sm" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete account'}</button>
                </div>
            </div>
        </Layout>
    );
}
