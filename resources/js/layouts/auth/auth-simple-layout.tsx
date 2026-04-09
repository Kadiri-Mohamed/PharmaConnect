import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#F4F7ED] p-6 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,110,101,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(76,175,80,0.16),transparent_45%)]" />

            <div className="relative w-full max-w-md rounded-3xl border border-[#2E6E65]/10 bg-white/95 p-7 shadow-lg shadow-[#2E6E65]/10 sm:p-8">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2E6E65]">
                                <AppLogoIcon className="size-7 fill-current text-white" />
                            </div>
                            <span className="text-lg font-bold text-[#2E6E65]">PharmaConnect</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold text-[#2B3752]">{title}</h1>
                            <p className="text-center text-sm text-slate-600">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
