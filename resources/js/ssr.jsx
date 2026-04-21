import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
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

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: resolvePage,
        setup: ({ App, props }) => <App {...props} />,
    }),
);
