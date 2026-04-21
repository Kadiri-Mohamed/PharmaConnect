import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function LoginPage({ status }) {
    const { errors, flash } = usePage().props;
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [loading, setLoading] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        router.post('/login', form, { onStart: () => setLoading(true), onFinish: () => setLoading(false) });
    };

    return (
        <Layout>
            <Head title="Login" />
            <div className="mx-auto max-w-md space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Welcome Back</p>
                    <h1 className="mt-2 text-3xl font-semibold">Login</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign in to manage orders, prescriptions, and pharmacy activity.
                    </p>
                </div>
                <FlashMessages flash={flash} status={status} />
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
                    <label className="mt-4 flex items-center gap-3 rounded-2xl border border-pharmacy-light/70 bg-pharmacy-light/10 px-4 py-3 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={form.remember}
                            onChange={(event) => setForm({ ...form, remember: event.target.checked })}
                            className="form-checkbox"
                        />
                        Remember me
                    </label>
                    <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
