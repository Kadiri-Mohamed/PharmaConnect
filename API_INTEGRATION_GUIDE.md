# PharmaConnect API Integration Guide

## Overview

PharmaConnect uses a centralized API service built with Axios and custom React hooks for clean, reusable API integration across the application.

## API Service (`resources/js/lib/api.js`)

### Configuration
- **Base URL:** `/api`
- **Credentials:** Enabled for authentication
- **Error Handling:** Automatic interceptors for common HTTP errors

### Core Methods
```javascript
import { pharmaConnectApi } from '../lib/api';

// Basic HTTP methods
await pharmaConnectApi.get('/endpoint');
await pharmaConnectApi.post('/endpoint', data);
await pharmaConnectApi.put('/endpoint', data);
await pharmaConnectApi.delete('/endpoint');
await pharmaConnectApi.patch('/endpoint', data);
```

### Organized Endpoints

#### Authentication
```javascript
pharmaConnectApi.auth.login({ email, password });
pharmaConnectApi.auth.register(userData);
pharmaConnectApi.auth.logout();
pharmaConnectApi.auth.user(); // Get current user
```

#### Pharmacies
```javascript
pharmaConnectApi.pharmacies.list();
pharmaConnectApi.pharmacies.show(id);
```

#### Medicaments
```javascript
pharmaConnectApi.medicaments.list();
pharmaConnectApi.medicaments.show(id);
pharmaConnectApi.medicaments.search(query);
```

#### Cart
```javascript
pharmaConnectApi.cart.show();
pharmaConnectApi.cart.add(medicamentId, quantity);
pharmaConnectApi.cart.update(itemId, quantity);
pharmaConnectApi.cart.remove(itemId);
pharmaConnectApi.cart.clear();
```

#### Orders
```javascript
pharmaConnectApi.orders.list();
pharmaConnectApi.orders.create(orderData);
pharmaConnectApi.orders.show(id);
pharmaConnectApi.orders.updateStatus(id, status);
```

#### Pharmacien (Pharmacy Owner)
```javascript
// Pharmacy management
pharmaConnectApi.pharmacien.pharmacy.show();
pharmaConnectApi.pharmacien.pharmacy.update(data);

// Medicament management
pharmaConnectApi.pharmacien.medicaments.list();
pharmaConnectApi.pharmacien.medicaments.create(data);
pharmaConnectApi.pharmacien.medicaments.update(id, data);
pharmaConnectApi.pharmacien.medicaments.delete(id);

// Order management
pharmaConnectApi.pharmacien.orders.list();
pharmaConnectApi.pharmacien.orders.updateStatus(id, status);
```

## React Hooks (`resources/js/hooks/use-api.js`)

### Generic Hooks

#### `useApi(endpoint, initialData)`
Generic hook for any API endpoint with loading/error states.

```javascript
import { useApi } from '../hooks/use-api';
import { pharmaConnectApi } from '../lib/api';

function MyComponent() {
  const { data, loading, error, execute } = useApi(pharmaConnectApi.medicaments.list);

  useEffect(() => {
    execute(); // Trigger the API call
  }, [execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Render data */}</div>;
}
```

#### `useFetch(endpoint, initialData)`
Automatically fetches data on component mount.

```javascript
import { useFetch } from '../hooks/use-api';
import { pharmaConnectApi } from '../lib/api';

function MyComponent() {
  const { data, loading, error, refetch } = useFetch(pharmaConnectApi.medicaments.list);

  // Data is automatically fetched on mount
  // Use refetch() to manually refresh

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {/* Render data */}
    </div>
  );
}
```

### Feature-Specific Hooks

#### `useCart()`
Complete cart management with automatic state updates.

```javascript
import { useCart } from '../hooks/use-api';

function CartComponent() {
  const {
    cart,
    loading,
    error,
    actionLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refetchCart,
  } = useCart();

  const handleAddToCart = async (medicamentId) => {
    try {
      await addToCart(medicamentId, 1);
      // Cart automatically updates
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div>
      {cart.items.map(item => (
        <div key={item.id}>
          {item.medicament.name} - Quantity: {item.quantity}
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <p>Total: ${cart.total_price}</p>
      <button onClick={clearCart} disabled={actionLoading}>Clear Cart</button>
    </div>
  );
}
```

