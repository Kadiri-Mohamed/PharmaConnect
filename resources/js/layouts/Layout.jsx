import { Link, usePage } from '@inertiajs/react';
import MedicineAssistant from '@/components/MedicineAssistant.jsx';

const guestLinks = [
    { href: '/', label: 'Home' },
    { href: '/pharmacies', label: 'Pharmacies' },
    { href: '/medicaments', label: 'Medicaments' },
];

const clientLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/pharmacies', label: 'Pharmacies' },
    { href: '/medicaments', label: 'Medicaments' },
    { href: '/cart', label: 'Cart' },
    { href: '/orders', label: 'Orders' },
    { href: '/rare-requests', label: 'Rare Requests' },
];

const pharmacistLinks = [
    { href: '/pharmacien/dashboard', label: 'Dashboard' },
    { href: '/my-pharmacy', label: 'My Pharmacy' },
    { href: '/pharmacien/medicaments', label: 'Medicaments' },
    { href: '/pharmacien/orders', label: 'Orders' },
    { href: '/pharmacien/rare-requests', label: 'Rare Requests' },
];

export default function Layout({ children }) {
    const page = usePage();
    const user = page.props.auth?.user;
    const currentUrl = page.url.split('?')[0];
    const links = !user ? guestLinks : user.role === 'pharmacien' ? pharmacistLinks : clientLinks;
    const linkClasses = (active) => active? 'rounded-xl border border-pharmacy-light/30 bg-pharmacy-medium/25 px-4 py-2 text-sm font-semibold text-white shadow-sm': 'rounded-xl px-4 py-2 text-sm font-medium text-pharmacy-light/85 hover:bg-white/10 hover:text-white';

    return (
        <div className="min-h-screen text-slate-700">
            <nav className="sticky top-0 z-40 border-b border-pharmacy-light/15 bg-pharmacy-deepest/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <Link href="/" className="flex items-center gap-3 text-white">
                       
                        <span>
                            <span className="block text-xl font-bold">Pharma Connect</span>
                            <span className="block text-xs uppercase tracking-[0.22em] text-pharmacy-light/70">
                                Pharmacy platform
                            </span>
                        </span>
                    </Link>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        {user && (
                            <span className="rounded-full border border-pharmacy-light/25 bg-pharmacy-light/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-pharmacy-light/80">
                                {user.role}
                            </span>
                        )}
                        {links.map((link) => {
                            const active =
                                currentUrl === link.href ||
                                (link.href !== '/' && currentUrl.startsWith(`${link.href}/`));

                            return (
                                <Link key={link.href} href={link.href} className={linkClasses(active)}>
                                    {link.label}
                                </Link>
                            );
                        })}

                        {!user && (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-xl border border-pharmacy-light/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-xl bg-pharmacy-medium px-4 py-2 text-sm font-semibold text-white hover:bg-pharmacy-dark"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        {user && (
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="rounded-xl border border-pharmacy-light/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                            >
                                Logout
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            <MedicineAssistant />
        </div>
    );
}
