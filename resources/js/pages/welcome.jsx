import { Head, Link, usePage } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function WelcomePage() {
    const { auth } = usePage().props;

    return (
        <Layout>
            <Head title="Welcome" />
            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-8 shadow">
                    <h1 className="text-3xl font-bold">Pharmacy Management System</h1>
                    <p className="mt-3 max-w-2xl text-sm text-gray-600">A simple Laravel, Inertia, and React pharmacy app for clients and pharmacists.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link href="/pharmacies" className="rounded-lg border px-4 py-2 text-sm">Browse pharmacies</Link>
                        <Link href="/medicaments" className="rounded-lg border px-4 py-2 text-sm">Browse medicaments</Link>
                        <Link href={auth.user ? '/dashboard' : '/register'} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">{auth.user ? 'Go to dashboard' : 'Create account'}</Link>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-white p-5 shadow"><h2 className="font-semibold">Clients</h2><p className="mt-2 text-sm text-gray-600">Find medicaments, upload prescriptions, and track orders.</p></div>
                    <div className="rounded-lg border bg-white p-5 shadow"><h2 className="font-semibold">Pharmacists</h2><p className="mt-2 text-sm text-gray-600">Create a pharmacy, manage stock, and process orders.</p></div>
                </div>
            </div>
        </Layout>
    );
}
