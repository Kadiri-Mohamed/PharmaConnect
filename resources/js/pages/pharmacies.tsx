import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pharmacies', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Unable to load pharmacies.');
      }

      const data = await response.json();
      setPharmacies(data.data || data.pharmacies || data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error loading pharmacies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head title="Pharmacies | PharmaConnect" />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white/95 px-6 py-8 shadow-lg shadow-slate-200/50 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#2E6E65]">Pharmacies</h1>
              <p className="mt-1 text-sm text-slate-600">Browse nearby pharmacies and see which ones are currently de garde.</p>
            </div>
            <div className="rounded-3xl bg-[#4CAF50] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#2E6E65]/10">
              {pharmacies.length} pharmacy{pharmacies.length === 1 ? '' : 'ies'}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {loading ? (
            <div className="col-span-full rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-20 text-center text-slate-500 shadow-sm">
              Loading pharmacies...
            </div>
          ) : pharmacies.length === 0 ? (
            <div className="col-span-full rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center text-slate-600">
              <p className="text-lg font-semibold">No pharmacies found.</p>
              <p className="mt-2 text-sm">Please check back later or adjust your search criteria.</p>
            </div>
          ) : (
            pharmacies.map((pharmacy) => {
              const isGarde = Boolean(pharmacy.status_garde);
              return (
                <Link
                  key={pharmacy.id}
                  href={`/pharmacies/${pharmacy.id}`}
                  className="group block rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-[#2B3752]">{pharmacy.name}</h2>
                      <p className="mt-2 text-sm text-slate-500">{pharmacy.address}</p>
                    </div>
                    <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${isGarde ? 'bg-[#4CAF50]/15 text-[#2E6E65]' : 'bg-slate-100 text-slate-700'}`}>
                      {isGarde ? 'De garde' : 'Normal'}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Address</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{pharmacy.address}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Phone</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{pharmacy.phone}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#2E6E65]" />
                      View medicaments
                    </span>
                    {isGarde && <span className="rounded-full bg-[#4CAF50]/10 px-3 py-1 text-xs font-semibold text-[#2E6E65]">Active de garde</span>}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
