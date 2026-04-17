import { Head, Link, usePage } from '@inertiajs/react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function OrderShowPage({ order }) {
    const { flash } = usePage().props;

    return (
        <Layout>
            <Head title={`Order #${order.id}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/orders" className="text-sm underline">Back to orders</Link>
                        <h1 className="mt-2 text-2xl font-bold">Order #{order.id}</h1>
                    </div>
                    <span className="rounded-lg border px-3 py-2 text-sm">{order.status}</span>
                </div>

                <FlashMessages flash={flash} />

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold">Pharmacy</h2>
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                            <p>{order.pharmacy.name}</p>
                            <p>{order.pharmacy.address}</p>
                            <p>{order.pharmacy.phone}</p>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold">Summary</h2>
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                            <p>Total: ${Number(order.total_price || 0).toFixed(2)}</p>
                            <p>Date: {new Date(order.created_at).toLocaleString()}</p>
                            <p>Prescription: {order.prescription ? order.prescription.status : 'Not attached'}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold">Items</h2>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b">
                                <tr>
                                    <th className="px-3 py-2">Medicament</th>
                                    <th className="px-3 py-2">Price</th>
                                    <th className="px-3 py-2">Quantity</th>
                                    <th className="px-3 py-2">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={`${item.medicament_name}-${index}`} className="border-b">
                                        <td className="px-3 py-2">{item.medicament_name}</td>
                                        <td className="px-3 py-2">${Number(item.price || 0).toFixed(2)}</td>
                                        <td className="px-3 py-2">{item.quantity}</td>
                                        <td className="px-3 py-2">${Number(item.subtotal || 0).toFixed(2)}</td>
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
