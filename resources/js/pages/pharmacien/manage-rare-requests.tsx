import { Head } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function ManageRareRequestsPage() {
    return (
        <Layout>
            <Head title="Manage Rare Requests" />
            <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-[#2E6E65]">Manage Rare Requests</h1>
                <p className="mt-2 text-sm text-slate-600">Pharmacien rare requests management page.</p>
            </div>
        </Layout>
    );
}
