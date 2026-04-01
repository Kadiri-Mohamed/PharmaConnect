# PharmaConnect - Development TODO

**Last Updated:** April 1, 2026  
**Current Progress:** ~20% Complete  
**Estimated Completion:** 100-120 hours of work

---

## 🔴 HIGH PRIORITY - Core Features (BLOCKING MVP)

### Phase 1: Database & Models (Est. 6-8 hours)

- [ ] Create `Medicine` Model with relationships
  - Belongs to Pharmacy
  - Has many CartItems
  - Has many OrderItems
  - Add fillable: name, description, price, stock, requires_prescription, category

- [ ] Create `Cart` Model
  - Belongs to User
  - Has many CartItems
  - Add relationship: items() returns CartItems with Medicine details

- [ ] Create `CartItem` Model
  - Belongs to Cart
  - Belongs to Medicine
  - Track: medicine_id, quantity, price (snapshot at time of cart)

- [ ] Create `Order` Model
  - Belongs to User
  - Belongs to Pharmacy
  - Has many OrderItems
  - Status enum: pending, preparing, ready, delivered, cancelled
  - Add fields: delivery_type (pickup/delivery), delivery_address, notes

- [ ] Create `OrderItem` Model
  - Belongs to Order
  - Belongs to Medicine
  - Track: medicine_id, quantity, price, prescription_required

- [ ] Create `Prescription` Model
  - Belongs to User
  - Add relationships for validation
  - Status tracking: pending, approved, rejected, verified

- [ ] Create `RareMedicineRequest` Model
  - Belongs to User
  - Status: pending, answered, fulfilled
  - Track: medicine_name, description, requestor_contact

- [ ] Update `Pharmacy` Model
  - Add relationship: hasMany('Medicine')
  - Add relationship: hasMany('Order')
  - Add field migration: latitude, longitude (for location-based search)
  - Add field: rating, review_count

- [ ] Update `User` Model
  - Add relationship: hasMany('Order')
  - Add relationship: hasOne('Cart')
  - Add relationship: hasMany('Prescription')
  - Add relationship: hasMany('RareMedicineRequest')

- [ ] Create database indexes
  - Index on medicines.pharmacy_id
  - Index on orders.user_id, pharmacy_id, status
  - Index on carts.user_id
  - Index on prescriptions.user_id, status
  - Composite index on (pharmacy_id, is_on_duty) for "on duty" queries

- [ ] Fix duplicate migration
  - Remove `2026_03_25_000002_create_pharmacies_table.php`
  - Keep original at `2026_03_08_170410_create_pharmacies_table.php`

### Phase 2: Backend Controllers (Est. 12-15 hours)

- [ ] Create `MedicineController`
  - `index()` - List medicines (paginated, with filtering)
  - `show($id)` - Get single medicine details
  - `store()` - Create medicine (pharmacist only)
  - `update($id)` - Update medicine (pharmacist only, ownership check)
  - `destroy($id)` - Delete medicine (pharmacist only)
  - Add method: `searchByPharmacy($pharmacyId, $query)` - Search medicines in pharmacy

- [ ] Create `CartController`
  - `show()` - Get user's cart with items
  - `addItem()` - Add medicine to cart
  - `removeItem($itemId)` - Remove from cart
  - `updateQuantity($itemId, $quantity)` - Update item quantity
  - `clear()` - Clear entire cart
  - Validation: Check stock availability before adding

- [ ] Create `OrderController`
  - `index()` - List user's orders (paginated)
  - `show($id)` - Get order details with items
  - `store()` - Create order from cart (CRITICAL LOGIC)
  - `update($id)` - Update order status (pharmacist only)
  - `cancel($id)` - Cancel order (user or pharmacist)
  - Add method: `getPharmacistOrders()` - Pharmacist views their orders
  - Add method: `updateOrderStatus()` - Change order status

- [ ] Create `PrescriptionController`
  - `index()` - List user's prescriptions
  - `store()` - Upload prescription (validation of file)
  - `show($id)` - Get prescription details
  - `verify($id)` - Verify prescription (pharmacist)
  - Add method: `validateFile()` - Ensure valid image format

- [ ] Create `RareMedicineRequestController`
  - `index()` - List requests (paginated)
  - `store()` - Submit rare medicine request
  - `show($id)` - Get request details
  - `respond($id)` - Pharmacist responds to request
  - Add filtering: By status, by user

