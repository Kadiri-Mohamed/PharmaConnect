import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

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
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Rare Medicine Requests</h1>
                    <p className="mt-2 text-sm text-gray-600">Create a request and review responses from pharmacies.</p>
                </div>

                <FlashMessages flash={flash} />

                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">Medicine name</label>
                            <input value={form.medicine_name} onChange={(event) => setForm({ ...form, medicine_name: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
                            <FormError message={errors.medicine_name} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
                            <FormError message={errors.description} />
                        </div>
                    </div>
                    <button type="submit" className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={saving}>
                        {saving ? 'Saving...' : 'Send request'}
                    </button>
                </form>

                {auth?.user && (
                    <div className="rounded-lg border bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold">Requests</h2>
                        {requests.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-600">No requests yet.</p>
                        ) : (
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="px-3 py-2">Medicine</th>
                                            <th className="px-3 py-2">Description</th>
                                            <th className="px-3 py-2">Status</th>
                                            <th className="px-3 py-2">Found by</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request) => (
                                            <tr key={request.id} className="border-b">
                                                <td className="px-3 py-2">{request.medicine_name}</td>
                                                <td className="px-3 py-2">{request.description || '-'}</td>
                                                <td className="px-3 py-2">{request.status}</td>
                                                <td className="px-3 py-2">{request.found_by_pharmacy?.name || '-'}</td>
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
