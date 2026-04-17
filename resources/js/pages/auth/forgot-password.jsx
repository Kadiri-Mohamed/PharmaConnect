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
                <div className="rounded-lg border bg-white p-6 shadow"><h1 className="text-2xl font-bold">Forgot Password</h1></div>
                <FlashMessages flash={flash} status={status} />
                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <label className="block text-sm font-medium">Email</label>
                    <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
                    <FormError message={errors.email} />
                    <button type="submit" className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
                </form>
            </div>
        </Layout>
    );
}
