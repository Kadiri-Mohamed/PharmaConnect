import { Head } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function MyPharmacyPage() {
    return (
        <Layout>
            <Head title="My Pharmacy" />
            <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-[#2E6E65]">My Pharmacy</h1>
                <p className="mt-2 text-sm text-slate-600">Manage your pharmacy profile and details.</p>
            </div>
        </Layout>
    );
}
