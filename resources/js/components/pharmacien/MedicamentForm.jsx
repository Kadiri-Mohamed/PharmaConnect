export const defaultMedicamentValues = {
    name: '',
    description: '',
    price: '',
    stock: '',
    requires_prescription: false,
};

export default function MedicamentForm({
    values,
    errors,
    processing,
    submitLabel,
    onChange,
    onSubmit,
    onCancel,
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-[#2B3752]">Name</label>
                <input
                    type="text"
                    value={values.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                    required
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-[#2B3752]">Description</label>
                <textarea
                    value={values.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                    rows={3}
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-[#2B3752]">Price</label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={values.price}
                        onChange={(e) => onChange('price', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                        required
                    />
                    {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-[#2B3752]">Stock</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={values.stock}
                        onChange={(e) => onChange('stock', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2E6E65] focus:outline-none"
                        required
                    />
                    {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
                </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#2B3752]">
                <input
                    type="checkbox"
                    checked={Boolean(values.requires_prescription)}
                    onChange={(e) => onChange('requires_prescription', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#2E6E65] focus:ring-[#2E6E65]"
                />
                Requires prescription
            </label>
            {errors.requires_prescription && <p className="text-xs text-red-600">{errors.requires_prescription}</p>}

            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    disabled={processing}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white hover:bg-[#285f57] disabled:opacity-60"
                    disabled={processing}
                >
                    {processing ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
}
