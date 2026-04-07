import Navbar from '@/components/Navbar.jsx';

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#F4F7ED] text-[#2B3752]">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
