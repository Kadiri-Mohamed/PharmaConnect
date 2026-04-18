import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function VerifyEmailPage({ status }) {
    const { flash } = usePage().props;
    const [loading, setLoading] = useState(false);

    const resend = () => {
        router.post('/email/verification-notification', {}, { onStart: () => setLoading(true), onFinish: () => setLoading(false) });
    };

    const message = status === 'verification-link-sent' ? 'A new verification link has been sent.' : status;

    return (
        <Layout>
            <Head title="Verify Email" />
            <div className="mx-auto max-w-md space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Email Verification</p>
                    <h1 className="mt-2 text-3xl font-semibold">Verify Email</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Please verify your email address before continuing.
                    </p>
                </div>
                <FlashMessages flash={flash} status={message} />
                <div className="page-card-static">
                    <button type="button" onClick={resend} className="btn-primary w-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Resend verification email'}
                    </button>
                    <Link href="/logout" method="post" as="button" className="btn-secondary mt-3 w-full">
                        Logout
                    </Link>
                </div>
            </div>
        </Layout>
    );
}
