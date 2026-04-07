import { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function MedicamentsPage() {
  const [medicaments, setMedicaments] = useState([]);
  const [search, setSearch] = useState('');
  const [pharmacyFilter, setPharmacyFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMedicaments();
  }, []);

  const fetchMedicaments = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/medicaments', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Unable to load medicaments.');
      }

      const data = await response.json();
      setMedicaments(data.data || data.medicaments || data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error loading medicaments.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemId) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ medicament_id: itemId, quantity: 1 }),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Unable to add item to cart.');
      }

      setSuccess('Item added to cart successfully.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error adding to cart.');
    } finally {
      setActionLoading(false);
    }
  };

  const pharmacyOptions = useMemo(() => {
    const pharmacies = medicaments
      .map((item) => item.pharmacy?.name)
      .filter(Boolean);
    return [...new Set(pharmacies)];
  }, [medicaments]);

  const filteredMedicaments = useMemo(() => {
    return medicaments.filter((item) => {
      const name = String(item.name || item.title || '').toLowerCase();
      const pharmacy = String(item.pharmacy?.name || '').toLowerCase();
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || name.includes(query) || pharmacy.includes(query);
      const matchesPharmacy = !pharmacyFilter || item.pharmacy?.name === pharmacyFilter;
      return matchesSearch && matchesPharmacy;
    });
  }, [medicaments, search, pharmacyFilter]);

  return (
    <Layout>
      <Head title="Medicaments | PharmaConnect" />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white/95 px-6 py-8 shadow-lg shadow-slate-200/50 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#2E6E65]">Medicaments</h1>
              <p className="mt-1 text-sm text-slate-600">Find the right medicine and add it to your cart.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-3xl bg-[#4CAF50] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#2E6E65]/10">
                {filteredMedicaments.length} available
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <label htmlFor="search" className="sr-only">Search medicaments</label>
              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search medicines or pharmacy"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <label htmlFor="pharmacy" className="mb-2 block text-sm font-medium text-slate-600">
                Filter by pharmacy
              </label>
              <select
                id="pharmacy"
                value={pharmacyFilter}
                onChange={(event) => setPharmacyFilter(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#2E6E65]"
              >
                <option value="">All pharmacies</option>
                {pharmacyOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700 shadow-sm">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {loading ? (
            <div className="col-span-full rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-20 text-center text-slate-500 shadow-sm">
              Loading medicaments...
            </div>
          ) : filteredMedicaments.length === 0 ? (
            <div className="col-span-full rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center text-slate-600">
              <p className="text-lg font-semibold">No medicaments found.</p>
              <p className="mt-2 text-sm">Adjust your search or pharmacy filter to discover more options.</p>
            </div>
          ) : (
            filteredMedicaments.map((item) => {
              const name = item.name || item.title || 'Untitled medicament';
              const price = Number(item.price ?? 0).toFixed(2);
              const stock = Number(item.stock ?? 0);
              const requiresPrescription = Boolean(item.requires_prescription ?? item.requiresPrescription);
              const pharmacyName = item.pharmacy?.name || 'Unknown pharmacy';
              const outOfStock = stock <= 0;

              return (
                <div key={item.id} className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-[#2B3752]">{name}</h2>
                      <p className="mt-2 text-sm text-slate-500">{pharmacyName}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${outOfStock ? 'bg-red-100 text-red-700' : 'bg-[#4CAF50]/10 text-[#2E6E65]'}`}>
                      {outOfStock ? 'Out of stock' : 'In stock'}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Price</p>
                      <p className="mt-2 text-lg font-semibold text-[#2E6E65]">${price}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Stock</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{stock}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Prescription</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {requiresPrescription ? 'Required' : 'Not required'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-500">
                      {item.pharmacy?.address ?? 'No pharmacy address available'}
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(item.id)}
                      disabled={outOfStock || actionLoading}
                      className={`inline-flex items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold text-white transition ${outOfStock ? 'bg-slate-300 text-slate-600' : 'bg-[#2E6E65] hover:bg-[#285a52]'} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
