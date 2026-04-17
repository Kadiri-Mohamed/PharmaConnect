import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function PharmacienDashboard({ pharmacy, medicaments = [], recentOrders = [], stats = {} }) {
    const lowStock = medicaments.filter((item) => Number(item.stock) <= 20);

    return (
        <Layout>
            <Head title="Pharmacist Dashboard" />

            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Pharmacist Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600">{pharmacy?.name || 'Your pharmacy'} overview.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-white p-5 shadow"><p className="text-sm text-gray-500">Medicaments</p><p className="mt-2 text-3xl font-bold">{stats.totalMedicaments || 0}</p></div>
                    <div className="rounded-lg border bg-white p-5 shadow"><p className="text-sm text-gray-500">Low Stock</p><p className="mt-2 text-3xl font-bold">{stats.lowStockCount || 0}</p></div>
                    <div className="rounded-lg border bg-white p-5 shadow"><p className="text-sm text-gray-500">Orders</p><p className="mt-2 text-3xl font-bold">{stats.totalOrders || 0}</p></div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border bg-white p-6 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Low Stock Medicaments</h2>
                            <Link href="/pharmacien/medicaments" className="text-sm underline">Manage</Link>
                        </div>
                        {lowStock.length === 0 ? <p className="text-sm text-gray-600">No low stock medicaments.</p> : lowStock.map((item) => <div key={item.id} className="mb-2 rounded-lg border p-3 text-sm">{item.name} - {item.stock} left</div>)}
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Recent Orders</h2>
                            <Link href="/pharmacien/orders" className="text-sm underline">Manage</Link>
                        </div>
                        {recentOrders.length === 0 ? <p className="text-sm text-gray-600">No orders yet.</p> : recentOrders.map((order) => <div key={order.id} className="mb-2 rounded-lg border p-3 text-sm">Order #{order.id} - {order.status} - ${Number(order.total_price || 0).toFixed(2)}</div>)}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
