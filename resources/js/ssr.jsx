/* prettier-ignore */
import {
createInertiaApp
} from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const pages = {
    ...import.meta.glob('./Pages/**/*.tsx', { eager: true }),
    ...import.meta.glob('./Pages/**/*.jsx', { eager: true }),
};

const resolvePagePaths = (name) => {
    const normalizedName = name.replace(/^pharmacien\//, 'Pharmacien/');

    return [...new Set([
        `./Pages/${name}.tsx`,
        `./Pages/${name}.jsx`,
        `./Pages/${normalizedName}.tsx`,
        `./Pages/${normalizedName}.jsx`,
    ])];
};

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => resolvePageComponent(resolvePagePaths(name), pages),
        // prettier-ignore
        setup: ({ App, props }) => <App {...props} />,
    }),
);
