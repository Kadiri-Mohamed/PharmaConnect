// resources/js/app.tsx
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pages = {
    ...import.meta.glob('./Pages/**/*.tsx'),
    ...import.meta.glob('./Pages/**/*.jsx'),
};

const resolvePagePaths = (name: string) => {
    const normalizedName = name.replace(/^pharmacien\//, 'Pharmacien/');

    return Array.from(
        new Set([
            `./Pages/${name}.tsx`,
            `./Pages/${name}.jsx`,
            `./Pages/${normalizedName}.tsx`,
            `./Pages/${normalizedName}.jsx`,
        ]),
    );
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(resolvePagePaths(name), pages),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#4B5563' },
});

initializeTheme();
