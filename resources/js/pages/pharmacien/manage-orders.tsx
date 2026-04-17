import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Layout from '@/layouts/Layout.jsx';

const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'] as const;

const statusStyles: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-700',
    preparing: 'bg-amber-100 text-amber-700',
    ready: 'bg-sky-100 text-sky-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

type PageProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};

type OrderItemRow = {
    medicament_id?: number | null;
    medicament?: {
        name?: string | null;
    } | null;
};

type OrderRow = {
    id: number;
    status?: string | null;
    created_at?: string | null;
    total_price?: number | string | null;
    user?: {
        name?: string | null;
        email?: string | null;
    } | null;
    items?: OrderItemRow[] | null;
    prescription?: {
        id?: number;
        status?: string | null;
        file_url?: string | null;
    } | null;
};

export default function ManageOrdersPage({ orders = [] }: { orders: OrderRow[] }) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedStatuses, setSelectedStatuses] = useState<Record<number, string>>({});
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    useEffect(() => {
        setSelectedStatuses(
            orders.reduce((carry: Record<number, string>, order) => {
                carry[order.id] = order.status ?? 'pending';
                return carry;
            }, {}),
        );
    }, [orders]);

    const handleStatusChange = (orderId: number, status: string) => {
        setSelectedStatuses((prev) => ({
            ...prev,
            [orderId]: status,
        }));
    };

    const applyStatusUpdate = (orderId: number) => {
        const status = selectedStatuses[orderId];
        if (!status) return;

        router.patch(
            route('pharmacien.orders.update-status', orderId),
            { status },
            {
                preserveScroll: true,
                onStart: () => setUpdatingOrderId(orderId),
                onFinish: () => setUpdatingOrderId(null),
            },
        );
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const query = search.trim().toLowerCase();
            const customerName = String(order.user?.name ?? '').toLowerCase();
            const customerEmail = String(order.user?.email ?? '').toLowerCase();
            const orderId = String(order.id ?? '');
            const orderStatus = String(order.status ?? '').toLowerCase();

            const matchesSearch =
                !query ||
                customerName.includes(query) ||
                customerEmail.includes(query) ||
                orderId.includes(query);
            const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    const pendingCount = useMemo(
        () => orders.filter((order) => String(order.status) === 'pending').length,
        [orders],
    );

    const preparingCount = useMemo(
        () => orders.filter((order) => String(order.status) === 'preparing').length,
        [orders],
    );

    const readyCount = useMemo(
        () => orders.filter((order) => String(order.status) === 'ready').length,
        [orders],
    );

    return (
        <Layout>
            <Head title="Manage Orders" />

            <div className="space-y-6">
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#2E6E65]">Manage Orders</h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {orders.length} order(s) total - {pendingCount} pending - {preparingCount} preparing -{' '}
                                {readyCount} ready
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.reload({ preserveScroll: true, only: ['orders'] })}
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
                            placeholder="Search by order id, client name or email..."
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                        >
                            <option value="all">All statuses</option>
                            {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        <div className="rounded-lg border border-slate-200 bg-[#F4F7ED] px-3 py-2 text-sm text-slate-700">
                            Showing {filteredOrders.length} of {orders.length}
                        </div>
                    </div>
                </section>

                {flash?.success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{flash.success}</div>}
                {flash?.error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{flash.error}</div>}

                <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    {filteredOrders.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-sm font-medium text-slate-700">No orders found.</p>
                            <p className="mt-1 text-xs text-slate-500">New client orders will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-[#F4F7ED] text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Order</th>
                                        <th className="px-4 py-3">Client</th>
                                        <th className="px-4 py-3">Items</th>
                                        <th className="px-4 py-3">Prescription</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => {
                                        const status = String(order.status ?? '').toLowerCase();
                                        const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                                        const itemSummary = Array.isArray(order.items)
                                            ? order.items
                                                  .slice(0, 2)
                                                  .map((item) => item?.medicament?.name || `Item #${item?.medicament_id ?? '?'}`)
                                                  .join(', ')
                                            : '';

                                        return (
                                            <tr key={order.id} className="border-t border-slate-100 align-top">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-[#2B3752]">#{order.id}</p>
                                                    <p className="text-xs text-slate-500">Pharmacy order</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-800">{order.user?.name ?? 'Unknown client'}</p>
                                                    <p className="text-xs text-slate-500">{order.user?.email ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-slate-700">{itemCount} item(s)</p>
                                                    <p className="line-clamp-2 text-xs text-slate-500">{itemSummary || '-'}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {order.prescription ? (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium uppercase text-slate-600">
                                                                {order.prescription.status || 'pending'}
                                                            </p>
                                                            {order.prescription.file_url && (
                                                                <a
                                                                    href={order.prescription.file_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs font-semibold text-[#2E6E65] underline"
                                                                >
                                                                    View file
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">Not required</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-800">
                                                    ${Number(order.total_price ?? 0).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                                                            statusStyles[status] || 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        {status || 'unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <select
                                                            value={selectedStatuses[order.id] ?? status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            className="rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:border-[#2E6E65] focus:outline-none"
                                                        >
                                                            {ORDER_STATUSES.map((value) => (
                                                                <option key={value} value={value}>
                                                                    {value}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={() => applyStatusUpdate(order.id)}
                                                            disabled={updatingOrderId === order.id || (selectedStatuses[order.id] ?? status) === status}
                                                            className="rounded-md bg-[#4CAF50] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#449b48] disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {updatingOrderId === order.id ? 'Saving...' : 'Update'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
