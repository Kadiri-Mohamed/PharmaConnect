import { Head } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function RareRequestsPage() {
    return (
        <Layout>
            <Head title="Rare Requests" />
            <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-[#2E6E65]">Rare Requests</h1>
                <p className="mt-2 text-sm text-slate-600">Client rare requests page.</p>
            </div>
        </Layout>
    );
}
