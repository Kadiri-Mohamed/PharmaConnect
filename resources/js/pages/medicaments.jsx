import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';
import {
    formatCurrency,
    getAvailabilityBadgeClass,
    getPrescriptionRequirementBadgeClass,
    getStockBadgeClass,
} from '@/utils/ui.js';

export default function MedicamentsPage({ medicaments = [] }) {
    const { auth, flash } = usePage().props;
    const [loadingId, setLoadingId] = useState(null);
    const canOrder = auth?.user?.role === 'client';

    const addToCart = (id) => {
        router.post('/cart', { medicament_id: id, quantity: 1 }, { preserveScroll: true, onStart: () => setLoadingId(id), onFinish: () => setLoadingId(null) });
    };

    return (
        <Layout>
            <Head title="Medicaments" />

            <div className="space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Catalog</p>
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold">Medicaments</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                Explore available medicaments, compare pharmacy availability, and add items to your
                                cart in a couple of clicks.
                            </p>
                        </div>
                        <Link href="/pharmacies" className="btn-secondary">
                            Browse pharmacies
                        </Link>
                    </div>
                </div>

                <FlashMessages flash={flash} />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {medicaments.map((item) => (
                        <div key={item.id} className="page-card">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold">{item.name}</h2>
                                    <p className="mt-1 text-sm text-slate-500">{item.pharmacy?.name}</p>
                                </div>
                                <div className="flex flex-wrap justify-end gap-2">
                                    <span className={getAvailabilityBadgeClass(item.stock)}>
                                        {Number(item.stock) > 0 ? 'In stock' : 'Out of stock'}
                                    </span>
                                    <span className={getStockBadgeClass(item.stock)}>Stock {item.stock}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-600">
                                {item.description || 'No description provided.'}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="price-highlight text-lg">{formatCurrency(item.price)}</span>
                                <span className={getPrescriptionRequirementBadgeClass(item.requires_prescription)}>
                                    {item.requires_prescription ? 'Prescription required' : 'No prescription needed'}
                                </span>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <Link href={`/pharmacies/${item.pharmacy?.id}`} className="btn-secondary">
                                    View pharmacy
                                </Link>
                                {canOrder ? (
                                    <button
                                        type="button"
                                        onClick={() => addToCart(item.id)}
                                        className="btn-primary"
                                        disabled={loadingId === item.id || Number(item.stock) < 1}
                                    >
                                        {loadingId === item.id ? 'Adding...' : 'Add to cart'}
                                    </button>
                                ) : (
                                    <Link href="/login" className="btn-primary">
                                        Login to order
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {medicaments.length === 0 && (
                    <div className="page-card-static text-sm text-slate-500">No medicaments found.</div>
                )}
            </div>
        </Layout>
    );
}
