import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function ManageRareRequestsPage({ requests = [] }) {
    const { flash } = usePage().props;
    const [loadingId, setLoadingId] = useState(null);

    const updateStatus = (requestId, status) => {
        router.patch(`/pharmacien/rare-requests/${requestId}/status`, { status }, { preserveScroll: true, onStart: () => setLoadingId(requestId), onFinish: () => setLoadingId(null) });
    };

    return (
        <Layout>
            <Head title="Manage Rare Requests" />

            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Manage Rare Requests</h1>
                    <p className="mt-2 text-sm text-gray-600">Mark requests as found, pending, or not found.</p>
                </div>

                <FlashMessages flash={flash} />

                <div className="rounded-lg border bg-white p-6 shadow">
                    {requests.length === 0 ? (
                        <p className="text-sm text-gray-600">No requests found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-3 py-2">Medicine</th>
                                        <th className="px-3 py-2">Description</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request.id} className="border-b">
                                            <td className="px-3 py-2">{request.medicine_name}</td>
                                            <td className="px-3 py-2">{request.description || '-'}</td>
                                            <td className="px-3 py-2">{request.status}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {['pending', 'found', 'not_found'].map((status) => (
                                                        <button key={status} type="button" onClick={() => updateStatus(request.id, status)} className="rounded-lg border px-3 py-2 text-xs" disabled={loadingId === request.id || request.status === status}>
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
