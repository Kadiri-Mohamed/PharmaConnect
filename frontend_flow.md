# Frontend Flow

## 1. Frontend Architecture At A Glance

This project is neither a pure React SPA nor a classic Laravel Blade app. It uses a hybrid model:

- Laravel decides which page should be shown.
- Inertia transports that page choice to React.
- React renders the page component.
- Most business pages then call `/api/*` endpoints to fetch the real domain data.

In practice, the frontend has two data patterns:

- Inertia-driven pages and forms: authentication, settings, and pharmacist onboarding pages receive props directly from Laravel and submit back to Laravel web routes with `useForm`.
- API-driven business pages: cart, medicaments, pharmacies, prescriptions, orders, pharmacist dashboard, pharmacist inventory, and pharmacist order management are rendered as Inertia pages first, then they fetch JSON from Laravel API routes.

That split is the most important frontend concept in this codebase.

## 2. Entry Points And Boot Process

### `resources/views/app.blade.php`

This is the root HTML shell used by Inertia.

Important responsibilities:

- Declares `<title inertia>` so page titles can be changed from React with `Head`.
- Injects Ziggy routes with `@routes`, which makes the global `route()` helper available in React.
- Boots Vite assets with `@vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])`.
- Renders the Inertia mount point with `@inertia`.

### `resources/js/app.tsx`

This is the main React/Inertia bootstrap file.

Key details:

- Uses `createInertiaApp` from `@inertiajs/react`.
- Sets the page title format.
- Resolves page components dynamically.
- Mounts React with `createRoot`.
- Initializes the theme with `initializeTheme()`.

The page resolver supports multiple page locations:

- `./Pages/**/*.jsx`
- `./pages/**/*.tsx`
- `./pages/**/*.jsx`

So the app currently supports both `resources/js/pages` and `resources/js/Pages`.

### `resources/js/ssr.jsx`

There is an SSR entry configured in `vite.config.js`. It resolves `./pages/**/*.tsx`.

SSR support exists in the build setup, but the codebase is mixed:

- some pages are `.tsx`
- some are `.jsx`
- some are duplicated in both `pages` and `Pages`

The project does build successfully, but the structure is fragile.

## 3. Frontend Folder Structure

### `resources/js/pages`

This is the main page directory used by the current app.

Representative pages:

- `auth/login.tsx`
- `auth/register.tsx`
- `Client/Dashboard.jsx`
- `cart.tsx`
- `orders.tsx`
- `medicaments.tsx`
- `pharmacies.tsx`
- `pharmacy-details.tsx`
- `prescriptions.tsx`
- `pharmacien-dashboard.tsx`
- `pharmacien/my-pharmacy.tsx`
- `pharmacien/manage-orders.tsx`
- `pharmacien/Medicaments/Index.jsx`

### `resources/js/Pages`

This second page directory contains duplicates of many files from `resources/js/pages`.

This matters because `resources/js/app.tsx` checks `./Pages/**/*.jsx` first during page resolution. So this directory can affect which component is actually resolved.

There are also bridge files such as:

- `resources/js/pages/pharmacien/Medicaments/Index.tsx`
- `resources/js/Pages/pharmacien/Medicaments/Index.tsx`

Those files re-export the `.jsx` page and exist to make the mixed `.tsx`/`.jsx` setup work.

### `resources/js/components`

Reusable UI and page-level pieces live here.

Examples:

- `Navbar.jsx`: main authenticated navigation for client and pharmacist roles.
- `input-error.tsx`: reusable validation error display for Inertia forms.
- `pharmacien/MedicamentForm.jsx`: form component reused inside the pharmacist medicament modal.
- `ui/*`: design-system-style primitive components.

### `resources/js/layouts`

This project uses two layout systems.

#### Business layout system

Used by most pharmacy features:

- `Layout.jsx`
- `AppLayout.jsx`
- `Navbar.jsx`

