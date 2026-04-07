import { Head } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function ManageMedicamentsPage() {
    return (
        <Layout>
            <Head title="Manage Medicaments" />
            <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-[#2E6E65]">Manage Medicaments</h1>
                <p className="mt-2 text-sm text-slate-600">Pharmacien medicament management page.</p>
            </div>
        </Layout>
    );
}
