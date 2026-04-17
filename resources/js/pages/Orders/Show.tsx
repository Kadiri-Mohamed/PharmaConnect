import { Head, Link, usePage } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

type OrderItem = {
  id: number;
  medicament_id: number;
  medicament_name: string | null;
  quantity: number;
  price: number;
  subtotal: number;
};

type OrderDetails = {
  id: number;
  user_id: number;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  pharmacy: {
    id: number;
    name: string;
    address: string;
    phone: string;
  };
  prescription: {
    id: number;
    status: string;
    file_url: string;
  } | null;
  items: OrderItem[];
};

type PageProps = {
  flash?: {
    success?: string | null;
    error?: string | null;
  };
};

const statusStyles: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function OrderShowPage({ order }: { order: OrderDetails }) {
  const { flash } = usePage<PageProps>().props;
  const status = String(order.status || '').toLowerCase();
  const statusClass = statusStyles[status] || 'bg-slate-100 text-slate-700';

  return (
    <Layout>
      <Head title={`Order #${order.id}`} />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href={route('orders')} className="text-sm font-semibold text-[#2E6E65] underline">
              Back to orders
            </Link>
            <h1 className="mt-2 text-3xl font-semibold text-[#2E6E65]">Order #{order.id}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${statusClass}`}>
            {status}
          </span>
        </div>

        {flash?.success && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700 shadow-sm">
            {flash.success}
          </div>
        )}

        {flash?.error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-sm">
            {flash.error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="overflow-hidden rounded-[2rem] bg-white/90 shadow-lg shadow-slate-200/40">
            <div className="border-b border-slate-200 px-6 py-4 sm:px-8">
              <h2 className="text-xl font-semibold text-[#2B3752]">Items</h2>
              <p className="mt-1 text-sm text-slate-500">Everything included in this order.</p>
            </div>

            <div className="overflow-x-auto px-4 py-4 sm:px-6">
              {order.items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-600">
                  No items found for this order.
                </div>
              ) : (
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <table className="min-w-full border-separate border-spacing-0 text-sm">
                    <thead className="bg-[#F4F7ED] text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="px-4 py-4 sm:px-6">Medicament</th>
                        <th className="px-4 py-4 text-right sm:px-6">Price</th>
                        <th className="px-4 py-4 text-right sm:px-6">Quantity</th>
                        <th className="px-4 py-4 text-right sm:px-6">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-t border-slate-200">
                          <td className="px-4 py-4 font-medium text-slate-900 sm:px-6">
                            {item.medicament_name || `Medicament #${item.medicament_id}`}
                          </td>
                          <td className="px-4 py-4 text-right text-slate-600 sm:px-6">
                            ${Number(item.price ?? 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-right text-slate-600 sm:px-6">{item.quantity}</td>
                          <td className="px-4 py-4 text-right font-semibold text-[#2E6E65] sm:px-6">
                            ${Number(item.subtotal ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/40">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pharmacy</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#2B3752]">{order.pharmacy.name}</h2>
              <p className="mt-4 text-sm text-slate-600">{order.pharmacy.address}</p>
              <p className="mt-1 text-sm text-slate-600">{order.pharmacy.phone}</p>
            </section>

            <section className="rounded-[2rem] bg-[#2E6E65] p-6 text-white shadow-lg shadow-slate-200/30">
              <p className="text-sm uppercase tracking-[0.2em] text-[#A7DBC7]">Summary</p>
              <div className="mt-4 rounded-3xl bg-white/10 p-5">
                <div className="flex items-center justify-between text-sm text-slate-100">
                  <span>Total items</span>
                  <span>{order.items.length}</span>
                </div>
                <div className="mt-3 text-3xl font-semibold">${Number(order.total_price ?? 0).toFixed(2)}</div>
              </div>

              {order.prescription ? (
                <div className="mt-5 rounded-3xl bg-white/10 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A7DBC7]">Prescription</p>
                  <p className="mt-3 text-sm text-white">{order.prescription.status}</p>
                  <a
                    href={order.prescription.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm font-semibold text-white underline"
                  >
                    View prescription
                  </a>
                </div>
              ) : (
                <div className="mt-5 rounded-3xl bg-white/10 p-5 text-sm text-slate-100">
                  No prescription was attached to this order.
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
