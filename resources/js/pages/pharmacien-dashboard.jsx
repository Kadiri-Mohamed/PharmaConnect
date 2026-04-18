import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';
import {
    formatCurrency,
    formatStatusLabel,
    getGuardBadgeClass,
    getOrderStatusBadgeClass,
    getStockBadgeClass,
} from '@/utils/ui.js';

export default function PharmacienDashboard({ pharmacy, medicaments = [], recentOrders = [], stats = {} }) {
    const lowStock = medicaments.filter((item) => Number(item.stock) <= 20);

    return (
        <Layout>
            <Head title="Pharmacist Dashboard" />

            <div className="space-y-6">
                <div className="hero-card">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="section-kicker">Pharmacist Console</p>
                            <h1 className="mt-2 text-3xl font-semibold">Pharmacist Dashboard</h1>
                            <p className="mt-2 text-sm text-slate-600">
                                {pharmacy?.name || 'Your pharmacy'} overview with inventory health, order flow, and
                                revenue progress.
                            </p>
                        </div>
                        {pharmacy && (
                            <span className={getGuardBadgeClass(pharmacy.status_garde)}>
                                {pharmacy.status_garde ? 'On duty' : 'Standard'}
                            </span>
                        )}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link href="/pharmacien/medicaments" className="btn-secondary">
                            Manage medicaments
                        </Link>
                        <Link href="/pharmacien/orders" className="btn-primary">
                            Manage orders
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-pharmacy-light/70 bg-pharmacy-light p-5 shadow-pharmacy transition duration-200 hover:scale-[1.02]">
                        <p className="section-kicker">Medicaments</p>
                        <p className="mt-3 text-3xl font-bold text-pharmacy-dark">{stats.totalMedicaments || 0}</p>
                        <p className="mt-2 text-sm text-pharmacy-deepest/80">Items currently in your catalog.</p>
                    </div>
                    <div className="rounded-2xl border border-pharmacy-lighter/70 bg-pharmacy-lighter p-5 shadow-pharmacy transition duration-200 hover:scale-[1.02]">
                        <p className="section-kicker">Low Stock</p>
                        <p className="mt-3 text-3xl font-bold text-pharmacy-dark">{stats.lowStockCount || 0}</p>
                        <p className="mt-2 text-sm text-pharmacy-deepest/80">
                            Medicaments that need replenishment soon.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-pharmacy-medium/80 bg-pharmacy-medium p-5 text-white shadow-pharmacy transition duration-200 hover:scale-[1.02]">
                        <p className="section-kicker text-white/70">Orders</p>
                        <p className="mt-3 text-3xl font-bold text-white">{stats.totalOrders || 0}</p>
                        <p className="mt-2 text-sm text-white/80">Orders processed through this pharmacy.</p>
                    </div>
                    <div className="rounded-2xl border border-pharmacy-dark/80 bg-pharmacy-dark p-5 text-white shadow-pharmacy transition duration-200 hover:scale-[1.02]">
                        <p className="section-kicker text-pharmacy-light/70">Revenue</p>
                        <p className="mt-3 text-3xl font-bold text-white">
                            {formatCurrency(stats.totalRevenue)}
                        </p>
                        <p className="mt-2 text-sm text-pharmacy-light/85">Delivered-order revenue to date.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="page-card-static">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Low Stock Medicaments</h2>
                            <Link href="/pharmacien/medicaments" className="link-primary text-sm">
                                Manage
                            </Link>
                        </div>
                        {lowStock.length === 0 ? (
                            <p className="text-sm text-slate-500">No low stock medicaments.</p>
                        ) : (
                            <div className="space-y-3">
                                {lowStock.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-pharmacy-light/70 bg-pharmacy-light/10 p-4 text-sm"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-medium text-pharmacy-deepest">{item.name}</span>
                                            <span className={getStockBadgeClass(item.stock)}>
                                                {item.stock} left
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="page-card-static">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Recent Orders</h2>
                            <Link href="/pharmacien/orders" className="link-primary text-sm">
                                Manage
                            </Link>
                        </div>
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-slate-500">No orders yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="rounded-2xl border border-pharmacy-light/70 bg-white p-4 shadow-pharmacy"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-pharmacy-deepest">Order #{order.id}</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={getOrderStatusBadgeClass(order.status)}>
                                                    {formatStatusLabel(order.status)}
                                                </span>
                                                <span className="text-sm font-semibold text-pharmacy-dark">
                                                    {formatCurrency(order.total_price)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