This is the simpler top-navbar shell.

#### Starter-kit/sidebar layout system

Used mainly by settings pages:

- `app-layout.tsx`
- `layouts/app/app-sidebar-layout.tsx`
- `components/app-sidebar.tsx`
- `components/app-sidebar-header.tsx`
- `layouts/settings/layout.tsx`

This is the sidebar-based shell inherited from the Laravel React starter kit.

### `resources/js/hooks`

Important hooks:

- `use-appearance.tsx`: handles theme choice in localStorage and applies the `dark` class.
- `use-api.js`: provides reusable API hooks and wrappers.

Project reality:

- `use-api.js` and `lib/api.js` exist, but most business pages still call `fetch()` or `axios` directly instead of using these abstractions consistently.

### `resources/js/lib`

- `lib/api.js` defines a configured Axios instance and a `pharmaConnectApi` wrapper.

It is useful, but it is not yet the single source of truth for data fetching.

### `resources/js/types`

- `types/index.ts` defines shared TS types like `SharedData`, `User`, and `BreadcrumbItem`.

These are especially used in auth/settings pages and components that call `usePage<SharedData>()`.

## 4. How Frontend Routing Really Works

There is no React Router route table. Routes are defined on the Laravel side in:

- `routes/web.php`
- `routes/auth.php`
- `routes/settings.php`

When a React component wants navigation, it usually uses Inertia's `Link` component or `router.visit()`.

Common routing tools in this codebase:

- `Link` from `@inertiajs/react`
- `usePage`
- `router.visit`
- `Head`
- global `route()` helper from Ziggy

### `Link`

`Link` performs an Inertia visit instead of a full browser reload.

Examples:

- `Navbar.jsx` uses `Link` for role-based navigation.
- `welcome.tsx` uses `Link` to login/register/dashboard.
- `settings/layout.tsx` uses `Link` with `prefetch`.
- `user-menu-content.tsx` and `Navbar.jsx` use `Link` with `method="post"` for logout.

### `usePage`

`usePage()` gives access to the current Inertia page object and shared props.

Used for:

- `auth.user` in `Navbar.jsx`
- shared auth data in `Client/Dashboard.jsx`
- `SharedData` in settings pages

### `router.visit`

Used when the component wants programmatic Inertia navigation.

Examples:

- `Client/Dashboard.jsx` redirects pharmacists away from the client dashboard.
- `pharmacien/manage-orders.tsx` redirects non-pharmacists away from pharmacist screens.
- `pharmacien/Medicaments/Index.jsx` does the same.

## 5. How Data Reaches React

There are three ways data reaches a page in this project.

### A. Shared Inertia props

Defined in `app/Http/Middleware/HandleInertiaRequests.php`.

Every Inertia page receives:

- `name`
- `quote`
- `auth.user`

`auth.user` includes:

- `id`
- `name`
- `email`
- `role`

### B. Route-specific Inertia props

Some Laravel routes pass props directly into `Inertia::render`.

Examples:

- `routes/web.php` passes `pharmacyId` to `pharmacy-details`
- auth controllers pass `status`, `token`, `email`, or `canResetPassword`
- settings controllers pass `mustVerifyEmail` and `status`

### C. JSON API calls after mount

This is how most business data is loaded.

Examples:

- `medicaments.tsx` calls `GET /api/medicaments`
- `pharmacies.tsx` calls `GET /api/pharmacies`
- `pharmacy-details.tsx` calls `GET /api/pharmacies/{id}` and `GET /api/pharmacies/{id}/medicaments`
- `cart.tsx` calls `GET /api/cart`
- `orders.tsx` calls `GET /api/orders`
- `prescriptions.tsx` calls `GET /api/prescriptions`
- `pharmacien-dashboard.tsx` calls `GET /api/pharmacien/pharmacy`, `GET /api/pharmacien/medicaments`, and `GET /api/pharmacien/orders`

