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
                <div className="rounded-lg border bg-white p-6 shadow"><h1 className="text-2xl font-bold">Login</h1></div>
                <FlashMessages flash={flash} status={status} />
                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <div><label className="block text-sm font-medium">Email</label><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.email} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">Password</label><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.password} /></div>
                    <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.remember} onChange={(event) => setForm({ ...form, remember: event.target.checked })} /> Remember me</label>
                    <button type="submit" className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                </form>
            </div>
        </Layout>
    );
}
