import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function RegisterPage() {
    const { errors, flash } = usePage().props;
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'client' });
    const [loading, setLoading] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        router.post('/register', form, { onStart: () => setLoading(true), onFinish: () => setLoading(false) });
    };

    return (
        <Layout>
            <Head title="Register" />
            <div className="mx-auto max-w-md space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow"><h1 className="text-2xl font-bold">Register</h1></div>
                <FlashMessages flash={flash} />
                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <div><label className="block text-sm font-medium">Name</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.name} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">Email</label><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.email} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">Role</label><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"><option value="client">Client</option><option value="pharmacien">Pharmacist</option></select><FormError message={errors.role} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">Password</label><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><FormError message={errors.password} /></div>
                    <div className="mt-4"><label className="block text-sm font-medium">Confirm Password</label><input type="password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /></div>
                    <button type="submit" className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
                </form>
            </div>
        </Layout>
    );
}
