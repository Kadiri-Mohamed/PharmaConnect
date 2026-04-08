// resources/js/app.tsx
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const pages = {
            ...import.meta.glob('./Pages/**/*.jsx'),
            ...import.meta.glob('./pages/**/*.tsx'),
            ...import.meta.glob('./pages/**/*.jsx'),
        };

        const jsxUpperPath = `./Pages/${name}.jsx`; // required
        const tsxPath = `./pages/${name}.tsx`;
        const jsxLowerPath = `./pages/${name}.jsx`;

        const loader = pages[jsxUpperPath] ?? pages[tsxPath] ?? pages[jsxLowerPath];

        if (!loader) throw new Error(`Page not found: ${name}`);
        return (await loader()) as never;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#4B5563' },
});

initializeTheme();
