import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import RareRequestStatusBadge from '@/components/rare-requests/StatusBadge.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function RareRequestsIndexPage({ requests = [] }) {
    const { flash } = usePage().props;
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredRequests = useMemo(() => {
        return requests.filter((request) => {
            const normalizedStatus = String(request.status || '').toLowerCase();
            const query = search.trim().toLowerCase();
            const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
            const matchesSearch =
                !query ||
                String(request.medicine_name || '').toLowerCase().includes(query) ||
                String(request.description || '').toLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [requests, search, statusFilter]);

    const renderPharmacyContact = (request) => {
        const pharmacy = request.found_by_pharmacy;

        if (!pharmacy) {
            if (request.status === 'found') {
                return <span className="text-amber-600">Found, but pharmacy contact details are missing.</span>;
            }

            if (request.status === 'not_found') {
                return <span className="text-slate-500">No pharmacy has confirmed availability yet.</span>;
            }

            return <span className="text-slate-400">Waiting for a pharmacy response.</span>;
        }

        return (
            <div className="space-y-1">
                <p className="font-medium text-[#2B3752]">{pharmacy.name}</p>
                {pharmacy.pharmacist?.name && (
                    <p className="text-xs text-slate-500">Ask for {pharmacy.pharmacist.name}</p>
                )}
                {pharmacy.phone && (
                    <a href={`tel:${pharmacy.phone}`} className="block text-[#2E6E65] underline">
                        {pharmacy.phone}
                    </a>
                )}
                {pharmacy.address && <p className="text-xs text-slate-500">{pharmacy.address}</p>}
                <Link href={`/pharmacies/${pharmacy.id}`} className="inline-flex text-xs font-semibold text-[#2E6E65] underline">
                    View pharmacy
                </Link>
            </div>
        );
    };

    return (
        <Layout>
            <Head title="Rare Medicine Requests" />

            <div className="space-y-6">
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#2E6E65]">Rare Medicine Requests</h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Track requests and check the latest pharmacy response status.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => router.reload({ preserveScroll: true, only: ['requests'] })}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Refresh
                            </button>
                            <Link
                                href="/rare-requests/create"
                                className="rounded-lg bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white hover:bg-[#285f57]"
                            >
                                New Request
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search medicine name..."
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

                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    {filteredRequests.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-sm font-medium text-slate-700">No requests available.</p>
                            <p className="mt-1 text-xs text-slate-500">Create a new request to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-[#F4F7ED] text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Medicine</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Pharmacy Contact</th>
                                        <th className="px-4 py-3">Date</th>
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
                                                {renderPharmacyContact(request)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {request.created_at ? new Date(request.created_at).toLocaleString() : '-'}
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
