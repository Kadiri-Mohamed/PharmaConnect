import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { auth } = usePage().props;
    const { post, processing } = useForm({});

    const submit = (event) => {
        event.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="Please verify your email"
            description={`We sent a verification link to ${auth.user.email}. Verify your email address to unlock PharmaConnect's protected features.`}
        >
            <Head title="Verify email" />

            <div className="space-y-6">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Please verify your email before accessing your dashboard, orders, cart, prescriptions, and pharmacy tools.
                </div>

                {status === 'verification-link-sent' && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        Verification link sent! Please check your inbox.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4 text-center">
                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Resend email
                    </Button>

                    <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                        Log out
                    </TextLink>
                </form>
            </div>
        </AuthLayout>
    );
}
