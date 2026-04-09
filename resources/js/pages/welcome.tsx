import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const featureCards = [
    {
        title: 'Find Nearby Pharmacies',
        description: 'Browse pharmacies quickly and compare available medicaments before placing your order.',
    },
    {
        title: 'Order With Confidence',
        description: 'Upload prescriptions when needed and send orders directly to the selected pharmacy.',
    },
    {
        title: 'Track Every Order',
        description: 'Follow order status from pending to delivered with clear updates in your dashboard.',
    },
];

const pharmacistPoints = [
    'Manage pharmacy profile and guard status',
    'Add, edit, and monitor medicament stock',
    'Receive and process client orders in one place',
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="PharmaConnect" />

            <div className="min-h-screen bg-[#F4F7ED] text-[#2B3752]">
                <header className="border-b border-[#2E6E65]/15 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <h1 className="text-xl font-bold text-[#2E6E65] sm:text-2xl">PharmaConnect</h1>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#285f57]"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-xl border border-[#2E6E65]/25 bg-white px-4 py-2 text-sm font-semibold text-[#2E6E65] transition hover:border-[#2E6E65]"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-xl bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#449b48]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                        <div className="rounded-3xl bg-white p-7 shadow-sm sm:p-8">
                            <p className="inline-flex rounded-full bg-[#2E6E65]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2E6E65]">
                                Smart Pharmacy Platform
                            </p>
                            <h2 className="mt-4 text-3xl font-bold leading-tight text-[#2B3752] sm:text-4xl">
                                Fast medicine access for clients and pharmacists
                            </h2>
                            <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
                                PharmaConnect helps clients discover pharmacies, request medicaments, and follow order
                                progress. Pharmacists can manage stock, handle incoming orders, and keep pharmacy
                                information up to date.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href={auth.user ? route('dashboard') : route('register')}
                                    className="rounded-2xl bg-[#2E6E65] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285f57]"
                                >
                                    {auth.user ? 'Open Dashboard' : 'Create Account'}
                                </Link>
                                {!auth.user && (
                                    <Link
                                        href={route('login')}
                                        className="rounded-2xl border border-[#2E6E65]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#2E6E65] transition hover:border-[#2E6E65]"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl bg-[#2E6E65] p-7 text-white shadow-sm sm:p-8">
                            <h3 className="text-lg font-semibold">For Pharmacists</h3>
                            <p className="mt-2 text-sm text-[#d8efe8]">A complete workspace to run daily pharmacy operations.</p>
                            <ul className="mt-5 space-y-3 text-sm">
                                {pharmacistPoints.map((item) => (
                                    <li key={item} className="rounded-xl bg-white/10 px-3 py-2">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="grid gap-5 md:grid-cols-3">
                        {featureCards.map((card) => (
                            <article key={card.title} className="rounded-3xl bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-[#2B3752]">{card.title}</h3>
                                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                            </article>
                        ))}
                    </section>

                    <section className="rounded-3xl border border-dashed border-[#2E6E65]/30 bg-white p-7 shadow-sm sm:p-8">
                        <h3 className="text-xl font-semibold text-[#2B3752]">Coming Next: Pharmacy Map</h3>
                        <p className="mt-2 text-sm text-slate-600 sm:text-base">
                            A live map module will be added here to show nearby pharmacies and guard pharmacies in real
                            time, so users can quickly locate open pharmacies by area.
                        </p>
                        <div className="mt-5 rounded-2xl bg-[#F4F7ED] px-4 py-3 text-sm text-[#2E6E65]">
                            Map placeholder ready for your next integration step.
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
