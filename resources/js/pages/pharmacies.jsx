import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function PharmaciesPage({ pharmacies = [] }) {
    return (
        <Layout>
            <Head title="Pharmacies" />

            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Pharmacies</h1>
                    <p className="mt-2 text-sm text-gray-600">Browse all pharmacies and open their details pages.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {pharmacies.map((pharmacy) => (
                        <div key={pharmacy.id} className="rounded-lg border bg-white p-5 shadow">
                            <h2 className="text-lg font-semibold">{pharmacy.name}</h2>
                            <div className="mt-3 space-y-1 text-sm text-gray-600">
                                <p>Address: {pharmacy.address}</p>
                                <p>Phone: {pharmacy.phone}</p>
                                <p>Medicaments: {pharmacy.medicament_count}</p>
                                <p>Available: {pharmacy.available_medicaments}</p>
                                <p>Guard Status: {pharmacy.status_garde ? 'De garde' : 'Normal'}</p>
                            </div>
                            <Link href={`/pharmacies/${pharmacy.id}`} className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">
                                View details
                            </Link>
                        </div>
                    ))}
                </div>

                {pharmacies.length === 0 && <div className="rounded-lg border bg-white p-6 text-sm text-gray-600 shadow">No pharmacies found.</div>}
            </div>
        </Layout>
    );
}
