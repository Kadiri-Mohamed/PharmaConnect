import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';
import {
    formatCurrency,
    formatStatusLabel,
    getOrderStatusBadgeClass,
    getPrescriptionStatusBadgeClass,
} from '@/utils/ui.js';

const statuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function PharmacienOrdersPage({ orders = [] }) {
    const { flash } = usePage().props;
    const [selected, setSelected] = useState({});
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        setSelected(Object.fromEntries(orders.map((order) => [order.id, order.status])));
    }, [orders]);

    const save = (orderId) => {
        router.patch(`/pharmacien/orders/${orderId}/status`, { status: selected[orderId] }, { preserveScroll: true, onStart: () => setSavingId(orderId), onFinish: () => setSavingId(null) });
    };

    return (
        <Layout>
            <Head title="Manage Orders" />

            <div className="space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Order Operations</p>
                    <h1 className="mt-2 text-3xl font-semibold">Manage Orders</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Update statuses quickly, keep customers informed, and monitor totals in one view.
                    </p>
                </div>

                <FlashMessages flash={flash} />

                <div className="table-card">
                    {orders.length === 0 ? (
                        <p className="px-6 py-5 text-sm text-slate-500">No orders found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="table-head">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Order</th>
                                        <th className="px-4 py-3 font-semibold">Client</th>
                                        <th className="px-4 py-3 font-semibold">Items</th>
                                        <th className="px-4 py-3 font-semibold">Prescription</th>
                                        <th className="px-4 py-3 font-semibold">Total</th>
                                        <th className="px-4 py-3 font-semibold">Current Status</th>
                                        <th className="px-4 py-3 font-semibold">Update Status</th>
                                        <th className="px-4 py-3 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="table-row">
                                            <td className="px-4 py-3 font-medium text-pharmacy-deepest">
                                                #{order.id}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{order.user_name}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {order.items
                                                    .map((item) => `${item.name} (${item.quantity})`)
                                                    .join(', ')}
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.prescription ? (
                                                    <div className="flex min-w-36 flex-col gap-2">
                                                        <span
                                                            className={getPrescriptionStatusBadgeClass(
                                                                order.prescription.status,
                                                            )}
                                                        >
                                                            {formatStatusLabel(order.prescription.status)}
                                                        </span>
                                                        <a
                                                            href={order.prescription.file_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="link-primary text-sm"
                                                        >
                                                            View prescription
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className={getPrescriptionStatusBadgeClass('not_attached')}>
                                                        Not attached
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-pharmacy-dark">
                                                {formatCurrency(order.total_price)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={getOrderStatusBadgeClass(order.status)}>
                                                    {formatStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={selected[order.id] || order.status}
                                                    onChange={(event) =>
                                                        setSelected({ ...selected, [order.id]: event.target.value })
                                                    }
                                                    className="form-select mt-0 min-w-40"
                                                >
                                                    {statuses.map((status) => (
                                                        <option key={status} value={status}>
                                                            {formatStatusLabel(status)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => save(order.id)}
                                                    className="btn-primary"
                                                    disabled={savingId === order.id}
                                                >
                                                    {savingId === order.id ? 'Saving...' : 'Save'}
                                                </button>
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