- [ ] Create `PharmacyPublicController` (NEW)
  - `index()` - List all pharmacies (public, on-duty filter)
  - `show($id)` - Get pharmacy details & medicines
  - `searchByLocation($lat, $lng, $radius)` - Find nearby pharmacies
  - `getOnDuty()` - Get all pharmacies currently on duty
  - `getMedicineAvailability($medicineId)` - Which pharmacies have medicine

- [ ] Update `PharmacyController`
  - Add stats endpoint: `getStats()` - Revenue, orders, stock alerts

### Phase 3: API Routes (Est. 3-4 hours)

- [ ] Update `/routes/api.php` with complete routes:
  ```php
  // Public routes (no auth required)
  Route::prefix('public')->group(function () {
      Route::get('pharmacies', 'PharmacyPublicController@index');
      Route::get('pharmacies/{id}', 'PharmacyPublicController@show');
      Route::get('pharmacies/search/location', 'PharmacyPublicController@searchByLocation');
      Route::get('pharmacies/on-duty', 'PharmacyPublicController@getOnDuty');
      Route::post('rare-medicine-requests', 'RareMedicineRequestController@store');
  });

  // Protected routes (all users)
  Route::middleware('auth:api')->group(function () {
      // Medicines
      Route::get('medicines', 'MedicineController@index');
      Route::get('medicines/{id}', 'MedicineController@show');
      
      // Cart
      Route::prefix('cart')->group(function () {
          Route::get('/', 'CartController@show');
          Route::post('items', 'CartController@addItem');
          Route::delete('items/{itemId}', 'CartController@removeItem');
          Route::put('items/{itemId}', 'CartController@updateQuantity');
          Route::delete('/', 'CartController@clear');
      });
      
      // Orders
      Route::prefix('orders')->group(function () {
          Route::get('/', 'OrderController@index');
          Route::get('{id}', 'OrderController@show');
          Route::post('/', 'OrderController@store');
          Route::delete('{id}', 'OrderController@cancel');
      });
      
      // Prescriptions
      Route::prefix('prescriptions')->group(function () {
          Route::get('/', 'PrescriptionController@index');
          Route::post('/', 'PrescriptionController@store');
          Route::get('{id}', 'PrescriptionController@show');
      });
      
      // Rare medicine requests
      Route::get('rare-medicine-requests', 'RareMedicineRequestController@index');
      Route::get('rare-medicine-requests/{id}', 'RareMedicineRequestController@show');
      
      // Pharmacist only routes
      Route::middleware('role:pharmacist')->group(function () {
          Route::post('medicines', 'MedicineController@store');
          Route::put('medicines/{id}', 'MedicineController@update');
          Route::delete('medicines/{id}', 'MedicineController@destroy');
          
          Route::get('orders/pharmacist', 'OrderController@getPharmacistOrders');
          Route::put('orders/{id}/status', 'OrderController@update');
          
          Route::put('prescriptions/{id}/verify', 'PrescriptionController@verify');
          Route::put('rare-medicine-requests/{id}/respond', 'RareMedicineRequestController@respond');
      });
  });
  ```

### Phase 4: Business Logic Services (Est. 8-10 hours)

- [ ] Create `CartService`
  - `addToCart(user, medicine_id, quantity)` - Validate & add
  - `removeFromCart(user, item_id)` - Remove item
  - `updateQuantity(user, item_id, quantity)` - Validate stock
  - `clearCart(user)` - Empty cart
  - `getCartTotal(user)` - Calculate total price
  - Validation: Check stock availability

- [ ] Create `OrderService`
  - `createOrder(user, pharmacy_id, delivery_type, delivery_address)` - Complete order creation
  - `validateOrder(cart)` - Verify all items in stock
  - `calculateTotal(items)` - Sum with taxes if needed
  - `confirmOrder(order)` - Send confirmation email/notification
  - `cancelOrder(order)` - Handle cancellation & restore stock
  - Validation: Ensure single pharmacy per order requirement

- [ ] Create `MedicineService`
  - `searchMedicines(query, pharmacy_id, filters)` - Full-text search
  - `getAvailability(medicine_id)` - Which pharmacies have it
  - `updateStock(medicine_id, quantity)` - Adjust stock after order
  - `checkLowStock(pharmacy_id)` - Alert pharmacist of low stock
  - `getRecommendations(user)` - Based on past orders (if time permits)

