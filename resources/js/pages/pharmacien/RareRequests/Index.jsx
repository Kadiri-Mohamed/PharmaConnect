import axios from 'axios';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import RareRequestStatusBadge from '@/components/rare-requests/StatusBadge.jsx';
import Layout from '@/layouts/Layout.jsx';

const STATUS_OPTIONS = ['pending', 'found', 'not_found'];

export default function Index() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingRequestId, setUpdatingRequestId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await axios.get('/api/rare-requests', {
                headers: { Accept: 'application/json' },
            });
            setRequests(response?.data?.data || []);
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Unable to load rare requests.');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (requestId, status) => {
        setUpdatingRequestId(requestId);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.patch(
                `/api/pharmacien/rare-requests/${requestId}/status`,
                { status },
                { headers: { Accept: 'application/json' } },
            );

            const updatedRequest = response?.data?.data;
            setRequests((prev) =>
                prev.map((request) =>
                    request.id === requestId ? { ...request, ...(updatedRequest ?? {}) } : request,
                ),
            );
            setSuccessMessage('Request status updated successfully.');
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Unable to update request status.');
        } finally {
            setUpdatingRequestId(null);
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter((request) => {
            const query = search.trim().toLowerCase();
            const requestStatus = String(request.status || '').toLowerCase();
            const matchesSearch =
                !query ||
                String(request.medicine_name || '').toLowerCase().includes(query) ||
                String(request.description || '').toLowerCase().includes(query);
            const matchesStatus = statusFilter === 'all' || requestStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [requests, search, statusFilter]);

    return (
        <Layout>
            <Head title="Manage Rare Requests" />

            <div className="space-y-6">
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#2E6E65]">Manage Rare Requests</h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Review client requests and update availability status.
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                When you mark a request as found, clients will see your pharmacy contact details.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={fetchRequests}
                            className="rounded-lg bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white hover:bg-[#285f57]"
                        >
                            Refresh
                        </button>
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by medicine..."
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                        >
                            <option value="all">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="found">Found</option>
                            <option value="not_found">Not Found</option>
                        </select>
                        <div className="rounded-lg border border-slate-200 bg-[#F4F7ED] px-3 py-2 text-sm text-slate-700">
                            Showing {filteredRequests.length} request(s)
                        </div>
                    </div>
                </section>

                {successMessage && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center text-sm text-slate-500">Loading requests...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-sm font-medium text-slate-700">No rare medicine requests.</p>
                            <p className="mt-1 text-xs text-slate-500">Incoming requests will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-[#F4F7ED] text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Medicine</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Found By</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="border-t border-slate-100">
                                            <td className="px-4 py-3 font-medium text-[#2B3752]">{request.medicine_name}</td>
                                            <td className="px-4 py-3 text-slate-600">{request.description || '-'}</td>
                                            <td className="px-4 py-3">
                                                <RareRequestStatusBadge status={request.status} />
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {request.found_by_pharmacy ? (
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-[#2B3752]">
                                                            {request.found_by_pharmacy.name}
                                                        </p>
                                                        {request.found_by_pharmacy.phone && (
                                                            <p className="text-xs text-slate-500">
                                                                {request.found_by_pharmacy.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {request.created_at ? new Date(request.created_at).toLocaleString() : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {STATUS_OPTIONS.map((status) => (
                                                        <button
                                                            key={status}
                                                            type="button"
                                                            disabled={
                                                                updatingRequestId === request.id ||
                                                                request.status === status
                                                            }
                                                            onClick={() => updateStatus(request.id, status)}
                                                            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                                        >
                                                            {status.replace('_', ' ')}
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
                </section>
            </div>
        </Layout>
    );
}
