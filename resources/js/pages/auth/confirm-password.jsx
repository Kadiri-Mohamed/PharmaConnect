import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function ConfirmPasswordPage() {
    const { errors, flash } = usePage().props;
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        router.post('/confirm-password', { password }, { onStart: () => setLoading(true), onFinish: () => setLoading(false) });
    };

    return (
        <Layout>
            <Head title="Confirm Password" />
            <div className="mx-auto max-w-md space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Security Check</p>
                    <h1 className="mt-2 text-3xl font-semibold">Confirm Password</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Confirm your password before continuing with this sensitive action.
                    </p>
                </div>
                <FlashMessages flash={flash} />
                <form onSubmit={submit} className="page-card-static">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="form-input"
                    />
                    <FormError message={errors.password} />
                    <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
                        {loading ? 'Confirming...' : 'Confirm password'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
