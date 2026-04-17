# Backend Flow

## 1. Backend Architecture At A Glance

The backend is a Laravel 12 application that serves two kinds of responses:

- Inertia responses for page shells, auth pages, settings pages, and pharmacist onboarding.
- JSON API responses for most pharmacy business data.

So the backend is not just an API and not just a page renderer. It is both:

- Laravel web routes decide what screen exists.
- Laravel API routes provide the data those screens need.

## 2. Backend Folder Structure

The most important backend folders in this project are:

### `routes`

- `web.php`: page-shell routes rendered through Inertia
- `auth.php`: login, register, password reset, logout, verification
- `settings.php`: profile, password, appearance
- `api.php`: JSON business endpoints

### `app/Http/Controllers`

Main controller groups:

- `Auth/*`: authentication and password flows
- `Settings/*`: profile and password management
- `PharmacyController`
- `MedicamentController`
- `CartController`
- `OrderController`
- `PrescriptionController`
- `RareRequestController`

### `app/Http/Middleware`

- `HandleInertiaRequests.php`: shared props for every Inertia response
- `RoleMiddleware.php`: role gating and pharmacist onboarding enforcement

### `app/Http/Requests`

Custom request validation objects:

- `Auth/LoginRequest`
- `AddToCartRequest`
- `StoreOrderRequest`
- `StoreMedicamentRequest`
- `UpdateMedicamentRequest`
- `Settings/ProfileUpdateRequest`

### `app/Models`

Core domain models:

