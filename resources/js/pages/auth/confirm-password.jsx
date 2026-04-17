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
                <div className="rounded-lg border bg-white p-6 shadow"><h1 className="text-2xl font-bold">Confirm Password</h1></div>
                <FlashMessages flash={flash} />
                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <label className="block text-sm font-medium">Password</label>
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
                    <FormError message={errors.password} />
                    <button type="submit" className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={loading}>{loading ? 'Confirming...' : 'Confirm password'}</button>
                </form>
            </div>
        </Layout>
    );
}
