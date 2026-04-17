import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';

const emptyCart = { items: [], total: 0, item_count: 0, has_prescription_required_items: false, has_uploaded_prescription: false };

export default function CartPage({ cart = emptyCart }) {
    const { flash } = usePage().props;
    const [loadingKey, setLoadingKey] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const pharmacyId = cart.pharmacy_id || cart.items[0]?.pharmacy_id;

    const updateQuantity = (item, quantity) => {
        if (quantity < 1) return;
        router.put(`/cart/${item.id}`, { quantity }, { preserveScroll: true, onStart: () => setLoadingKey(`item-${item.id}`), onFinish: () => setLoadingKey('') });
    };

    const removeItem = (item) => {
        if (!window.confirm('Remove this item from the cart?')) return;
        router.delete(`/cart/${item.id}`, { preserveScroll: true, onStart: () => setLoadingKey(`item-${item.id}`), onFinish: () => setLoadingKey('') });
    };

    const clearCart = () => {
        if (!window.confirm('Clear the whole cart?')) return;
        router.delete('/cart', { preserveScroll: true, onStart: () => setLoadingKey('clear'), onFinish: () => setLoadingKey('') });
    };

    const createOrder = () => {
        if (!pharmacyId) return;
        router.post('/orders', { pharmacy_id: pharmacyId }, { preserveScroll: true, onStart: () => setCreatingOrder(true), onFinish: () => setCreatingOrder(false) });
    };

    const uploadPrescription = () => {
        if (!file) return;
        router.post('/prescriptions', { image: file }, { forceFormData: true, preserveScroll: true, onStart: () => setUploading(true), onSuccess: () => setFile(null), onFinish: () => setUploading(false) });
    };

    return (
        <Layout>
            <Head title="Cart" />

            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold">Cart</h1>
                            <p className="mt-2 text-sm text-gray-600">Review items before placing your order.</p>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={clearCart} className="rounded-lg border px-4 py-2 text-sm" disabled={!cart.items.length || loadingKey === 'clear'}>
                                Clear Cart
                            </button>
                            <button type="button" onClick={createOrder} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={!cart.items.length || creatingOrder || (cart.has_prescription_required_items && !cart.has_uploaded_prescription)}>
                                {creatingOrder ? 'Creating...' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                </div>

                <FlashMessages flash={flash} />

                {cart.has_prescription_required_items && (
                    <div className="rounded-lg border bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold">Prescription Upload</h2>
                        <p className="mt-2 text-sm text-gray-600">Some items need a prescription before the order can be created.</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="rounded-lg border px-3 py-2 text-sm" />
                            <button type="button" onClick={uploadPrescription} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={!file || uploading}>
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="rounded-lg border bg-white p-6 shadow">
                    {cart.items.length === 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">Your cart is empty.</p>
                            <Link href="/medicaments" className="inline-flex rounded-lg border px-4 py-2 text-sm">
                                Browse medicaments
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-3 py-2">Medicament</th>
                                        <th className="px-3 py-2">Price</th>
                                        <th className="px-3 py-2">Quantity</th>
                                        <th className="px-3 py-2">Subtotal</th>
                                        <th className="px-3 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.items.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="px-3 py-2">{item.medicament_name}</td>
                                            <td className="px-3 py-2">${Number(item.price || 0).toFixed(2)}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} className="rounded border px-2 py-1" disabled={loadingKey === `item-${item.id}` || item.quantity <= 1}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} className="rounded border px-2 py-1" disabled={loadingKey === `item-${item.id}`}>+</button>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">${Number(item.subtotal || 0).toFixed(2)}</td>
                                            <td className="px-3 py-2">
                                                <button type="button" onClick={() => removeItem(item)} className="rounded-lg border px-3 py-2 text-sm" disabled={loadingKey === `item-${item.id}`}>
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold">Summary</h2>
                    <p className="mt-2 text-sm text-gray-600">Items: {cart.item_count}</p>
                    <p className="mt-1 text-sm text-gray-600">Total: ${Number(cart.total || 0).toFixed(2)}</p>
                </div>
            </div>
        </Layout>
    );
}
