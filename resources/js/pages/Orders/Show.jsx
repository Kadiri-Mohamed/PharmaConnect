import { Head, Link, usePage } from '@inertiajs/react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';
import {
    formatCurrency,
    formatStatusLabel,
    getOrderStatusBadgeClass,
    getPrescriptionStatusBadgeClass,
} from '@/utils/ui.js';

export default function OrderShowPage({ order }) {
    const { flash } = usePage().props;

    return (
        <Layout>
            <Head title={`Order #${order.id}`} />

            <div className="space-y-6">
                <div className="hero-card">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <Link href="/orders" className="btn-secondary">
                                Back to orders
                            </Link>
                            <p className="section-kicker mt-4">Order Details</p>
                            <h1 className="mt-2 text-3xl font-semibold">Order #{order.id}</h1>
                        </div>
                        <span className={getOrderStatusBadgeClass(order.status)}>
                            {formatStatusLabel(order.status)}
                        </span>
                    </div>
                </div>

                <FlashMessages flash={flash} />

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="page-card-static">
                        <h2 className="text-lg font-semibold">Pharmacy</h2>
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                            <p>{order.pharmacy.name}</p>
                            <p>{order.pharmacy.address}</p>
                            <p>{order.pharmacy.phone}</p>
                        </div>
                    </div>
                    <div className="page-card-static">
                        <h2 className="text-lg font-semibold">Summary</h2>
                        <div className="mt-3 space-y-3 text-sm text-slate-600">
                            <p>
                                Total:{' '}
                                <span className="font-semibold text-pharmacy-dark">
                                    {formatCurrency(order.total_price)}
                                </span>
                            </p>
                            <p>Date: {new Date(order.created_at).toLocaleString()}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span>Prescription:</span>
                                <span
                                    className={getPrescriptionStatusBadgeClass(
                                        order.prescription ? order.prescription.status : 'not_attached',
                                    )}
                                >
                                    {order.prescription
                                        ? formatStatusLabel(order.prescription.status)
                                        : 'Not attached'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="table-card">
                    <div className="border-b border-pharmacy-light/70 px-6 py-5">
                        <h2 className="text-lg font-semibold">Items</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="table-head">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Medicament</th>
                                    <th className="px-4 py-3 font-semibold">Price</th>
                                    <th className="px-4 py-3 font-semibold">Quantity</th>
                                    <th className="px-4 py-3 font-semibold">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={`${item.medicament_name}-${index}`} className="table-row">
                                        <td className="px-4 py-3 font-medium text-pharmacy-deepest">
                                            {item.medicament_name}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{formatCurrency(item.price)}</td>
                                        <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                                        <td className="px-4 py-3 font-semibold text-pharmacy-dark">
                                            {formatCurrency(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
