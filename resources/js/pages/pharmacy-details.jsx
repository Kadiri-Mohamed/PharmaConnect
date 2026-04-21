import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';
import {
    formatCurrency,
    getAvailabilityBadgeClass,
    getGuardBadgeClass,
    getPrescriptionRequirementBadgeClass,
    getStockBadgeClass,
} from '@/utils/ui.js';

export default function PharmacyDetailsPage({ pharmacy, medicaments = [] }) {
    const { auth, flash } = usePage().props;
    const [loadingId, setLoadingId] = useState(null);
    const canOrder = auth?.user?.role === 'client';

    const addToCart = (id) => {
        router.post('/cart', { medicament_id: id, quantity: 1 }, { preserveScroll: true, onStart: () => setLoadingId(id), onFinish: () => setLoadingId(null) });
    };

    return (
        <Layout>
            <Head title={pharmacy?.name || 'Pharmacy'} />

            <div className="space-y-6">
                <Link href="/pharmacies" className="btn-secondary">
                    Back to pharmacies
                </Link>

                <FlashMessages flash={flash} />

                <div className="hero-card">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="section-kicker">Pharmacy Profile</p>
                            <h1 className="mt-2 text-3xl font-semibold">
                                {pharmacy?.name || 'Pharmacy not found'}
                            </h1>
                        </div>
                        {pharmacy && (
                            <span className={getGuardBadgeClass(pharmacy.status_garde)}>
                                {pharmacy.status_garde ? 'On duty' : 'Standard'}
                            </span>
                        )}
                    </div>
                    {pharmacy && (
                        <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                            <p>Address: {pharmacy.address}</p>
                            <p>Phone: {pharmacy.phone}</p>
                            <p>Medicaments: {pharmacy.medicament_count}</p>
                            <p>Guard Status: {pharmacy.status_garde ? 'De garde' : 'Normal'}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Medicaments</h2>
                    {medicaments.length === 0 ? (
                        <div className="page-card-static text-sm text-slate-500">No medicaments found.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {medicaments.map((item) => (
                                <div key={item.id} className="page-card">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold">{item.name}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {item.description || 'No description'}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <span className={getAvailabilityBadgeClass(item.stock)}>
                                                {Number(item.stock) > 0 ? 'In stock' : 'Out of stock'}
                                            </span>
                                            <span className={getStockBadgeClass(item.stock)}>Stock {item.stock}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className="price-highlight text-lg">{formatCurrency(item.price)}</span>
                                        <span className={getPrescriptionRequirementBadgeClass(item.requires_prescription)}>
                                            {item.requires_prescription
                                                ? 'Prescription required'
                                                : 'No prescription needed'}
                                        </span>
                                    </div>
                                    <div className="mt-5">
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
                                            <Link href="/login" className="btn-secondary">
                                                Login to order
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
