import { Head, Link, usePage } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function WelcomePage() {
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth?.user);

    return (
        <Layout>
            <Head title="Welcome" />
            <div className="space-y-6">
                <div className="hero-card overflow-hidden">
                    <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
                        <div>
                            <p className="section-kicker">Connected Care</p>
                            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                                Modern pharmacy operations with a calmer, clearer workflow.
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                                Manage pharmacy listings, medicament availability, prescriptions, rare medicine
                                requests, and order tracking in one polished Laravel + Inertia experience.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href="/pharmacies" className="btn-secondary">
                                    Browse pharmacies
                                </Link>
                                <Link href="/medicaments" className="btn-secondary">
                                    Browse medicaments
                                </Link>
                                <Link href={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary">
                                    {isAuthenticated ? 'Go to dashboard' : 'Create account'}
                                </Link>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-pharmacy-deepest p-6 text-white shadow-pharmacy-lg">
                            <p className="section-kicker text-pharmacy-light/70">What this unlocks</p>
                            <div className="mt-5 space-y-4">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-sm text-pharmacy-light/80">Clients</p>
                                    <p className="mt-1 text-lg font-semibold text-white">
                                        Discover stock, upload prescriptions, and track every order.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-sm text-pharmacy-light/80">Pharmacists</p>
                                    <p className="mt-1 text-lg font-semibold text-white">
                                        Manage inventory, process requests, and keep delivery flow organized.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="page-card bg-gradient from-pharmacy-light via-white to-pharmacy-lighter/70">
                        <h2 className="text-xl font-semibold">Clients</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Find medicaments faster, upload prescription files, and keep your order timeline in one
                            place.
                        </p>
                    </div>
                    <div className="page-card bg-gradient from-pharmacy-light via-white to-pharmacy-lighter/70">
                        <h2 className="text-xl font-semibold">Pharmacists</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Create and maintain your pharmacy profile, manage stock, and update order progress with
                            confidence.
                        </p>
                    </div>
                    <div className="page-card bg-gradient from-pharmacy-light via-white to-pharmacy-lighter/70">
                        <h2 className="text-xl font-semibold">Fulfillment</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Keep operations clearer with dedicated flows for prescriptions, rare requests, and order
                            readiness.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
