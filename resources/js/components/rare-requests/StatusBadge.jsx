const STATUS_STYLES = {
    pending: 'bg-slate-100 text-slate-700',
    found: 'bg-emerald-100 text-emerald-700',
    not_found: 'bg-red-100 text-red-700',
};

export default function RareRequestStatusBadge({ status }) {
    const normalized = String(status || 'pending').toLowerCase();
    const badgeClass = STATUS_STYLES[normalized] || STATUS_STYLES.pending;

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
            {normalized.replace('_', ' ')}
        </span>
    );
}
