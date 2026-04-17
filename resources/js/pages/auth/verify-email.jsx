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
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Verify Email</h1>
                    <p className="mt-2 text-sm text-gray-600">Please verify your email address before continuing.</p>
                </div>
                <FlashMessages flash={flash} status={message} />
                <div className="rounded-lg border bg-white p-6 shadow">
                    <button type="button" onClick={resend} className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={loading}>{loading ? 'Sending...' : 'Resend verification email'}</button>
                    <Link href="/logout" method="post" as="button" className="mt-3 w-full rounded-lg border px-4 py-2 text-sm">Logout</Link>
                </div>
            </div>
        </Layout>
    );
}
