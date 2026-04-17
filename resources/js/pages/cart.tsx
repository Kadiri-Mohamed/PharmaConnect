import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import Layout from '@/layouts/Layout.jsx';

type CartItem = {
  id: number;
  medicament_id: number;
  pharmacy_id: number | null;
  medicament_name: string | null;
  price: number | null;
  quantity: number;
  subtotal: number;
  requires_prescription: boolean;
};

type CartData = {
  id: number | null;
  pharmacy_id: number | null;
  has_valid_prescription: boolean;
  has_uploaded_prescription: boolean;
  has_prescription_required_items: boolean;
  items: CartItem[];
  total: number;
  item_count: number;
};

type PageProps = {
  flash?: {
    success?: string | null;
    error?: string | null;
  };
};

const emptyCart: CartData = {
  id: null,
  pharmacy_id: null,
  has_valid_prescription: false,
  has_uploaded_prescription: false,
  has_prescription_required_items: false,
  items: [],
  total: 0,
  item_count: 0,
};

export default function CartPage({ cart = emptyCart }: { cart: CartData }) {
  const { flash } = usePage<PageProps>().props;
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [selectedPrescriptionFile, setSelectedPrescriptionFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState('');
  const prescriptionInputRef = useRef<HTMLInputElement | null>(null);

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) return;

    setLocalError('');
    router.put(
      route('cart.update', itemId),
      { quantity },
      {
        preserveScroll: true,
        onStart: () => setBusyAction(`update-${itemId}`),
        onFinish: () => setBusyAction(null),
      },
    );
  };

  const removeItem = (itemId: number) => {
    setLocalError('');
    router.delete(route('cart.destroy', itemId), {
      preserveScroll: true,
      onStart: () => setBusyAction(`remove-${itemId}`),
      onFinish: () => setBusyAction(null),
    });
  };

  const clearCart = () => {
    setLocalError('');
    router.delete(route('cart.clear'), {
      preserveScroll: true,
      onStart: () => setBusyAction('clear'),
      onFinish: () => setBusyAction(null),
    });
  };

  const createOrder = () => {
    const pharmacyId =
      cart.pharmacy_id ??
      (cart.items.length > 0 ? Number(cart.items[0].pharmacy_id ?? 0) || null : null);

    if (!pharmacyId) {
      setLocalError('Unable to detect pharmacy for this cart. Please re-add your items.');
      return;
    }

    setLocalError('');
    router.post(
      route('orders.store'),
      { pharmacy_id: pharmacyId },
      {
        preserveScroll: true,
        onStart: () => setCreatingOrder(true),
        onFinish: () => setCreatingOrder(false),
      },
    );
  };

  const uploadPrescription = () => {
    if (!selectedPrescriptionFile) {
      setLocalError('Please choose a prescription file first.');
      return;
    }

    setLocalError('');
    router.post(
      route('prescriptions.store'),
      { image: selectedPrescriptionFile },
      {
        forceFormData: true,
        preserveScroll: true,
        onStart: () => setUploadingPrescription(true),
        onSuccess: () => {
          setSelectedPrescriptionFile(null);
          if (prescriptionInputRef.current) {
            prescriptionInputRef.current.value = '';
          }
        },
        onFinish: () => setUploadingPrescription(false),
      },
    );
  };

  const totalPrice = useMemo(() => {
    return cart.items.reduce((sum, item) => {
      const price = Number(item.price ?? item.medicament?.price ?? 0);
      const quantity = Number(item.quantity ?? 0);
      return sum + price * quantity;
    }, 0);
  }, [cart.items]);

  const requiresPrescriptionButMissingUpload =
    cart.has_prescription_required_items && !cart.has_uploaded_prescription;

  const errorMessage = localError || flash?.error;
  const successMessage = flash?.success;

  return (
    <Layout>
      <Head title="Cart" />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white/90 px-6 py-6 shadow-lg shadow-slate-200/50 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#2E6E65]">Your Cart</h1>
              <p className="mt-1 text-sm text-slate-600">Review your items before creating an order.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={clearCart}
                disabled={busyAction !== null || creatingOrder || !cart.items.length}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#2E6E65] hover:text-[#2E6E65] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear Cart
              </button>
              <button
                type="button"
                onClick={createOrder}
                disabled={creatingOrder || busyAction !== null || !cart.items.length}
                className="inline-flex items-center justify-center rounded-2xl bg-[#2E6E65] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285a52] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingOrder ? 'Processing...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>

        {cart.has_prescription_required_items && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-6 py-4 text-sm text-amber-800">
            <p>
              Some items in your cart require a prescription. Upload it here before creating this order.
            </p>
            {cart.has_uploaded_prescription && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                Prescription already uploaded. You can place the order now, or upload a new file to replace it.
              </div>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={prescriptionInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setSelectedPrescriptionFile(e.target.files?.[0] || null)}
                className="block w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#2E6E65] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              <button
                type="button"
                onClick={uploadPrescription}
                disabled={uploadingPrescription || !selectedPrescriptionFile}
                className="inline-flex items-center justify-center rounded-lg bg-[#2E6E65] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#285f57] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingPrescription ? 'Uploading...' : 'Upload Prescription'}
              </button>
            </div>
            <p className="mt-3 text-xs text-amber-700">After upload, you can create the order and the pharmacy will review it.</p>
          </div>
        )}

        {successMessage && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700 shadow-sm">
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.7fr_0.8fr]">
          <section className="overflow-hidden rounded-[2rem] bg-white/90 shadow-lg shadow-slate-200/40">
            <div className="border-b border-slate-200 px-6 py-4 sm:px-8">
              <h2 className="text-xl font-semibold text-[#2B3752]">Cart items</h2>
              <p className="mt-1 text-sm text-slate-500">Update quantities or remove products before checking out.</p>
            </div>

            <div className="min-w-full overflow-x-auto px-4 py-4 sm:px-6">
              {cart.items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-slate-600">
                  <p className="text-lg font-medium">Your cart is empty.</p>
                  <p className="mt-2 text-sm">Add medicines from the pharmacy list to proceed.</p>
                  <div className="mt-6">
                    <Link
                      href="/pharmacies"
                      className="inline-flex rounded-2xl bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#43a047]"
                    >
                      Browse pharmacies
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <table className="min-w-full border-separate border-spacing-0 text-sm">
                    <thead className="bg-[#F4F7ED] text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="px-4 py-4 sm:px-6">Product</th>
                        <th className="px-4 py-4 text-right sm:px-6">Price</th>
                        <th className="px-4 py-4 text-right sm:px-6">Quantity</th>
                        <th className="px-4 py-4 text-right sm:px-6">Subtotal</th>
                        <th className="px-4 py-4 text-right sm:px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map((item) => {
                        const name = item.medicament_name || 'Unknown medicament';
                        const price = Number(item.price ?? 0);
                        const quantity = Number(item.quantity ?? 0);
                        const subtotal = price * quantity;
                        const itemIsBusy =
                          busyAction === `update-${item.id}` || busyAction === `remove-${item.id}`;

                        return (
                          <tr key={item.id} className="border-t border-slate-200">
                            <td className="px-4 py-4 sm:px-6">
                              <div className="max-w-[240px] text-sm font-medium text-slate-900">{name}</div>
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-slate-600 sm:px-6">${price.toFixed(2)}</td>
                            <td className="px-4 py-4 sm:px-6">
                              <div className="mx-auto flex max-w-[140px] items-center justify-end gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-sm">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, quantity - 1)}
                                  disabled={quantity <= 1 || itemIsBusy || creatingOrder || uploadingPrescription}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2E6E65] transition hover:bg-[#2E6E65]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  -
                                </button>
                                <span className="w-10 text-center text-sm text-slate-700">{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, quantity + 1)}
                                  disabled={itemIsBusy || creatingOrder || uploadingPrescription}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2E6E65] text-white transition hover:bg-[#285a52] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right text-sm font-semibold text-[#2E6E65] sm:px-6">${subtotal.toFixed(2)}</td>
                            <td className="px-4 py-4 text-right sm:px-6">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                disabled={itemIsBusy || creatingOrder || uploadingPrescription}
                                className="rounded-2xl bg-[#4CAF50] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#43a047] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-[2rem] bg-[#2E6E65] px-6 py-6 text-white shadow-lg shadow-slate-200/30 sm:px-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#A7DBC7]">Order summary</p>
                <h2 className="mt-2 text-2xl font-semibold">Total</h2>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <div className="flex items-center justify-between text-sm text-slate-100">
                  <span>Items</span>
                  <span>{cart.items.length}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-3xl font-semibold text-white">
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={createOrder}
                disabled={cart.items.length === 0 || creatingOrder || busyAction !== null || uploadingPrescription || requiresPrescriptionButMissingUpload}
                className="w-full rounded-3xl bg-[#4CAF50] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#43a047] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingOrder ? 'Creating order...' : 'Create Order'}
              </button>
              <Link
                href="/pharmacies"
                className="block rounded-3xl border border-white/20 bg-white/10 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-white/20"
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>

        {errorMessage && (
          <div className="rounded-3xl border border-[#E53E3E]/20 bg-[#FDE8E8] px-6 py-4 text-sm text-[#9B2C2C] shadow-sm">
            {errorMessage}
          </div>
        )}
      </div>
    </Layout>
  );
}
