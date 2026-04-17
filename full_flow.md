# Full Flow

## 1. The Real Architecture Of This Project

The frontend and backend work together using a hybrid Inertia + JSON API model.

The best one-line summary is:

```text
Laravel web routes decide the page
-> Inertia loads the React component
-> React often fetches /api/* for the real business data
```

So the app is:

- not a pure SPA with a separate API backend
- not a classic multi-page Laravel app
- not a fully prop-hydrated Inertia app either

It is a page-shell Inertia app with session-backed JSON APIs.

## 2. End-To-End Request Lifecycle With Inertia

Here is the general lifecycle for most visible pages:

```text
User action
-> Inertia Link or form submit
-> Laravel web route
-> middleware runs
-> controller or route closure returns Inertia::render(...)
-> Inertia sends page component name + props
-> React page mounts
-> page reads shared props via usePage()
-> page may call /api/* endpoints
-> Laravel API controller returns JSON
-> component state updates
-> final UI is rendered
```

This explains why the project can feel like both an SPA and a server-driven app at the same time.

## 3. How Props Are Passed And Hydrated

Props come from two places.

### A. Shared props on every Inertia visit

From `app/Http/Middleware/HandleInertiaRequests.php`:

- `name`
- `quote`
- `auth.user`

These are available everywhere through `usePage().props`.

This is why:

- `Navbar.jsx` knows whether to show client or pharmacist navigation
- settings pages can prefill the authenticated user's name/email
- dashboards can redirect based on role

### B. Page-specific props from Laravel

Examples:

- `routes/web.php` passes `pharmacyId` to `pharmacy-details`
- `AuthenticatedSessionController@create` passes `status` and `canResetPassword`
- `ProfileController@edit` passes `mustVerifyEmail` and `status`
- `NewPasswordController@create` passes `email` and `token`

### Hydration in this project

In this codebase:

- Inertia hydrates the page shell and shared props
- the business data is often fetched after hydration from `/api/*`

So hydration here is partial, not complete.

## 4. How Navigation Works Here

### Server-side routing

Laravel owns the route definitions.

Examples:

- `GET /cart`
- `GET /orders`
- `GET /pharmacies`
- `GET /pharmacies/{pharmacy}`
- `GET /pharmacien/dashboard`

There is no React Router route table.

### Client-side page swapping

Inertia makes navigation feel client-side because `Link` swaps pages without a full reload.

Examples:

- `Navbar.jsx`
- `welcome.tsx`
- `settings/layout.tsx`

So the routing model is:

- server-defined
- client-transitioned

## 5. Inertia Vs API In This Project

The project uses both, but for different jobs.

### Inertia is used for

- page navigation
- auth pages
- settings pages
- logout
- pharmacist onboarding form
- page props like `pharmacyId` or auth/session status

Examples:

- `GET /login` -> Inertia page
- `POST /login` -> redirect through Inertia
- `GET /settings/profile` -> Inertia page
- `POST /pharmacy` -> Inertia form submit

### JSON API is used for

- medicament lists and detail
- pharmacies list and detail
- cart operations
- order creation and listing
- prescription upload/list
- pharmacist inventory CRUD
- pharmacist order status updates

Examples:

- `GET /api/medicaments`
- `POST /api/cart`
- `POST /api/orders`
- `PUT /api/pharmacien/pharmacy`

Simple rule of thumb:

- if you are moving between screens, think Inertia
- if you are manipulating pharmacy data, think JSON API

## 6. Server-Side Routing Vs Client-Side Routing

In a typical React Router app, the frontend decides which page component matches the URL.

That is not how this project works.

Laravel decides:

- what URL exists
- what middleware protects it
- what role can access it
- what page component name should be returned

React only renders the page Laravel selected.

That gives you:

- centralized authorization in Laravel
- simpler URL ownership
- no duplicate route definitions across backend and frontend

## 7. Authentication Flow

Authentication is central to the app.

### Registration flow

Frontend:

- `resources/js/pages/auth/register.tsx` uses Inertia `useForm`
- it posts to `route('register')`

Backend:

- `RegisteredUserController@store` validates `name`, `email`, `password`, `role`
- creates the user
- logs the user in
- redirects pharmacists to `pharmacy.create`
- redirects clients to `home`

### Login flow

Frontend:

- `resources/js/pages/auth/login.tsx` uses `useForm`
- it posts to `route('login')`