- [ ] Create `PharmacyService` (Expand existing)
  - `toggleOnDuty(pharmacy_id)` - Switch on/off duty status
  - `getNearbyPharmacies(lat, lng, radius)` - Distance calculation
  - `getPharmacyMedicines(pharmacy_id)` - All medicines in pharmacy
  - `getPharmacyOrders(pharmacy_id, status)` - Pharmacist orders with filtering

- [ ] Create `PrescriptionService`
  - `validatePrescriptionFile(file)` - Check format, size
  - `storePrescription(user, file)` - Upload & validate
  - `verifyPrescription(prescription)` - Pharmacist approval
  - `linkPrescriptionToOrder(prescription, order)` - Associate with order

- [ ] Create `NotificationService` (FUTURE - for now just stubs)
  - `sendOrderConfirmation(order)` - Email to user
  - `sendLowStockAlert(pharmacy, medicine)` - Email to pharmacist
  - `sendRareMedicineResponse(request, response)` - Email to user

### Phase 5: Validation & Error Handling (Est. 5-6 hours)

- [ ] Create Request Validation Classes:
  - `MedicineRequest.php` - name, price, stock, requires_prescription
  - `CartItemRequest.php` - medicine_id, quantity
  - `OrderRequest.php` - pharmacy_id, delivery_type, delivery_address
  - `PrescriptionRequest.php` - image file validation
  - `RareMedicineRequest.php` - medicine_name, description

- [ ] Create Custom Exception Classes:
  - `InsufficientStockException`
  - `OutOfStockException`
  - `UnauthorizedPharmacyException`
  - `InvalidOrderStateException`
  - `InvalidPrescriptionException`

- [ ] Create Global Exception Handler:
  - Log all exceptions
  - Return consistent JSON error format
  - Map exceptions to appropriate HTTP codes

- [ ] Add Validation Rules:
  - Medicine: price > 0, stock >= 0
  - Order: must have items, valid pharmacy_id
  - Prescription: image only, max 5MB
  - RareMedicineRequest: medicine_name required

---

## 🟠 MEDIUM PRIORITY - Frontend Features (Est. 30-40 hours)

### Phase 6: Frontend Models & Services (Est. 4-5 hours)

- [ ] Create API service hooks
  - `useMedicines()` - Fetch & cache medicines
  - `useCart()` - Cart operations
  - `useOrders()` - Order history
  - `usePharmacies()` - Pharmacy search
  - `usePrescriptions()` - Prescription management

- [ ] Create custom hooks:
  - `useAuth()` - Already exists, verify it works
  - `useApi()` - Generic API call wrapper
  - `useFetch()` - Data fetching with loading/error states

- [ ] Create Context for Cart state:
  - `CartContext` - Global cart management
  - Add to cart, remove from cart, clear cart
  - Persist to localStorage

- [ ] Create utility functions:
  - `formatPrice()` - Format currency
  - `calculateDistance()` - For pharmacy locations
  - `formatDate()` - Consistent date formatting

### Phase 7: Public Pages (Est. 8-10 hours)

- [ ] Create `PublicLanding.jsx`
  - Hero section
  - Features overview
  - Call to action to register
  - NOT behind auth

- [ ] Create `PharmaciesCatalog.jsx`
  - List all pharmacies
  - Filter: On-duty, location-based
  - Search bar
  - Pharmacy cards with info
  - Pagination

- [ ] Create `PharmacyDetail.jsx`
  - Pharmacy info (address, hours, phone)
  - List medicines available
  - Search medicines in this pharmacy
  - Add to cart button for each medicine
  - Reviews/ratings (if time permits)

- [ ] Create public route structure:
  - `/` - Landing page
  - `/pharmacies` - Browse pharmacies
  - `/pharmacies/:id` - Pharmacy detail
  - Only `/login` and `/register` require no auth

### Phase 8: Client Dashboard - Shopping (Est. 10-12 hours)

- [ ] Fix & implement `MedicinesCatalog.jsx`
  - Search medicines across all pharmacies
  - Filter by: category, price range, pharmacy, requires_prescription
  - Sort by: name, price, availability
  - Add to cart functionality
  - Pagination
  - Medicine card component showing:
    - Name, price, pharmacy name
    - Stock status (In stock / Low stock / Out of stock)
    - "Add to cart" button

