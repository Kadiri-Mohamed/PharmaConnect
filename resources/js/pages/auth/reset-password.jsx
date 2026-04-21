import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function ResetPasswordPage({ email = '', token }) {
    const { errors, flash } = usePage().props;
    const [form, setForm] = useState({ email, token, password: '', password_confirmation: '' });
    const [loading, setLoading] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        router.post('/reset-password', form, { onStart: () => setLoading(true), onFinish: () => setLoading(false) });
    };

    return (
        <Layout>
            <Head title="Reset Password" />
            <div className="mx-auto max-w-md space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Account Recovery</p>
                    <h1 className="mt-2 text-3xl font-semibold">Reset Password</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Choose a new password and confirm it to restore access to your account.
                    </p>
                </div>
                <FlashMessages flash={flash} />
                <form onSubmit={submit} className="page-card-static">
                    <div>
                        <label className="form-label">Email</label>
                        <input
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                            className="form-input"
                        />
                        <FormError message={errors.email} />
                    </div>
                    <div className="mt-4">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(event) => setForm({ ...form, password: event.target.value })}
                            className="form-input"
                        />
                        <FormError message={errors.password} />
                    </div>
                    <div className="mt-4">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            value={form.password_confirmation}
                            onChange={(event) =>
                                setForm({ ...form, password_confirmation: event.target.value })
                            }
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
                        {loading ? 'Saving...' : 'Reset password'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
