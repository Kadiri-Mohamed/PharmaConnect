import { Head } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Layout from '@/layouts/Layout.jsx';

interface Prescription {
    id: number;
    image: string;
    status: string;
    created_at: string;
}

export default function PrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchPrescriptions = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/prescriptions', {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.message || 'Unable to load prescriptions.');
            }

            const data = await response.json();
            setPrescriptions(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unexpected error loading prescriptions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        setSuccess('');
        setError('');

        if (!selectedFile) {
            setError('Please choose a file to upload.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await fetch('/api/prescriptions', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.message || 'Unable to upload prescription.');
            }

            const data = await response.json();
            setSuccess(data?.message || 'Prescription uploaded successfully.');
            setSelectedFile(null);
            await fetchPrescriptions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unexpected error uploading prescription.');
        } finally {
            setUploading(false);
        }
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

                {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#2B3752]">Upload New Prescription</h2>
                    <form onSubmit={handleUpload} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <label className="mb-1 block text-sm font-medium text-[#2B3752]">File (JPG, PNG, PDF, max 5MB)</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileChange}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="rounded-lg bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white hover:bg-[#285f57] disabled:opacity-60"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#2B3752]">My Uploads</h2>
                    {loading ? (
                        <p className="mt-4 text-sm text-slate-500">Loading prescriptions...</p>
                    ) : prescriptions.length === 0 ? (
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
                                                    href={`/storage/${item.image}`}
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
