import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';

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
                <Link href="/pharmacies" className="inline-flex rounded-lg border bg-white px-4 py-2 text-sm shadow">
                    Back to pharmacies
                </Link>

                <FlashMessages flash={flash} />

                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">{pharmacy?.name || 'Pharmacy not found'}</h1>
                    {pharmacy && (
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                            <p>Address: {pharmacy.address}</p>
                            <p>Phone: {pharmacy.phone}</p>
                            <p>Guard Status: {pharmacy.status_garde ? 'De garde' : 'Normal'}</p>
                            <p>Medicaments: {pharmacy.medicament_count}</p>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold">Medicaments</h2>
                    {medicaments.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-600">No medicaments found.</p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-3 py-2">Name</th>
                                        <th className="px-3 py-2">Price</th>
                                        <th className="px-3 py-2">Stock</th>
                                        <th className="px-3 py-2">Prescription</th>
                                        <th className="px-3 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicaments.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="px-3 py-2">
                                                <div>{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.description || 'No description'}</div>
                                            </td>
                                            <td className="px-3 py-2">${Number(item.price || 0).toFixed(2)}</td>
                                            <td className="px-3 py-2">{item.stock}</td>
                                            <td className="px-3 py-2">{item.requires_prescription ? 'Required' : 'No'}</td>
                                            <td className="px-3 py-2">
                                                {canOrder ? (
                                                    <button type="button" onClick={() => addToCart(item.id)} className="rounded-lg border px-3 py-2 text-sm" disabled={loadingId === item.id || Number(item.stock) < 1}>
                                                        {loadingId === item.id ? 'Adding...' : 'Add to cart'}
                                                    </button>
                                                ) : (
                                                    <Link href="/login" className="underline">
                                                        Login
                                                    </Link>
                                                )}
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