So the frontend is mostly shell-first, data-second:

1. Laravel returns an Inertia page shell.
2. React mounts the page.
3. `useEffect` fetches JSON.
4. local component state updates.
5. the final business UI appears.

## 6. State Management

There is no global business-state store like Redux or Zustand.

Business state is mostly local to each page.

Typical pattern:

- `useState` for page data
- `useEffect` for initial loading
- `useMemo` for derived UI state
- `useCallback` in some more advanced pages

Examples:

- `cart.tsx` stores `cart`, `loading`, `actionLoading`, `uploadLoading`, `error`
- `medicaments.tsx` stores `medicaments`, `search`, `pharmacyFilter`
- `pharmacien/manage-orders.tsx` stores `orders`, filters, status selections, and request state
- `pharmacien/Medicaments/Index.jsx` stores modal state, form values, pagination, filters, and errors

### UI-level shared state

Some shared UI state exists:

- `components/ui/sidebar.tsx` provides sidebar UI context
- `components/app-shell.tsx` persists sidebar open/closed state in localStorage
- `hooks/use-appearance.tsx` persists light/dark/system theme in localStorage

These are UI concerns, not business data stores.

## 7. Forms Handling

This codebase uses two different form strategies.

### A. Inertia `useForm`

Used where the submission goes to a Laravel web route and Laravel returns redirects/errors in Inertia format.

Examples:

- `pages/auth/login.tsx`
- `pages/auth/register.tsx`
- `pages/auth/forgot-password.tsx`
- `pages/auth/reset-password.tsx`
- `pages/auth/verify-email.tsx`
- `pages/settings/profile.tsx`
- `pages/settings/password.tsx`
- `pages/pharmacien/create-pharmacy.tsx`

Benefits in this project:

- validation errors arrive automatically in `errors`
- submission state is handled via `processing`
- redirects stay in the Inertia flow

### B. Manual `fetch` or `axios`

Used where the submission goes to a Laravel API route returning JSON.

Examples:

- `cart.tsx` for quantity update, item removal, cart clear, order creation, prescription upload
- `prescriptions.tsx` for file upload
- `pharmacien/my-pharmacy.tsx` for pharmacy update
- `pharmacien/manage-orders.tsx` for order status updates
- `pharmacien/Medicaments/Index.jsx` for CRUD

In these pages, the developer must manually:

- build request payloads
- parse JSON or Axios responses
- map backend validation errors
- manage loading flags
- manage success messages

### Validation flow differences

For Inertia forms, Laravel validation errors come back through the standard Inertia redirect cycle and appear directly in `useForm().errors`.

For API forms, the component must manually inspect:

- `response.ok` when using `fetch`
- `error.response.data.errors` when using `axios`

That is why the API pages contain much more repetitive error-handling code.

## 8. API Calling Style

The frontend currently mixes three calling styles:

- native `fetch`
- direct `axios`
- a reusable API client in `resources/js/lib/api.js`

### Pages using `fetch`

- `cart.tsx`
- `orders.tsx`
- `medicaments.tsx`
- `pharmacies.tsx`
- `pharmacy-details.tsx`
- `prescriptions.tsx`
- `pharmacien-dashboard.tsx`

### Pages using `axios`

- `Client/Dashboard.jsx`
- `pharmacien/my-pharmacy.tsx`
- `pharmacien/manage-orders.tsx`
- `pharmacien/Medicaments/Index.jsx`

### Reusable API layer

- `resources/js/lib/api.js`
- `resources/js/hooks/use-api.js`

These abstractions exist but are not the dominant pattern yet.

Most requests include:

- `Accept: application/json`
- `credentials: 'same-origin'` for `fetch`
- normal browser cookies for `axios`

That works because the app uses Laravel session authentication, not a separate token flow.

## 9. Component Lifecycle And Rendering Flow

Here is the typical lifecycle for a business page in this project:

