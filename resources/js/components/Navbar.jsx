import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const ROLE_LINKS = {
    client: [
        { label: 'Home', href: '/' },
        { label: 'Pharmacies', href: '/pharmacies' },
        { label: 'Medicaments', href: '/medicaments' },
        { label: 'Cart', href: '/cart' },
        { label: 'Orders', href: '/orders' },
        { label: 'Prescriptions', href: '/prescriptions' },
        { label: 'Rare Requests', href: '/rare-requests' },
    ],
    pharmacien: [
        { label: 'Dashboard', href: '/pharmacien/dashboard' },
        { label: 'My Pharmacy', href: '/pharmacien/my-pharmacy' },
        { label: 'Medicaments', href: '/pharmacien/medicaments' },
        { label: 'Orders', href: '/pharmacien/orders' },
        { label: 'Rare Requests', href: '/pharmacien/rare-requests' },
    ],
};

const normalizePath = (path) => path.replace(/\/+$/, '') || '/';

export default function Navbar() {
    const page = usePage();
    const user = page.props?.auth?.user;
    const [isOpen, setIsOpen] = useState(false);

    const role = user?.role === 'pharmacien' ? 'pharmacien' : 'client';
    const links = useMemo(() => ROLE_LINKS[role] ?? [], [role]);
    const currentPath = normalizePath(page.url.split('?')[0]);

    if (!user) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 border-b border-[#2E6E65]/10 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link href={role === 'pharmacien' ? '/pharmacien/dashboard' : '/dashboard'} className="text-lg font-bold text-[#2E6E65]">
                    PharmaConnect
                </Link>

                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg p-2 text-[#2B3752] hover:bg-[#F4F7ED] md:hidden"
                    onClick={() => setIsOpen((value) => !value)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                <nav className="hidden items-center gap-2 md:flex">
                    {links.map((item) => {
                        const itemPath = normalizePath(item.href);
                        const isActive = currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                    isActive
                                        ? 'bg-[#2E6E65] text-white'
                                        : 'text-[#2B3752] hover:bg-[#F4F7ED] hover:text-[#2E6E65]'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="ml-2 rounded-lg bg-[#4CAF50] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#409444]"
                    >
                        Logout
                    </Link>
                </nav>
            </div>

            {isOpen && (
                <nav className="border-t border-[#2E6E65]/10 bg-white px-4 py-3 md:hidden">
                    <div className="flex flex-col gap-2">
                        {links.map((item) => {
                            const itemPath = normalizePath(item.href);
                            const isActive = currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                        isActive ? 'bg-[#2E6E65] text-white' : 'text-[#2B3752] hover:bg-[#F4F7ED]'
                                    }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-lg bg-[#4CAF50] px-3 py-2 text-left text-sm font-semibold text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            Logout
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}
