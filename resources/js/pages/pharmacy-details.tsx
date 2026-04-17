import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import Layout from '@/layouts/Layout.jsx';

interface Pharmacy {
    id: number;
    name: string;
    address: string;
    phone: string;
    status_garde: boolean;
    medicament_count?: number;
    available_medicaments?: number;
}

interface Medicament {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    requires_prescription: boolean;
}

export default function PharmacyDetailsPage({
    pharmacy,
    medicaments = [],
}: {
    pharmacy: Pharmacy | null;
    medicaments: Medicament[];
}) {
    const inStockCount = useMemo(
        () => medicaments.filter((item) => Number(item.stock ?? 0) > 0).length,
        [medicaments],
    );

    return (
        <Layout>
            <Head title={pharmacy ? `${pharmacy.name} | Pharmacy Details` : 'Pharmacy Details'} />

            <div className="mx-auto max-w-6xl space-y-6">
                <Link href="/pharmacies" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Back to Pharmacies
                </Link>

                {pharmacy ? (
                    <>
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="text-3xl font-semibold text-[#2E6E65]">{pharmacy.name}</h1>
                                    <p className="mt-1 text-sm text-slate-600">{pharmacy.address}</p>
                                    <p className="mt-1 text-sm text-slate-600">{pharmacy.phone}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${pharmacy.status_garde ? 'bg-[#4CAF50]/15 text-[#2E6E65]' : 'bg-slate-100 text-slate-700'}`}>
                                        {pharmacy.status_garde ? 'De garde' : 'Normal'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {inStockCount}/{medicaments.length} medicaments in stock
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h2 className="text-xl font-semibold text-[#2B3752]">Available Medicaments</h2>
                                <p className="mt-1 text-sm text-slate-500">Browse this pharmacy inventory.</p>
                            </div>

                            {medicaments.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-600">
                                    No medicaments found for this pharmacy.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-[#F4F7ED] text-xs uppercase tracking-[0.1em] text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Price</th>
                                                <th className="px-4 py-3">Stock</th>
                                                <th className="px-4 py-3">Prescription</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {medicaments.map((item) => (
                                                <tr key={item.id} className="border-t border-slate-100">
                                                    <td className="px-4 py-3 text-[#2B3752]">
                                                        <div className="font-medium">{item.name}</div>
                                                        {item.description && <div className="mt-1 text-xs text-slate-500">{item.description}</div>}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-[#2E6E65]">
                                                        ${Number(item.price ?? 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {Number(item.stock ?? 0) > 0 ? (
                                                            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                                {item.stock}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                                Out of stock
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">
                                                        {item.requires_prescription ? 'Required' : 'Not required'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                        Pharmacy not found.
                    </div>
                )}
            </div>
        </Layout>
    );
}
