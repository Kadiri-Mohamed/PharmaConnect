import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function ForgotPasswordPage({ status }) {
    const { errors, flash } = usePage().props;
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        router.post('/forgot-password', { email }, { onStart: () => setLoading(true), onFinish: () => setLoading(false) });
    };

    return (
        <Layout>
            <Head title="Forgot Password" />
            <div className="mx-auto max-w-md space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Account Recovery</p>
                    <h1 className="mt-2 text-3xl font-semibold">Forgot Password</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Enter your email address and we will send you a reset link.
                    </p>
                </div>
                <FlashMessages flash={flash} status={status} />
                <form onSubmit={submit} className="page-card-static">
                    <label className="form-label">Email</label>
                    <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="form-input"
                    />
                    <FormError message={errors.email} />
                    <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
