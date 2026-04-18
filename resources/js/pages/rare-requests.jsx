import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';
import { formatStatusLabel, getRareRequestStatusBadgeClass } from '@/utils/ui.js';

export default function RareRequestsPage({ requests = [] }) {
    const { auth, errors, flash } = usePage().props;
    const [form, setForm] = useState({ medicine_name: '', description: '' });
    const [saving, setSaving] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        router.post('/rare-requests', form, { preserveScroll: true, onStart: () => setSaving(true), onSuccess: () => setForm({ medicine_name: '', description: '' }), onFinish: () => setSaving(false) });
    };

    return (
        <Layout>
            <Head title="Rare Requests" />

            <div className="space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Request Tracking</p>
                    <h1 className="mt-2 text-3xl font-semibold">Rare Medicine Requests</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Request hard-to-find medicine and follow the responses that pharmacies share with you.
                    </p>
                </div>

                <FlashMessages flash={flash} />

                <form onSubmit={submit} className="page-card-static">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="form-label">Medicine name</label>
                            <input
                                value={form.medicine_name}
                                onChange={(event) => setForm({ ...form, medicine_name: event.target.value })}
                                className="form-input"
                            />
                            <FormError message={errors.medicine_name} />
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            <input
                                value={form.description}
                                onChange={(event) => setForm({ ...form, description: event.target.value })}
                                className="form-input"
                            />
                            <FormError message={errors.description} />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary mt-4" disabled={saving}>
                        {saving ? 'Saving...' : 'Send request'}
                    </button>
                </form>

                {auth?.user && (
                    <div className="table-card">
                        <div className="border-b border-pharmacy-light/70 px-6 py-5">
                            <h2 className="text-lg font-semibold">Requests</h2>
                        </div>
                        {requests.length === 0 ? (
                            <p className="px-6 py-5 text-sm text-slate-500">No requests yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="table-head">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Medicine</th>
                                            <th className="px-4 py-3 font-semibold">Description</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold">Found by</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request) => (
                                            <tr key={request.id} className="table-row">
                                                <td className="px-4 py-3 font-medium text-pharmacy-deepest">
                                                    {request.medicine_name}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {request.description || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={getRareRequestStatusBadgeClass(request.status)}>
                                                        {formatStatusLabel(request.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {request.found_by_pharmacy?.name || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
