import { Link, usePage } from '@inertiajs/react';

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
    { href: '/prescriptions', label: 'Prescriptions' },
    { href: '/rare-requests', label: 'Rare Requests' },
];

const pharmacistLinks = [
    { href: '/pharmacien/dashboard', label: 'Dashboard' },
    { href: '/create-pharmacy', label: 'Create Pharmacy' },
    { href: '/my-pharmacy', label: 'My Pharmacy' },
    { href: '/pharmacien/medicaments', label: 'Medicaments' },
    { href: '/pharmacien/orders', label: 'Orders' },
    { href: '/pharmacien/rare-requests', label: 'Rare Requests' },
];

export default function Layout({ children }) {
    const page = usePage();
    const user = page.props.auth?.user;
    const currentUrl = page.url.split('?')[0];
    const links = !user
        ? guestLinks
        : user.role === 'pharmacien'
          ? pharmacistLinks
          : clientLinks;

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <nav className="border-b bg-white shadow-sm">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <Link href="/" className="text-xl font-bold">
                        Pharma System
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        {links.map((link) => {
                            const active =
                                currentUrl === link.href ||
                                (link.href !== '/' && currentUrl.startsWith(`${link.href}/`));

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-lg px-3 py-2 text-sm ${
                                        active ? 'bg-gray-900 text-white' : 'border bg-white'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}

                        {!user && (
                            <>
                                <Link href="/login" className="rounded-lg border bg-white px-3 py-2 text-sm">
                                    Login
                                </Link>
                                <Link href="/register" className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white">
                                    Register
                                </Link>
                            </>
                        )}

                        {user && (
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="rounded-lg border bg-white px-3 py-2 text-sm"
                            >
                                Logout
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}
