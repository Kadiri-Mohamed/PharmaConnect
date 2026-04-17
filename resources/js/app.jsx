import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Pharmacy';
const pages = import.meta.glob('./Pages/**/*.jsx');
const resolvePagePaths = (name) => {
    const normalizedName = name.replace(/^pharmacien\//, 'Pharmacien/');

    return [...new Set([`./Pages/${name}.jsx`, `./Pages/${normalizedName}.jsx`])];
};

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(resolvePagePaths(name), pages),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#111827' },
});