- `User`
- `Pharmacy`
- `Medicament`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Prescription`
- `RareRequest`

### `app/Services`

This project moves some business rules into services:

- `CartService`
- `MedicamentService`
- `OrderServiceImproved`
- `InventoryManager`
- `StockValidator`

This is especially important for order creation and stock safety.

### `database/migrations`

Schema files define the pharmacy domain:

- user roles
- pharmacies
- medicaments
- carts and cart items
- orders and order items
- prescriptions
- rare requests
- performance indexes

## 3. Route Definitions

### `routes/web.php`

This file defines the visible page shells.

Examples:

- `/` -> `Inertia::render('welcome')`
- `/dashboard` -> redirects pharmacists to pharmacist dashboard, otherwise renders `Client/Dashboard`
- `/cart` -> `Inertia::render('cart')`
- `/orders` -> `Inertia::render('orders')`
- `/pharmacies` -> `Inertia::render('pharmacies')`
- `/pharmacies/{pharmacy}` -> `Inertia::render('pharmacy-details', ['pharmacyId' => ...])`

There are also role-specific groups:

- `role:pharmacien`
- `role:client`

Important nuance:

- these routes usually do not preload business data
- they mainly deliver the page component name

### `routes/auth.php`

This is the standard auth flow adapted for Inertia.

Examples:

- `GET /login`
- `POST /login`
- `GET /register`
- `POST /register`
- `POST /logout`
- forgot/reset password routes
- email verification routes

These routes are handled by controllers in `app/Http/Controllers/Auth`.

### `routes/settings.php`

Settings routes are protected by `auth`.

Examples:

- `GET /settings/profile`
- `PATCH /settings/profile`
- `DELETE /settings/profile`
- `GET /settings/password`
- `PUT /settings/password`
- `GET /settings/appearance`

### `routes/api.php`

This is where most of the business data lives.

Public API endpoints:

- `GET /api/pharmacies`
- `GET /api/pharmacies/{pharmacy}`
- `GET /api/pharmacies/{pharmacy}/medicaments`
- `GET /api/medicaments`
- `GET /api/medicaments/{medicament}`
- `GET /api/medicaments/search`
- `POST /api/rare-requests`

Authenticated API endpoints:

- cart endpoints
- order endpoints
- prescription endpoints
- `GET /api/rare-requests`

Pharmacist-only API endpoints under `/api/pharmacien/*`:

- pharmacy management
- medicament CRUD
- pharmacist order management
- rare request status update

### Route design pattern in this project

```text
web routes
-> return Inertia pages

api routes
-> return JSON
```

That split explains why many React pages load empty first, then fetch their data separately.

## 4. Middleware Flow

### Global application setup: `bootstrap/app.php`

This file is one of the most important pieces of backend architecture in the project.

It does three important things.

#### A. Adds `HandleInertiaRequests` to the web stack

This makes shared Inertia props available to all page renders.

#### B. Prepends session middleware to the API stack

The API stack gets:

- `EncryptCookies`
- `AddQueuedCookiesToResponse`
- `StartSession`

This is a major project-specific design choice.

It means `/api/*` routes can read the same session cookie as web/Inertia routes, so the frontend does not need a separate token auth flow to call the API.

#### C. Registers the `role` middleware alias

This maps:

- `'role' => App\Http\Middleware\RoleMiddleware::class`

### `HandleInertiaRequests.php`

This middleware shares app-wide props with React:

- `name`
- `quote`
- `auth.user`

`auth.user` is trimmed down to:

- `id`
- `name`
- `email`
- `role`

That is why the frontend can read `usePage().props.auth.user` everywhere.

### `RoleMiddleware.php`

This middleware does more than simple role checking.

Basic responsibility:

- block access if the authenticated user does not have the expected role

Pharmacist onboarding enforcement:

- if a user has role `pharmacien` but has not created a pharmacy yet, web requests are redirected to `pharmacy.create`
- API requests receive JSON `403`

This means a pharmacist cannot use the pharmacist area until the pharmacy profile exists.

## 5. Controllers And Their Responsibilities

### Auth controllers

Main files:

- `Auth/AuthenticatedSessionController.php`
- `Auth/RegisteredUserController.php`
- `Auth/PasswordResetLinkController.php`
- `Auth/NewPasswordController.php`
- `Auth/ConfirmablePasswordController.php`
- `Auth/EmailVerificationPromptController.php`

Responsibilities:

- render Inertia auth pages
- validate credentials/password flows
- manage redirects and session status messages

Important project-specific behavior:

- after registration, pharmacists are redirected to `pharmacy.create`
- after login, users are redirected to `dashboard`
- `/dashboard` then decides whether to send pharmacists to `/pharmacien/dashboard`

### `PharmacyController`

This controller mixes Inertia and JSON endpoints.

Inertia responsibilities:

- `create()` renders `pharmacien/create-pharmacy`
- `store()` validates and creates the pharmacy for the logged-in pharmacist

API responsibilities:

- `myPharmacy()` returns the authenticated pharmacist's pharmacy
- `updateMyPharmacy()` updates it
- `index()` returns paginated public pharmacies
- `show()` returns one pharmacy with summary data

### `MedicamentController`

This controller is the main inventory controller.

Responsibilities:

- public medicament listing
- public medicament detail
- search
- pharmacist inventory listing
- create/update/delete for pharmacist-owned medicaments
- list medicaments by pharmacy

It injects `MedicamentService`, which is used mainly for availability-related logic.

Authorization is enforced manually in multiple methods by checking:

- authenticated user exists
- user role is `pharmacien`
- medicament belongs to the pharmacist's own pharmacy

### `CartController`

Responsibilities:

- retrieve current user's cart
- add item
- update quantity
- remove item
- clear cart

It delegates business rules to `CartService`.

Notable project behavior:

- cart is created lazily with `firstOrCreate`
- response includes prescription-related flags used by the frontend checkout UI
- cart responses include computed values like `total` and `item_count`

### `OrderController`

Responsibilities:

- list client orders
- create orders from cart
- show one order
- update status
- list pharmacist-facing orders

This controller delegates the heavy business logic to `OrderServiceImproved`.

Important behavior:

- `store()` uses `StoreOrderRequest`
- `updateStatus()` supports both client and pharmacist authorization paths
- pharmacist-specific route uses `updateOrderStatus()` as a backward-compatible alias

### `PrescriptionController`

Responsibilities:

- list client prescriptions
- upload a new prescription
- securely stream prescription files

The `file()` method is worth understanding:

- clients can access their own prescription files
- pharmacists can only access a prescription if it is attached to one of their pharmacy's orders

### `RareRequestController`

Responsibilities:

- list rare requests
- create rare requests
- update rare request status

Important reality:

- the controller returns paginated rare requests
- the model has no `user_id`
- despite the route comment saying "Client - View Own", the current implementation is not user-scoped

### `Settings/ProfileController` and `Settings/PasswordController`

These are standard Inertia settings controllers.

Responsibilities:

- render settings pages
- validate and update profile/password
- delete account

## 6. Models And Relationships

The domain model is clean and readable.

### `User`

Relationships:

- `hasOne(Pharmacy)`
- `hasOne(Cart)`
- `hasMany(Order)`
- `hasMany(Prescription)`

Role is stored directly on the user:

- `client`
- `pharmacien`

### `Pharmacy`

Relationships:

- `belongsTo(User)`
- `hasMany(Medicament)`
- `hasMany(Order)`

Schema facts from migrations:

- `user_id` is unique
- each pharmacist can own only one pharmacy
- `status_garde` is a boolean

### `Medicament`

Relationships:

- `belongsTo(Pharmacy)`
- `hasMany(CartItem)`
- `hasMany(OrderItem)`

Fields:

- `name`
- `description`
- `price`
- `stock`
- `requires_prescription`

### `Cart`

Relationships:

- `belongsTo(User)`
- `hasMany(CartItem)`

### `CartItem`

Relationships:

- `belongsTo(Cart)`
- `belongsTo(Medicament)`

There is also a unique index on `['cart_id', 'medicament_id']`, which prevents duplicate cart lines for the same medicament.

### `Order`

Relationships:

- `belongsTo(User)`
- `belongsTo(Pharmacy)`
- `hasMany(OrderItem)`
- `belongsTo(Prescription)`

Important schema detail:

- `prescription_id` is optional and was added later via migration `0001_01_01_000013_add_prescription_id_to_orders_table.php`

### `OrderItem`

Relationships:

- `belongsTo(Order)`
- `belongsTo(Medicament)`

### `Prescription`

Relationships:

- `belongsTo(User)`
- `hasMany(Order)`

### `RareRequest`

No relationships currently defined.

Relationship map:

```text
User
|- hasOne Pharmacy
|- hasOne Cart
|- hasMany Orders
`- hasMany Prescriptions

Pharmacy
|- belongsTo User
|- hasMany Medicaments
`- hasMany Orders

Cart
`- hasMany CartItems

CartItem
|- belongsTo Cart
`- belongsTo Medicament

Order
|- belongsTo User
|- belongsTo Pharmacy
|- belongsTo Prescription (optional)
`- hasMany OrderItems

OrderItem
|- belongsTo Order
`- belongsTo Medicament
```

## 7. Validation And Request Handling

Validation is done in two styles.

### A. Form Request classes

Used when the action is important and repeated enough to deserve its own request object.

Examples:

- `LoginRequest`
- `AddToCartRequest`
- `StoreOrderRequest`
- `StoreMedicamentRequest`
- `UpdateMedicamentRequest`
- `ProfileUpdateRequest`

`LoginRequest` does more than field validation. It also:

- rate-limits attempts
- performs `Auth::attempt`
- throws validation errors when credentials are wrong

`AddToCartRequest` both:

- validates fields
- authorizes only users whose role is `client`

### B. Inline controller validation

Some controllers still validate inline with `$request->validate()`.

Examples:

- `PharmacyController@store`
- `PharmacyController@updateMyPharmacy`
- `PrescriptionController@store`
- `RareRequestController@store`
- `OrderController@updateStatus`
- `PasswordController@update`

## 8. Service Layer And Business Rules

### `CartService`

Key business rules:

- quantity must be positive
- a cart can only contain items from one pharmacy
- updating and clearing cart are centralized here
- total and item count are calculated here

### `StockValidator`

Key responsibilities:

- validate stock availability for each cart item
- validate all cart items belong to the chosen pharmacy
- validate prescription requirements

The prescription rule checks whether the user has a pending or validated prescription not already linked to an order.

### `InventoryManager`

This is a strong design choice. It uses:

- `DB::transaction`
- `lockForUpdate()`

to prevent race conditions during stock changes.

### `OrderServiceImproved`

This is the heart of checkout.

Flow inside `createOrderFromCart()`:

1. load the cart
2. ensure it exists and is not empty
3. load cart items with medicaments
4. validate pharmacy consistency
5. validate stock
6. validate prescription requirements
7. calculate total
8. attach a prescription if required
9. create the order
10. create order items
11. decrease stock safely
12. clear cart

All of this runs inside a transaction.

## 9. How Laravel Sends Data To Inertia

This project sends data to React in two ways.

### A. `Inertia::render(...)`

Examples:

- `AuthenticatedSessionController@create` -> `auth/login`
- `RegisteredUserController@create` -> `auth/register`
- `ProfileController@edit` -> `settings/profile`
- `PasswordController@edit` -> `settings/password`
- `PharmacyController@create` -> `pharmacien/create-pharmacy`
- `routes/web.php` -> `welcome`, `cart`, `orders`, `pharmacies`, `pharmacy-details`, and others

Props examples:

- login page gets `canResetPassword` and `status`
- settings/profile gets `mustVerifyEmail` and `status`
- pharmacy details page gets `pharmacyId`

### B. Shared props through middleware

`HandleInertiaRequests` adds:

- app name
- quote
- `auth.user`

Important architectural reality:

- the backend generally does not send business datasets directly in Inertia props for pages like cart or pharmacies
- instead, it renders the page shell and expects the React page to call the API

## 10. Example Request Lifecycle: `POST /api/orders`

This is the best backend example because it touches routing, validation, services, transactions, and models.

### Step 1. Frontend sends the request

`resources/js/pages/cart.tsx` calls `POST /api/orders` with `pharmacy_id`.

### Step 2. Route resolution

`routes/api.php` maps it to `OrderController@store`.

### Step 3. Validation and authorization

`StoreOrderRequest` runs before the controller method. It:

- authorizes only `client` users
- validates that `pharmacy_id` exists

### Step 4. Controller delegates to service

`OrderController@store()` gets the authenticated user and calls `createOrderFromCart(...)`.

### Step 5. Service transaction starts

`OrderServiceImproved::createOrderFromCart()` opens a DB transaction.

### Step 6. Cart and stock rules are checked

Inside the service:

- cart existence is checked
- empty cart is rejected
- `StockValidator` checks same-pharmacy rule
- `StockValidator` checks stock availability
- `StockValidator` checks prescription requirements

### Step 7. Order is created

The service calculates the total and creates the `orders` row. If the cart requires a prescription, it attaches the latest pending or validated unused prescription.

### Step 8. Order items are created and stock is decremented

`InventoryManager::decreaseStockSafely()` is called for each medicament using row locks. Then `order_items` are created.

### Step 9. Cart is cleared

`CartService::clearCart()` removes all cart items.

### Step 10. JSON response is returned

The controller returns HTTP `201` with the new order summary.

## 11. Project-Specific Backend Observations

### Strong backend choices

- services are used for the most sensitive business workflow: checkout
- stock updates are transaction-safe
- role middleware also enforces pharmacist onboarding
- session-backed API auth is explicitly wired
- route groups are clean and readable

### Weaknesses or improvement opportunities

- `RareRequest` has no user ownership, even though route comments imply user-scoped viewing
- some status lists and thresholds are hard-coded in services/controllers instead of consistently reading `config/pharmacy.php`
- `PharmacyController@store()` uses `->with('error', ...)`, but no shared flash prop is exposed in `HandleInertiaRequests`, so that message is not naturally available to React
- controllers return JSON in many slightly different shapes, which complicates frontend consumption
- authorization is partly middleware-driven and partly manual inside controllers; policies could make ownership rules more consistent

## 12. Mental Model For A New Developer

The safest backend mental model is:

- web routes decide pages
- api routes provide business data
- middleware decides access
- controllers coordinate
- services enforce domain rules
- models represent data relationships

When debugging a feature, trace it in this order:

1. web route or api route
2. middleware
3. controller
4. request validation
5. service
6. model/query
7. response shape

That sequence matches how this codebase is actually organized.