#### `useOrders()`
Order management with status updates.

```javascript
import { useOrders } from '../hooks/use-api';

function OrdersComponent() {
  const {
    orders,
    loading,
    error,
    actionLoading,
    createOrder,
    updateOrderStatus,
  } = useOrders();

  const handleCreateOrder = async () => {
    try {
      await createOrder({ /* order data */ });
      // Orders list automatically updates
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          Order #{order.id} - Status: {order.status}
          {order.status === 'pending' && (
            <button onClick={() => updateOrderStatus(order.id, 'confirmed')}>
              Confirm Order
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

#### `useMedicaments()`
Medicament browsing with search and filtering.

```javascript
import { useMedicaments } from '../hooks/use-api';

function MedicamentsComponent() {
  const {
    medicaments,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    pharmacyFilter,
    setPharmacyFilter,
    pharmacyOptions,
  } = useMedicaments();

  return (
    <div>
      <input
        type="text"
        placeholder="Search medicaments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        value={pharmacyFilter}
        onChange={(e) => setPharmacyFilter(e.target.value)}
      >
        <option value="">All Pharmacies</option>
        {pharmacyOptions.map(pharmacy => (
          <option key={pharmacy} value={pharmacy}>{pharmacy}</option>
        ))}
      </select>

      {medicaments.map(medicament => (
        <div key={medicament.id}>
          {medicament.name} - {medicament.price}€ - {medicament.pharmacy.name}
        </div>
      ))}
    </div>
  );
}
```

#### `usePharmacies()`
Simple pharmacy listing.

```javascript
import { usePharmacies } from '../hooks/use-api';

function PharmaciesComponent() {
  const { pharmacies, loading, error } = usePharmacies();

  return (
    <div>
      {pharmacies.map(pharmacy => (
        <div key={pharmacy.id}>
          {pharmacy.name} - {pharmacy.address}
        </div>
      ))}
    </div>
  );
}
```

#### `usePharmacienDashboard()`
Complete dashboard data for pharmacy owners.

```javascript
import { usePharmacienDashboard } from '../hooks/use-api';

function PharmacienDashboard() {
  const { dashboard, loading, error, refetch } = usePharmacienDashboard();

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  const { pharmacy, medicaments, orders, stats } = dashboard;

  return (
    <div>
      <h1>{pharmacy.name} Dashboard</h1>

      <div className="stats">
        <div>Total Medicaments: {stats.totalMedicaments}</div>
        <div>Low Stock Items: {stats.lowStockCount}</div>
        <div>Total Orders: {stats.totalOrders}</div>
      </div>

      <section>
        <h2>Medicaments</h2>
        {medicaments.map(item => (
          <div key={item.id}>
            {item.name} - Stock: {item.stock}
          </div>
        ))}
      </section>

      <section>
        <h2>Recent Orders</h2>
        {orders.map(order => (
          <div key={order.id}>
            Order #{order.id} - {order.status}
          </div>
        ))}
      </section>
    </div>
  );
}
```

## Error Handling

All hooks include automatic error handling. Errors are captured and can be displayed to users:

```javascript
const { error } = useCart();

if (error) {
  return <div className="error-message">{error}</div>;
}
```

## Loading States

All hooks provide loading states for better UX:

```javascript
const { loading, actionLoading } = useCart();

// loading: true when fetching initial cart data
// actionLoading: true when performing cart actions (add, update, remove)
```

## Best Practices

1. **Use feature-specific hooks** when available (e.g., `useCart()` instead of `useApi()`)
2. **Handle errors gracefully** - always check for error states
3. **Show loading indicators** during API calls
4. **Use actionLoading** for button states during mutations
5. **Refetch data** after mutations to keep UI in sync
6. **Memoize expensive computations** in custom hooks

## Migration from fetch()

Replace existing fetch() calls with the API service:

```javascript
// Before
const response = await fetch('/api/cart', {
  method: 'GET',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
});
const data = await response.json();

// After
const response = await pharmaConnectApi.cart.show();
const data = response.data;
```

## Testing

Hooks can be tested using React Testing Library:

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useCart } from '../hooks/use-api';

test('loads cart data', async () => {
  const { result } = renderHook(() => useCart());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.cart).toBeDefined();
});
```