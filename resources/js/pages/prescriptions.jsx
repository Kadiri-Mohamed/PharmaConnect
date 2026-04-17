import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function PrescriptionsPage({ prescriptions = [] }) {
    const { errors, flash } = usePage().props;
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        router.post('/prescriptions', { image: file }, { forceFormData: true, preserveScroll: true, onStart: () => setUploading(true), onSuccess: () => setFile(null), onFinish: () => setUploading(false) });
    };

    return (
        <Layout>
            <Head title="Prescriptions" />

            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Prescriptions</h1>
                    <p className="mt-2 text-sm text-gray-600">Upload a prescription and review all previous uploads.</p>
                </div>

                <FlashMessages flash={flash} />

                <form onSubmit={submit} className="rounded-lg border bg-white p-6 shadow">
                    <label className="block text-sm font-medium">Prescription file</label>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
                    <FormError message={errors.image} />
                    <button type="submit" className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={!file || uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>

                <div className="rounded-lg border bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold">My Uploads</h2>
                    {prescriptions.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-600">No prescriptions uploaded yet.</p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-3 py-2">File</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="px-3 py-2"><a href={item.file_url} target="_blank" rel="noreferrer" className="underline">View file</a></td>
                                            <td className="px-3 py-2">{item.status}</td>
                                            <td className="px-3 py-2">{new Date(item.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
