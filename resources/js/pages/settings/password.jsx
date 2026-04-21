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
                <div className="hero-card">
                    <p className="section-kicker">Security Settings</p>
                    <h1 className="mt-2 text-3xl font-semibold">Password Settings</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Keep your account secure by updating your password whenever needed.
                    </p>
                </div>
                <FlashMessages flash={flash} status={status} />
                <form onSubmit={submit} className="page-card-static">
                    <div>
                        <label className="form-label">Current password</label>
                        <input
                            type="password"
                            value={form.current_password}
                            onChange={(event) =>
                                setForm({ ...form, current_password: event.target.value })
                            }
                            className="form-input"
                        />
                        <FormError message={errors.current_password} />
                    </div>
                    <div className="mt-4">
                        <label className="form-label">New password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(event) => setForm({ ...form, password: event.target.value })}
                            className="form-input"
                        />
                        <FormError message={errors.password} />
                    </div>
                    <div className="mt-4">
                        <label className="form-label">Confirm password</label>
                        <input
                            type="password"
                            value={form.password_confirmation}
                            onChange={(event) =>
                                setForm({ ...form, password_confirmation: event.target.value })
                            }
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="btn-primary mt-4" disabled={saving}>
                        {saving ? 'Saving...' : 'Save password'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
