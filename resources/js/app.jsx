import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Pharmacy';
const pages = import.meta.glob('./Pages/**/*.jsx');
const pagePathsByLowercase = Object.fromEntries(
    Object.keys(pages).map((path) => [path.toLowerCase(), path]),
);
const resolvePage = (name) => {
    const requestedPath = `./Pages/${name}.jsx`;

    return resolvePageComponent(
        pagePathsByLowercase[requestedPath.toLowerCase()] ?? requestedPath,
        pages,
    );
};

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: resolvePage,
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#2A7A9D' },
});
