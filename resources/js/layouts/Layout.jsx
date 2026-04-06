import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function Layout({ children, title = 'PharmaConnect' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7ED] text-slate-900">
      <div className="mx-auto min-h-screen max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-50 rounded-3xl bg-white/90 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-[#2E6E65]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2E6E65]/10 text-2xl font-bold text-[#2E6E65]">
                P
              </span>
              <span>{title}</span>
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-[#F4F7ED] sm:hidden"
              aria-label="Toggle navigation"
              onClick={() => setIsOpen((value) => !value)}
            >
              <span className="sr-only">Open navigation</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>

            <nav className={`w-full sm:flex sm:w-auto ${isOpen ? 'block' : 'hidden'}`}>
              <ul className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Pharmacies', href: '/pharmacies' },
                  { label: 'Cart', href: '/cart' },
                  { label: 'Orders', href: '/orders' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#2E6E65]/10 hover:text-[#2E6E65] sm:px-3"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <main className="mt-8 rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_25px_60px_-35px_rgba(46,110,101,0.45)] sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