Backend:

- `LoginRequest` validates fields, rate-limits attempts, and calls `Auth::attempt`
- `AuthenticatedSessionController@store` regenerates the session and redirects to intended `dashboard`

After login:

- the `dashboard` web route checks the role
- pharmacists are redirected to `pharmacien.dashboard`
- clients get `Inertia::render('Client/Dashboard')`

### Session-backed API auth

The app does not use a separate token auth flow.

Instead:

- login creates the normal Laravel session
- `bootstrap/app.php` adds session middleware to the API stack
- API calls from React reuse the same session cookie

That is why `fetch(..., { credentials: 'same-origin' })` and normal `axios` requests work against `/api/*`.

## 8. Form Submission Full Cycle

There are two main submission cycles in this project.

### A. Inertia form cycle

Example pages:

- login
- register
- settings/profile
- settings/password
- create-pharmacy

Flow:

```text
React useForm submit
-> Laravel web route
-> validation
-> redirect or error bag
-> Inertia updates page props
-> useForm errors/processing/recentlySuccessful update UI
```

### B. JSON API form cycle

Example pages:

- cart actions
- prescription upload
- pharmacist pharmacy edit
- pharmacist medicament CRUD
- pharmacist order status update

Flow:

```text
React event handler
-> fetch/axios call to /api/*
-> Laravel API controller
-> JSON response or JSON validation error
-> component manually updates local state/messages
```

The coexistence of both flows is a defining property of the project.

## 9. Error Handling Flow

### Inertia form errors

For auth/settings/onboarding pages:

- Laravel validation fails
- Laravel redirects back with validation errors
- Inertia hydrates those errors into `useForm().errors`
- React shows them with `InputError`

Examples:

- `login.tsx`
- `register.tsx`
- `settings/profile.tsx`
- `settings/password.tsx`
- `create-pharmacy.tsx`

### API errors

For JSON-driven pages:

- Laravel returns 400, 403, 404, 422, or 500 JSON
- React must parse that manually

Examples:

- `cart.tsx` throws based on `response.ok`
- `my-pharmacy.tsx` maps `error.response.data.errors`
- `manage-orders.tsx` pulls `error.response.data.message`
- `Medicament/Index.jsx` normalizes validation errors into `formErrors`

### Middleware-generated errors

`RoleMiddleware` behaves differently depending on request type:

- for web routes: redirect to `pharmacy.create`
- for API routes: return JSON `403`

That difference is important when debugging "works in browser navigation but fails in API call" issues.

## 10. Real Example 1: Login -> Dashboard Load

This is a real, complete flow already implemented in the project.

### Step 1. User opens `/login`

Backend:

- `routes/auth.php` -> `AuthenticatedSessionController@create`
- controller returns `Inertia::render('auth/login', [...])`

Frontend:

- `resources/js/pages/auth/login.tsx` renders with `status` and `canResetPassword`

### Step 2. User submits the login form

Frontend:

- `login.tsx` calls `post(route('login'))`

Backend:

- `LoginRequest` validates and authenticates
- `AuthenticatedSessionController@store` regenerates session and redirects to `dashboard`

### Step 3. Laravel resolves the dashboard destination

`routes/web.php` handles `GET /dashboard`:

- pharmacists are redirected to `pharmacien.dashboard`
- clients get `Inertia::render('Client/Dashboard')`

### Step 4. Shared props are available

`HandleInertiaRequests` provides:

- `auth.user.id`
- `auth.user.name`
- `auth.user.email`
- `auth.user.role`

### Step 5. Dashboard loads business data

If the user is a client:

- `resources/js/pages/Client/Dashboard.jsx` mounts
- it reads `auth.user` from `usePage().props`
- it fetches `/api/orders` and `/api/cart`
- it stores those results in local React state

Full login flow:

```text
GET /login
-> Inertia login page
-> POST /login
-> LoginRequest authenticates
-> session regenerated
-> redirect /dashboard
-> role check in dashboard route
-> Inertia renders correct dashboard page
-> React dashboard fetches /api/orders and /api/cart
-> final dashboard UI appears
```

## 11. Real Example 2: Cart -> Prescription Upload -> Order Creation

This is the strongest full-stack example in the repository because it uses:

- Inertia page routing
- shared auth props
- JSON API calls
- authorization
- validation
- transactions
- stock locking
- cart cleanup

