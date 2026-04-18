import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';
import { getGuardBadgeClass } from '@/utils/ui.js';

export default function PharmaciesPage({ pharmacies = [] }) {
    return (
        <Layout>
            <Head title="Pharmacies" />

            <div className="space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Directory</p>
                    <h1 className="mt-2 text-3xl font-semibold">Pharmacies</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Browse pharmacy profiles, compare availability, and jump into detailed listings for each
                        location.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pharmacies.map((pharmacy) => (
                        <div key={pharmacy.id} className="page-card">
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-lg font-semibold">{pharmacy.name}</h2>
                                <span className={getGuardBadgeClass(pharmacy.status_garde)}>
                                    {pharmacy.status_garde ? 'On duty' : 'Standard'}
                                </span>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-slate-600">
                                <p>Address: {pharmacy.address}</p>
                                <p>Phone: {pharmacy.phone}</p>
                                <p>Medicaments: {pharmacy.medicament_count}</p>
                                <p>Available: {pharmacy.available_medicaments}</p>
                            </div>
                            <Link href={`/pharmacies/${pharmacy.id}`} className="mt-5 inline-flex btn-primary">
                                View details
                            </Link>
                        </div>
                    ))}
                </div>

                {pharmacies.length === 0 && (
                    <div className="page-card-static text-sm text-slate-500">No pharmacies found.</div>
                )}
            </div>
        </Layout>
    );
}
