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
                <div className="hero-card">
                    <p className="section-kicker">New Account</p>
                    <h1 className="mt-2 text-3xl font-semibold">Register</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Create a client or pharmacist account and start using the platform right away.
                    </p>
                </div>
                <FlashMessages flash={flash} />
                <form onSubmit={submit} className="page-card-static">
                    <div>
                        <label className="form-label">Name</label>
                        <input
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                            className="form-input"
                        />
                        <FormError message={errors.name} />
                    </div>
                    <div className="mt-4">
                        <label className="form-label">Email</label>
                        <input
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                            className="form-input"
                        />
                        <FormError message={errors.email} />
                    </div>
                    <div className="mt-4">
                        <label className="form-label">Role</label>
                        <select
                            value={form.role}
                            onChange={(event) => setForm({ ...form, role: event.target.value })}
                            className="form-select"
                        >
                            <option value="client">Client</option>
                            <option value="pharmacien">Pharmacist</option>
                        </select>
                        <FormError message={errors.role} />
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
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
