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
                <div className="rounded-lg border bg-white p-6 shadow"><h1 className="text-2xl font-bold">Reset Password</h1></div>
                <FlashMessages flash={flash} />
                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <div><label className="block text-sm font-medium">Email</label><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.email} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">Password</label><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.password} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">Confirm Password</label><input type="password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /></div>
                    <button type="submit" className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={loading}>{loading ? 'Saving...' : 'Reset password'}</button>
                </form>
            </div>
        </Layout>
    );
}
