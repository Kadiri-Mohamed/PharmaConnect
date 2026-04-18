import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';
import { formatStatusLabel, getRareRequestStatusBadgeClass } from '@/utils/ui.js';

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
                <div className="hero-card">
                    <p className="section-kicker">Request Operations</p>
                    <h1 className="mt-2 text-3xl font-semibold">Manage Rare Requests</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Review incoming rare medicine requests and update their availability without leaving the
                        dashboard.
                    </p>
                </div>

                <FlashMessages flash={flash} />

                <div className="table-card">
                    {requests.length === 0 ? (
                        <p className="px-6 py-5 text-sm text-slate-500">No requests found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="table-head">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Medicine</th>
                                        <th className="px-4 py-3 font-semibold">Description</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Actions</th>
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
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {['pending', 'found', 'not_found'].map((status) => (
                                                        <button
                                                            key={status}
                                                            type="button"
                                                            onClick={() => updateStatus(request.id, status)}
                                                            className={
                                                                request.status === status
                                                                    ? 'inline-flex items-center justify-center rounded-xl bg-pharmacy-dark px-3 py-2 text-xs font-semibold text-white'
                                                                    : 'inline-flex items-center justify-center rounded-xl border border-pharmacy-medium bg-white px-3 py-2 text-xs font-semibold text-pharmacy-dark hover:bg-pharmacy-light/20'
                                                            }
                                                            disabled={loadingId === request.id || request.status === status}
                                                        >
                                                            {formatStatusLabel(status)}
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
