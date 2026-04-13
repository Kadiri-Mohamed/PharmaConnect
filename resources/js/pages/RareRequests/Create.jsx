import axios from 'axios';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/layouts/Layout.jsx';

const initialForm = {
    medicine_name: '',
    description: '',
};

export default function RareRequestsCreatePage() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await axios.post('/api/rare-requests', form, {
                headers: { Accept: 'application/json' },
            });

            setSuccessMessage(response?.data?.message || 'Request sent successfully.');
            setForm(initialForm);
        } catch (error) {
            if (error?.response?.status === 422) {
                setErrors(error?.response?.data?.errors || {});
            } else {
                setErrorMessage(error?.response?.data?.message || 'Unable to create rare request.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Layout>
            <Head title="Request Rare Medicine" />

            <div className="mx-auto max-w-3xl space-y-6">
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#2E6E65]">Request Rare Medicine</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Can't find a medicine? Submit a request and pharmacies will review availability.
                    </p>
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label htmlFor="medicine_name" className="mb-1 block text-sm font-medium text-[#2B3752]">
                                Medicine Name
                            </label>
                            <input
                                id="medicine_name"
                                type="text"
                                value={form.medicine_name}
                                onChange={(e) => updateField('medicine_name', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                                placeholder="Enter medicine name"
                                disabled={processing}
                            />
                            {errors.medicine_name && <p className="mt-1 text-xs text-red-600">{errors.medicine_name[0]}</p>}
                        </div>

                        <div>
                            <label htmlFor="description" className="mb-1 block text-sm font-medium text-[#2B3752]">
                                Description (optional)
                            </label>
                            <textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                                placeholder="Dosage, brand, or additional details"
                                disabled={processing}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description[0]}</p>}
                        </div>

                        {successMessage && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {successMessage}
                            </div>
                        )}

                        {errorMessage && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white hover:bg-[#285f57] disabled:opacity-60"
                            >
                                {processing ? 'Submitting...' : 'Submit Request'}
                            </button>
                            <Link href="/rare-requests" className="text-sm font-semibold text-[#2E6E65] underline">
                                View Requests
                            </Link>
                        </div>
                    </form>
                </section>
            </div>
        </Layout>
    );
}
