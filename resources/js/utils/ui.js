export const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

export const formatStatusLabel = (value = '') =>
    String(value)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

const neutralBadge = 'status-badge border-slate-200 bg-slate-100 text-slate-600';
const successBadge = 'status-badge border-green-200 bg-green-100 text-green-700';
const errorBadge = 'status-badge border-red-200 bg-red-100 text-red-700';

const orderStatusClasses = {
    pending: 'status-badge border-pharmacy-light/80 bg-pharmacy-light text-pharmacy-deepest',
    preparing: 'status-badge border-pharmacy-lighter/80 bg-pharmacy-lighter text-pharmacy-deepest',
    ready: 'status-badge border-pharmacy-medium/80 bg-pharmacy-medium text-white',
    delivered: successBadge,
    cancelled: errorBadge,
};

const rareRequestStatusClasses = {
    pending: orderStatusClasses.pending,
    found: successBadge,
    not_found: errorBadge,
};

const prescriptionStatusClasses = {
    pending: orderStatusClasses.pending,
    approved: successBadge,
    accepted: successBadge,
    rejected: errorBadge,
    denied: errorBadge,
};

export const getOrderStatusBadgeClass = (status) => orderStatusClasses[status] || neutralBadge;

export const getRareRequestStatusBadgeClass = (status) =>
    rareRequestStatusClasses[status] || neutralBadge;

export const getPrescriptionStatusBadgeClass = (status) =>
    prescriptionStatusClasses[status] || neutralBadge;

export const getStockBadgeClass = (stock) => {
    const quantity = Number(stock);

    if (quantity < 1) {
        return errorBadge;
    }

    if (quantity <= 20) {
        return 'status-badge border-pharmacy-light/80 bg-pharmacy-light text-pharmacy-deepest';
    }

    return 'status-badge border-pharmacy-lighter/70 bg-white text-pharmacy-dark';
};

export const getAvailabilityBadgeClass = (stock) =>
    Number(stock) > 0 ? successBadge : errorBadge;

export const getGuardBadgeClass = (isOnDuty) =>
    isOnDuty
        ? 'status-badge border-pharmacy-medium/80 bg-pharmacy-medium text-white'
        : 'status-badge border-pharmacy-light/80 bg-pharmacy-light/60 text-pharmacy-deepest';

export const getPrescriptionRequirementBadgeClass = (required) =>
    required
        ? 'status-badge border-pharmacy-lighter/80 bg-pharmacy-light/80 text-pharmacy-deepest'
        : 'status-badge border-green-200 bg-green-50 text-green-700';