- [ ] Implement `Cart.tsx` (Complete rewrite)
  - Display cart items in table/list
  - Show: Medicine name, pharmacy, quantity, price, subtotal
  - Buttons: Remove, Update quantity, Continue shopping
  - Cart summary: Subtotal, tax, total
  - Checkout button
  - Empty cart message

- [ ] Create `Checkout.jsx`
  - Select pharmacy from cart medicines
  - Choose delivery type: Pickup or Delivery
  - If delivery: Enter address
  - Review order
  - Place order button
  - Confirmation message

- [ ] Implement `Orders.tsx` (Complete rewrite)
  - List user's orders
  - Columns: Order ID, Date, Pharmacy, Status, Total
  - Filtering: By status
  - Click to view order details
  - Status badge with colors: Pending (yellow), Preparing (blue), Ready (green), Delivered (gray)
  - Cancel button for pending orders

- [ ] Create `OrderDetail.jsx`
  - Show full order information
  - Items with: Medicine name, quantity, price
  - Pharmacy details
  - Status history timeline
  - Delivery address (if applicable)

### Phase 9: Client Features (Est. 6-8 hours)

- [ ] Implement `Prescriptions.jsx`
  - List user's prescriptions
  - Upload new prescription (form)
  - Show status: Pending, Approved, Rejected
  - View prescription image

- [ ] Create `RareMedicineRequest.jsx`
  - Form to request rare medicine
  - Show existing requests
  - Track responses from pharmacists

- [ ] Update `ClientDashboard.jsx`
  - Show recent orders
  - Quick stats: Total spent, Orders, Requests
  - Navigation cards to main features

### Phase 10: Pharmacist Dashboard (Est. 6-8 hours)

- [ ] Implement `InventoryManagement.jsx`
  - Create medicine form
  - List medicines table:
    - Name, Category, Price, Stock, Actions
  - Edit medicine (form modal)
  - Delete medicine (with confirmation)
  - Low stock alerts (red highlighting)
  - Bulk actions: Update stock
  - Search/filter medicines

- [ ] Implement `PharmacyOrders.jsx`
  - List of incoming orders for pharmacist's pharmacy
  - Columns: Order ID, Customer, Items, Status, Date, Total
  - Status badges with colors
  - Update order status dropdown (Pending → Preparing → Ready → Delivered/Cancelled)
  - Order detail modal
  - Filter by status

- [ ] Update `PharmacyDashboard.jsx`
  - Dashboard stats: Total revenue, Orders today, Pending orders, Low-stock items
  - On-duty toggle switch (prominent)
  - Quick links to: Orders, Inventory, Rare requests
  - Recent orders list
  - Chart showing orders by day (optional)

- [ ] Create `RareMedicineRequests.jsx`
  - List of rare medicine requests
  - Show: Medicine name, requester, date, description
  - Status badge
  - Respond button (add response text)
  - Search/filter by status

- [ ] Update `PharmacyProfile.jsx`
  - Show on-duty status with toggle switch
  - Keep existing fields: name, address, phone, hours
  - Add fields (optional): latitude, longitude, rating

---

## 🟢 LOW PRIORITY - Enhancements & Polish (Est. 10-15 hours)

### Phase 11: UI/UX Polish (Est. 4-5 hours)

- [ ] Add loading skeletons for data lists
- [ ] Add error boundaries for crash prevention
- [ ] Add empty state components:
  - Empty cart message
  - No orders message
  - No medicines message
- [ ] Add confirmation modals for destructive actions
- [ ] Add success/error toast notifications
- [ ] Responsive design testing on mobile
- [ ] Improve forms with better UX:
  - Auto-focus on first field
  - Tab navigation
  - Keyboard shortcuts

### Phase 12: Testing (Est. 5-7 hours)

- [ ] Backend Unit Tests:
  - CartService tests
  - OrderService tests
  - MedicineService tests
  - Model relationship tests
  - Minimum 50% coverage

- [ ] Backend Feature Tests:
  - Authentication endpoints
  - Medicine CRUD tests
  - Order creation & status update
  - Cart operations
  - Authorization checks

- [ ] Frontend Component Tests:
  - LoginPage component
  - Cart component
  - Medicine list component
  - Order list component
  - ProtectedRoute component

