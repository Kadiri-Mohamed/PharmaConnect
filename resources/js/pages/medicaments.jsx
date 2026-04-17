import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';

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
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Medicaments</h1>
                    <p className="mt-2 text-sm text-gray-600">All available medicaments are listed here.</p>
                </div>

                <FlashMessages flash={flash} />

                <div className="grid gap-4 md:grid-cols-2">
                    {medicaments.map((item) => (
                        <div key={item.id} className="rounded-lg border bg-white p-5 shadow">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold">{item.name}</h2>
                                    <p className="mt-1 text-sm text-gray-600">{item.pharmacy?.name}</p>
                                </div>
                                <span className="rounded-lg border px-2 py-1 text-xs">{Number(item.stock) > 0 ? 'In stock' : 'Out of stock'}</span>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">{item.description || 'No description provided.'}</p>
                            <div className="mt-4 space-y-1 text-sm text-gray-600">
                                <p>Price: ${Number(item.price || 0).toFixed(2)}</p>
                                <p>Stock: {item.stock}</p>
                                <p>Prescription: {item.requires_prescription ? 'Required' : 'Not required'}</p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Link href={`/pharmacies/${item.pharmacy?.id}`} className="rounded-lg border px-4 py-2 text-sm">
                                    View pharmacy
                                </Link>
                                {canOrder ? (
                                    <button type="button" onClick={() => addToCart(item.id)} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={loadingId === item.id || Number(item.stock) < 1}>
                                        {loadingId === item.id ? 'Adding...' : 'Add to cart'}
                                    </button>
                                ) : (
                                    <Link href="/login" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">
                                        Login to order
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {medicaments.length === 0 && <div className="rounded-lg border bg-white p-6 text-sm text-gray-600 shadow">No medicaments found.</div>}
            </div>
        </Layout>
    );
}
