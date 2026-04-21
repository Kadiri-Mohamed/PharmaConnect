import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';
import { formatCurrency } from '@/utils/ui.js';

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
                <div className="hero-card">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="section-kicker">Checkout</p>
                            <h1 className="mt-2 text-3xl font-semibold">Cart</h1>
                            <p className="mt-2 text-sm text-slate-600">
                                Review your items, adjust quantities, and confirm any prescription requirements
                                before placing the order.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/medicaments" className="btn-secondary">
                                Continue shopping
                            </Link>
                            <button
                                type="button"
                                onClick={clearCart}
                                className="btn-danger"
                                disabled={!cart.items.length || loadingKey === 'clear'}
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>

                <FlashMessages flash={flash} />

                {cart.has_prescription_required_items && (
                    <div className="tinted-card">
                        <h2 className="text-lg font-semibold">Prescription Upload</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Some items need a prescription before the order can be created.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(event) => setFile(event.target.files?.[0] || null)}
                                className="form-file mt-0"
                            />
                            <button
                                type="button"
                                onClick={uploadPrescription}
                                className="btn-primary"
                                disabled={!file || uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">
                    <div className="table-card">
                        <div className="border-b border-pharmacy-light/70 px-6 py-5">
                            <p className="section-kicker">Cart Items</p>
                            <h2 className="mt-2 text-xl font-semibold">Review your selection</h2>
                        </div>
                        {cart.items.length === 0 ? (
                            <div className="space-y-3 px-6 py-5">
                                <p className="text-sm text-slate-500">Your cart is empty.</p>
                                <Link href="/medicaments" className="btn-secondary">
                                    Browse medicaments
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="table-head">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Medicament</th>
                                            <th className="px-4 py-3 font-semibold">Price</th>
                                            <th className="px-4 py-3 font-semibold">Quantity</th>
                                            <th className="px-4 py-3 font-semibold">Subtotal</th>
                                            <th className="px-4 py-3 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.items.map((item) => (
                                            <tr key={item.id} className="table-row">
                                                <td className="px-4 py-3 font-medium text-pharmacy-deepest">
                                                    {item.medicament_name}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item, item.quantity - 1)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-pharmacy-light text-sm font-semibold text-pharmacy-deepest transition hover:bg-pharmacy-lighter disabled:cursor-not-allowed disabled:opacity-50"
                                                            disabled={loadingKey === `item-${item.id}` || item.quantity <= 1}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="min-w-8 text-center font-semibold text-pharmacy-deepest">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item, item.quantity + 1)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-pharmacy-light text-sm font-semibold text-pharmacy-deepest transition hover:bg-pharmacy-lighter disabled:cursor-not-allowed disabled:opacity-50"
                                                            disabled={loadingKey === `item-${item.id}`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-pharmacy-dark">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item)}
                                                        className="btn-danger"
                                                        disabled={loadingKey === `item-${item.id}`}
                                                    >
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

                    <div className="rounded-2xl bg-pharmacy-deepest p-6 text-white shadow-pharmacy-lg">
                        <p className="section-kicker text-pharmacy-light/70">Summary</p>
                        <h2 className="mt-3 text-2xl font-semibold text-white">Ready to place your order?</h2>
                        <p className="mt-2 text-sm text-pharmacy-light/80">
                            Everything on this card updates instantly as you adjust the cart.
                        </p>

                        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between text-sm text-pharmacy-light/80">
                                <span>Items</span>
                                <span className="font-semibold text-white">{cart.item_count}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-pharmacy-light/80">
                                <span>Prescription ready</span>
                                <span className="font-semibold text-white">
                                    {cart.has_prescription_required_items
                                        ? cart.has_uploaded_prescription
                                            ? 'Uploaded'
                                            : 'Needed'
                                        : 'Not required'}
                                </span>
                            </div>
                            <div className="border-t border-white/10 pt-4">
                                <p className="text-sm text-pharmacy-light/80">Total</p>
                                <p className="mt-1 text-3xl font-bold text-white">{formatCurrency(cart.total)}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={createOrder}
                            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-pharmacy-medium px-4 py-3 text-sm font-semibold text-white transition hover:bg-pharmacy-dark disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={
                                !cart.items.length ||
                                creatingOrder ||
                                (cart.has_prescription_required_items && !cart.has_uploaded_prescription)
                            }
                        >
                            {creatingOrder ? 'Creating...' : 'Checkout'}
                        </button>

                        {cart.has_prescription_required_items && !cart.has_uploaded_prescription && (
                            <p className="mt-3 text-sm text-pharmacy-light/80">
                                Upload the required prescription before checkout.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
