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
                <div className="hero-card">
                    <p className="section-kicker">Account Settings</p>
                    <h1 className="mt-2 text-3xl font-semibold">Profile Settings</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Update the personal information attached to your account.
                    </p>
                </div>
                <FlashMessages flash={flash} status={status} />
                <form onSubmit={save} className="page-card-static">
                    <div>
                        <label className="form-label">Name</label>
                        <input
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                            className="form-input"
                        />
                        <FormError message={errors.name} />
                    </div>
                    <div className="mt-4">
                        <label className="form-label">Email</label>
                        <input
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                            className="form-input"
                        />
                        <FormError message={errors.email} />
                    </div>
                    <button type="submit" className="btn-primary mt-4" disabled={saving}>
                        {saving ? 'Saving...' : 'Save profile'}
                    </button>
                </form>
                <div className="page-card-static">
                    <h2 className="text-lg font-semibold">Delete Account</h2>
                    <p className="mt-2 text-sm text-slate-600">Enter your password and confirm deletion.</p>
                    <input
                        type="password"
                        value={deletePassword}
                        onChange={(event) => setDeletePassword(event.target.value)}
                        className="form-input"
                        placeholder="Current password"
                    />
                    <FormError message={errors.password} />
                    <button type="button" onClick={destroy} className="btn-danger mt-4" disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete account'}
                    </button>
                </div>
            </div>
        </Layout>
    );
}