### Phase 13: Optimization (Est. 3-4 hours)

- [ ] Backend optimization:
  - Add eager loading includes for relationships
  - Create database queries
  - Add caching for frequently accessed data (pharmacies, medicines)
  - Implement pagination on all list endpoints

- [ ] Frontend optimization:
  - Lazy load images
  - Code splitting for pages
  - Memoize expensive components
  - Cache API responses

### Phase 14: Documentation (Est. 3-4 hours)

- [ ] Create API documentation:
  - Endpoint list with descriptions
  - Request/response examples
  - Error codes documentation
  - Use Swagger/OpenAPI format (PostMan JSON)

- [ ] Create database diagram:
  - Visual representation of tables & relationships
  - Export as PNG/PDF

- [ ] Update README with:
  - Complete setup instructions
  - Environment variables template
  - Running in development
  - Testing instructions
  - Deployment guide

- [ ] Add code comments:
  - Complex business logic
  - Important decision points
  - Database query explanations

---

## ✨ BONUS - Nice-to-Have Features (Est. 15+ hours)

- [ ] Real-time notifications using WebSockets
  - Order status updates
  - Chat between customer and pharmacist
  - Live inventory updates

- [ ] Medicine recommendations engine
  - Based on past orders
  - Based on similar user purchases
  - Popular medicines section

- [ ] Advanced search & filtering
  - Full-text search with relevance
  - Filter by medicine type, brand, price range
  - Sort by popularity, price, rating
  - Saved searches

- [ ] Rating & review system
  - Rate medicines
  - Rate pharmacies
  - Review system with photos
  - Helpful votes

- [ ] Admin panel
  - User management
  - Pharmacy approval/verification
  - Statistics & analytics
  - Content management

- [ ] Mobile app
  - React Native version
  - Native notifications
  - Offline support

- [ ] Payment integration (FUTURE)
  - Stripe/PayPal integration
  - Note: Requirements say "no online payment" but structure for future

- [ ] Delivery partner system
  - Track delivery person
  - Real-time location
  - Delivery instructions

- [ ] Subscription/recurring orders
  - Automatic refills
  - Scheduled deliveries
  - Subscription management

---

## 📋 VALIDATION CHECKLIST

### Before marking Phase as Complete:

#### Code Quality:
- [ ] No console.errors or warnings
- [ ] Code follows project conventions
- [ ] No dead code or commented-out code
- [ ] Proper error handling in place
- [ ] Input validation on all endpoints

#### Functionality:
- [ ] Feature works as specified
- [ ] Edge cases handled (empty states, errors)
- [ ] No hard-coded values
- [ ] No test data left in code

#### Testing:
- [ ] At least 50% code coverage
- [ ] Happy path tested
- [ ] Error scenarios tested
- [ ] Authorization checks tested

#### Documentation:
- [ ] Code comments for complex logic
- [ ] API endpoints documented
- [ ] README updated

---

## 🎯 QUICK START - First 5 Hours

If starting fresh, do these in order:

1. Create all Model classes (1 hour)
2. Update migrations and run them (30 minutes)
3. Create basic CRUD controllers skeltons (1 hour)
4. Add API routes (30 minutes)
5. Write basic FormRequest validations (1 hour)

This gives you a working foundation to build upon.

---

## 📊 Progress Tracking

- [ ] **Phase 1**: Database & Models [0%]
- [ ] **Phase 2**: Backend Controllers [0%]
- [ ] **Phase 3**: API Routes [0%]
- [ ] **Phase 4**: Business Logic Services [0%]
- [ ] **Phase 5**: Validation & Error Handling [0%]
- [ ] **Phase 6**: Frontend Models & Services [0%]
- [ ] **Phase 7**: Public Pages [0%]
- [ ] **Phase 8**: Client Dashboard - Shopping [0%]
- [ ] **Phase 9**: Client Features [0%]
- [ ] **Phase 10**: Pharmacist Dashboard [0%]
- [ ] **Phase 11**: UI/UX Polish [0%]
- [ ] **Phase 12**: Testing [0%]
- [ ] **Phase 13**: Optimization [0%]
- [ ] **Phase 14**: Documentation [0%]

---

**Good luck! Remember: Quality > Speed. Test frequently and commit often.** 💪