```text
User clicks Inertia <Link>
-> Laravel web route returns Inertia page name
-> Inertia resolves React page component
-> React renders shell/loading state
-> useEffect runs
-> page calls /api/*
-> Laravel returns JSON
-> useState updates
-> UI re-renders with real data
```

This is why many pages initially render placeholders such as:

- "Loading cart..."
- "Loading medicaments..."
- "Loading orders..."
- "Loading pharmacy details..."

## 10. Full Real Example: `/pharmacies/{id}`

This page is a good example because it uses both Inertia props and API calls.

### Step 1. User starts on the pharmacies list

In `resources/js/pages/pharmacies.tsx`, each pharmacy card is an Inertia `Link` to `/pharmacies/{id}`.

### Step 2. Laravel handles the page visit

`routes/web.php` defines `GET /pharmacies/{pharmacy}` and returns:

- `Inertia::render('pharmacy-details', ['pharmacyId' => (int) $pharmacy])`

So Laravel sends React the page name plus the `pharmacyId` prop.

### Step 3. Inertia resolves the page component

`resources/js/app.tsx` resolves the component name `pharmacy-details`.

The page component is:

- `resources/js/pages/pharmacy-details.tsx`

### Step 4. React renders immediately

The page receives `pharmacyId` as a prop and first renders a loading state.

### Step 5. `useEffect` fetches business data

Inside `pharmacy-details.tsx`, `useEffect` triggers two parallel requests:

- `GET /api/pharmacies/{pharmacyId}`
- `GET /api/pharmacies/{pharmacyId}/medicaments`

### Step 6. State updates

The responses are stored in:

- `pharmacy`
- `medicaments`
- `loading`
- `error`

### Step 7. Final UI renders

The page now shows:

- pharmacy summary
- status de garde badge
- in-stock counts
- medicament table

The full lifecycle is:

```text
Link click
-> web route /pharmacies/{id}
-> Inertia::render('pharmacy-details', { pharmacyId })
-> React page mounts
-> useEffect fetches JSON details
-> state updates
-> final page renders
```

## 11. Project-Specific Frontend Observations

### Good patterns already present

- Auth and settings pages use Inertia `useForm` correctly.
- Shared auth props are used consistently.
- Pharmacist inventory and order pages contain practical local state.
- Theme and sidebar preferences are persisted locally.

### Weaknesses or cleanup opportunities

- `resources/js/pages` and `resources/js/Pages` duplicate each other, which makes resolution harder to reason about.
- The app mixes `fetch`, `axios`, and a custom API wrapper instead of standardizing one approach.
- `resources/js/pages/orders.tsx` links to `/orders/{id}`, but there is no matching web route for an order-detail page. There is only the API route `GET /api/orders/{order}`.
- `resources/js/pages/auth/login.tsx` renders a remember-me checkbox, but it is not wired to `setData('remember', ...)`, so the `remember` field is not meaningfully controlled.
- `resources/js/pages/rare-requests.tsx` and `resources/js/pages/pharmacien/manage-rare-requests.tsx` are placeholders, while the backend already exposes rare request endpoints.
- `resources/js/pages/cart.tsx` uses `window.location.href = '/orders'` after order creation instead of Inertia navigation like `router.visit('/orders')`.
- `tsconfig.json` includes only `*.ts` and `*.tsx`, so strict TypeScript coverage does not fully protect the `.jsx` pages that contain a large part of the domain logic.

## 12. Mental Model For A New Developer

The safest mental model is:

- Laravel chooses the page.
- Inertia swaps the page without a full reload.
- React renders the page.
- Most real data is fetched from `/api/*` after mount.

When you open a page file, always ask:

1. Is this page getting data from Inertia props?
2. Or is it just a shell that fetches API data in `useEffect`?
3. Is the form using `useForm`, or is it manually calling JSON endpoints?

Those three questions will usually tell you how the page is supposed to work.
