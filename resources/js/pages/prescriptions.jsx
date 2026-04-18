import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import FormError from '@/components/FormError.jsx';
import Layout from '@/layouts/Layout.jsx';
import { formatStatusLabel, getPrescriptionStatusBadgeClass } from '@/utils/ui.js';

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
                <div className="hero-card">
                    <p className="section-kicker">Prescription Center</p>
                    <h1 className="mt-2 text-3xl font-semibold">Prescriptions</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Upload prescription files securely and review the status of your previous submissions.
                    </p>
                </div>

                <FlashMessages flash={flash} />

                <form onSubmit={submit} className="page-card-static">
                    <label className="form-label">Prescription file</label>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(event) => setFile(event.target.files?.[0] || null)}
                        className="form-file"
                    />
                    <FormError message={errors.image} />
                    <button type="submit" className="btn-primary mt-4" disabled={!file || uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>

                <div className="table-card">
                    <div className="border-b border-pharmacy-light/70 px-6 py-5">
                        <h2 className="text-lg font-semibold">My Uploads</h2>
                    </div>
                    {prescriptions.length === 0 ? (
                        <p className="px-6 py-5 text-sm text-slate-500">No prescriptions uploaded yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="table-head">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">File</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map((item) => (
                                        <tr key={item.id} className="table-row">
                                            <td className="px-4 py-3">
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="link-primary"
                                                >
                                                    View file
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={getPrescriptionStatusBadgeClass(item.status)}>
                                                    {formatStatusLabel(item.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {new Date(item.created_at).toLocaleString()}
                                            </td>
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
