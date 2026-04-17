import { Head, useForm, usePage } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import Layout from '@/layouts/Layout.jsx';

interface Prescription {
    id: number;
    image: string;
    status: string;
    created_at: string;
    file_url: string;
}

type PageProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};

export default function PrescriptionsPage({ prescriptions = [] }: { prescriptions: Prescription[] }) {
    const { flash } = usePage<PageProps>().props;
    const form = useForm<{ image: File | null }>({ image: null });
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        form.setData('image', file);
    };

    useEffect(() => {
        if (!form.data.image && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [form.data.image]);

    const handleUpload = (e: FormEvent) => {
        e.preventDefault();

        form.post(route('prescriptions.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <Layout>
            <Head title="Prescriptions" />

            <div className="mx-auto max-w-5xl space-y-6">
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#2E6E65]">Prescriptions</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Upload your prescription if a medicine requires validation.
                    </p>
                </section>

                {flash?.error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{flash.error}</div>}
                {flash?.success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{flash.success}</div>}

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#2B3752]">Upload New Prescription</h2>
                    <form onSubmit={handleUpload} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <label className="mb-1 block text-sm font-medium text-[#2B3752]">File (JPG, PNG, PDF, max 5MB)</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileChange}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                            {form.errors.image && <p className="mt-1 text-xs text-red-600">{form.errors.image}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-lg bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white hover:bg-[#285f57] disabled:opacity-60"
                        >
                            {form.processing ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#2B3752]">My Uploads</h2>
                    {prescriptions.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">No prescriptions uploaded yet.</p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-2 py-3">File</th>
                                        <th className="px-2 py-3">Status</th>
                                        <th className="px-2 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-100">
                                            <td className="px-2 py-3">
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[#2E6E65] hover:underline"
                                                >
                                                    View File
                                                </a>
                                            </td>
                                            <td className="px-2 py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    item.status === 'validated'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : item.status === 'rejected'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-slate-600">
                                                {new Date(item.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