### Step 1. User visits `/cart`

Backend:

- `routes/web.php` returns `Inertia::render('cart')`

Frontend:

- `resources/js/pages/cart.tsx` mounts
- `useEffect` calls `GET /api/cart`

### Step 2. Backend builds cart response

`CartController@index`:

- creates cart lazily if needed
- loads items with medicaments
- calculates total and item count
- computes:
  - `has_valid_prescription`
  - `has_uploaded_prescription`
  - `has_prescription_required_items`

That extra metadata is exactly what the frontend uses to decide whether to show the prescription upload panel.

### Step 3. User uploads a prescription if required

Frontend:

- `cart.tsx` builds `FormData`
- sends `POST /api/prescriptions`

Backend:

- `PrescriptionController@store`
- validates file type and size
- stores file on the `public` disk
- creates the prescription row with `pending` status

### Step 4. User clicks "Create Order"

Frontend:

- `cart.tsx` sends `POST /api/orders` with `pharmacy_id`

Backend:

- route in `routes/api.php`
- `StoreOrderRequest` authorizes only clients
- `OrderController@store` delegates to `OrderServiceImproved`

### Step 5. Order service enforces business rules

`OrderServiceImproved::createOrderFromCart()`:

- loads cart items
- checks cart is not empty
- checks all items belong to the selected pharmacy
- checks stock
- checks prescription requirements
- chooses a matching unused prescription if needed
- creates the order
- creates order items
- uses `InventoryManager::decreaseStockSafely()` with DB row locks
- clears the cart

### Step 6. Response returns to React

Backend returns `201 Created`.

Frontend currently does:

- `window.location.href = '/orders'`

So the user is then taken to the orders page.

### Step 7. Orders page loads

Backend:

- `GET /orders` -> `Inertia::render('orders')`

Frontend:

- `orders.tsx` mounts
- fetches `GET /api/orders`
- renders the updated order list

Full cart-to-order flow:

```text
GET /cart
-> Inertia cart page
-> React fetches /api/cart
-> user uploads prescription if needed
-> POST /api/prescriptions
-> user clicks Create Order
-> POST /api/orders
-> OrderServiceImproved transaction
-> stock locked and decremented
-> order + order_items created
-> cart cleared
-> frontend redirects to /orders
-> orders page fetches /api/orders
-> final order history renders
```

## 12. What Makes This Different From A Traditional SPA/API Split

In a traditional SPA:

- frontend router defines screens
- backend mostly exposes JSON
- auth is often token-based

In this project:

- Laravel owns the route tree
- Inertia owns page transport
- React owns UI rendering
- Laravel session auth is reused for API calls
- business data still travels over JSON endpoints

That combination gives a nice developer experience, but it also means you must always ask:

- "Am I in a web/Inertia flow?"
- "Or am I in an API/JSON flow?"

## 13. Architecture Improvements Worth Considering

### 1. Standardize data loading

Today the app mixes:

- Inertia props
- `fetch`
- `axios`
- `lib/api.js`
- `hooks/use-api.js`

Choosing one main API access pattern would reduce duplication and make error handling more consistent.

### 2. Remove duplicate `pages` and `Pages` trees

The current split makes page resolution harder to reason about and increases maintenance cost.

### 3. Add missing order detail page

The frontend links to `/orders/{id}`, but only `GET /api/orders/{order}` exists. A matching Inertia page route is missing.

### 4. Finish the rare requests feature

Frontend rare-request pages are placeholders, while backend endpoints already exist.

### 5. Make rare requests user-aware

If clients are supposed to view their own rare requests, the backend needs a `user_id` or another ownership model.

### 6. Wire flash messaging consistently

Some backend actions use redirect flash messages, but shared flash props are not exposed globally in `HandleInertiaRequests`.

### 7. Reuse config values consistently

There is a `config/pharmacy.php`, but some status lists and thresholds are still hard-coded in controllers and React pages.

## 14. Best Mental Model For Working On This Codebase

When debugging or building a feature, trace it in this order:

1. What URL is involved?
2. Is that URL a web route or an API route?
3. What middleware protects it?
4. What controller handles it?
5. Does the React page expect props or does it fetch JSON after mount?
6. If it submits data, is it using `useForm` or manual `fetch`/`axios`?

If you follow those six questions, the full stack becomes much easier to reason about in this project.
