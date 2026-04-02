# PharmaConnect Backend Architecture Improvement Plan

## 1. SEPARATION OF CONCERNS - CURRENT STATUS ✅

### Controllers (GOOD)
- ✅ Thin controllers - only handle HTTP request/response
- ✅ Delegate business logic to services
- ✅ Proper error handling with try/catch
- ✅ Use Form Requests for validation

### Services (GOOD)
- ✅ Encapsulate business logic
- ✅ Use dependency injection
- ✅ Database transactions for critical operations
- ✅ Proper exception handling

### Models (GOOD)
- ✅ Define relationships only
- ✅ No business logic in models
- ✅ Clean structure with proper fillable/casts

---

## 2. CRITICAL ISSUES TO ADDRESS

### ⚠️ ISSUE 1: Race Condition in Stock Management
**Location:** `MedicamentService::decreaseStock()`

**Problem:**
```php
// NOT ATOMIC - Race condition risk
if (!$this->isAvailable($medicament, $quantity)) {
    throw new DomainException(...);
}
$medicament->decrement('stock', $quantity);  // Another request might decrement here
```

**Solution:** Use pessimistic locking
```php
public function decreaseStockWithLock(Medicament $medicament, int $quantity): Medicament
{
    $medicament = DB::transaction(function () use ($medicament, $quantity) {
        // Lock the row for update
        $medicament = Medicament::where('id', $medicament->id)
            ->lockForUpdate()
            ->first();

        if ($medicament->stock < $quantity) {
            throw new DomainException('Insufficient stock');
        }

        $medicament->decrement('stock', $quantity);
        return $medicament->fresh();
    });

    return $medicament;
}
```

---

### ⚠️ ISSUE 2: Stock Check After Order Items Creation
**Location:** `OrderService::createOrderItemsWithStockDecrease()`

**Problem:**
If stock decreases during order processing (between validation and creation), orders can fail partially.

**Solution:** Validate ALL stock availability before creating ANY order items
```php
private function validateAllStockAvailable(Collection $cartItems): void
{
    foreach ($cartItems as $item) {
        if (!$this->medicamentService->isAvailable($item->medicament, $item->quantity)) {
            throw new DomainException(
                "Insufficient stock for {$item->medicament->name}"
            );
        }
    }
}
```

---

### ⚠️ ISSUE 3: Performance - Using `fresh()` After Increments
**Location:** `CartService::addItem()`, `MedicamentService::*Stock()`

**Problem:**
```php
$existingItem->increment('quantity', $quantity);
return $existingItem->fresh();  // Extra query!
```

**Solution:** Don't use `fresh()` after increment/decrement
```php
$existingItem->increment('quantity', $quantity);
$existingItem->quantity += $quantity;  // Update in-memory
return $existingItem;
```

---

### ⚠️ ISSUE 4: Database Aggregation Not Used
**Location:** `CartService::calculateTotal()`

**Problem:**
```php
return $cart->items()->with('medicament')
    ->get()
    ->sum(function (CartItem $item) {
        return $item->medicament->price * $item->quantity;
    });
```
Load all items into memory and sum in PHP.

**Solution:** Use database aggregation
```php
public function calculateTotalWithDatabaseAggregation(Cart $cart): float
{
    return $cart->items()
        ->join('medicaments', 'cart_items.medicament_id', '=', 'medicaments.id')
        ->selectRaw('CAST(SUM(medicaments.price * cart_items.quantity) AS DECIMAL(10,2)) as total')
        ->value('total') ?? 0;
}
```

---

## 3. METHOD NAMING IMPROVEMENTS

| Current | Suggested | Reason |
|---------|-----------|--------|
| `addItem` | `addOrIncrementItem` | Clarifies behavior when item exists |
| `decreaseStock` | `decreaseStockOrFail` | Shows it throws exception |
| `isEmpty` | `hasItems` (negated) | More semantic |
| `isAvailable` | `hasAvailableStock` | Clearer intent |
| `calculateTotal` | `calculateCartTotal` | Avoid confusion with OrderService |

---

## 4. MISSING EDGE CASES

### Edge Case 1: Prescription-Required Medicaments
**Issue:** No validation that user has prescription before ordering prescription-required items.

**Solution:** Add to `OrderService`
```php
private function validatePrescriptionRequirements(Collection $cartItems, User $user): void
{
    $prescriptionRequired = $cartItems->filter(fn($item) => $item->medicament->requires_prescription);
    
    if ($prescriptionRequired->isEmpty()) {
        return;
    }

    $userPrescriptions = $user->prescriptions()
        ->where('status', 'validated')
        ->count();

    if ($userPrescriptions === 0) {
        throw new DomainException('Valid prescription required for selected items');
    }
}
```

### Edge Case 2: Order Creation Fails After Stock Decrease
**Issue:** If OrderItem::create() fails, stock is already decreased.

**Solution:** Already handled with `DB::transaction()` ✓

### Edge Case 3: Quantity Overflow
**Issue:** No max quantity validation.

**Solution:** Add to Form Request
```php
'quantity' => ['required', 'integer', 'min:1', 'max:' . config('pharmacy.max_order_quantity', 9999)]
```

### Edge Case 4: Concurrent Cart Modifications
**Issue:** Two requests updating same cart simultaneously.

**Solution:** Use optimistic locking on Cart model
```php
// In Cart model
protected $casts = [
    'version' => 'integer',
];

// In CartService
public function updateQuantity(CartItem $item, int $quantity): CartItem
{
    return DB::transaction(function () use ($item, $quantity) {
        $item = CartItem::lockForUpdate()->find($item->id);
        $item->update(['quantity' => $quantity]);
        return $item->fresh();
    });
}
```

---

## 5. PERFORMANCE OPTIMIZATIONS

### 5.1 Database Indices
```sql
-- Add these indices
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_medicaments_pharmacy_id ON medicaments(pharmacy_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_pharmacy_id ON orders(pharmacy_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
```

### 5.2 Query Optimization - Use Select()
```php
// Before
$medicaments = Medicament::with('pharmacy')->get();

// After - only needed columns
$medicaments = Medicament::with('pharmacy:id,name')
    ->select(['id', 'pharmacy_id', 'name', 'price', 'stock'])
    ->get();
```

### 5.3 Remove Unnecessary fresh() Calls
Instead of:
```php
$medicament->decrement('stock', $quantity);
return $medicament->fresh();
```

Use:
```php
$medicament->decrement('stock', $quantity);
$medicament->stock -= $quantity;
return $medicament;
```

### 5.4 Eager Load in Controllers
```php
// In OrderController::show()
$order->load([
    'pharmacy:id,name,address,phone',
    'items:id,order_id,medicament_id,quantity,price',
    'items.medicament:id,name,price'
]);
```

---

## 6. REUSABLE LOGIC EXTRACTION

### Create StockValidator Service
```php
class StockValidator
{
    public function validateAvailability(Medicament $medicament, int $quantity): bool
    {
        return $medicament->stock >= $quantity;
    }

    public function validateCollectionAvailability(Collection $items): void
    {
        foreach ($items as $item) {
            if (!$this->validateAvailability($item->medicament, $item->quantity)) {
                throw new DomainException("Insufficient stock for {$item->medicament->name}");
            }
        }
    }
}
```

### Create InventoryManager Service
```php
class InventoryManager
{
    public function decreaseStockSafely(Medicament $medicament, int $quantity): void
    {
        DB::transaction(function () use ($medicament, $quantity) {
            $medicament = Medicament::lockForUpdate()->find($medicament->id);
            
            if ($medicament->stock < $quantity) {
                throw new DomainException('Insufficient stock');
            }

            $medicament->decrement('stock', $quantity);
        });
    }

    public function increaseStock(Medicament $medicament, int $quantity): void
    {
        $medicament->increment('stock', $quantity);
    }
}
```

---

## 7. SUGGESTED REFACTORING STEPS

### Step 1: Add Stock Locking
- Update MedicamentService to use pessimistic locking
- Add decreaseStockWithLock() method
- Update OrderService to use new method

### Step 2: Validate Stock Before Order Items
- Add validateAllStockAvailable() to OrderService
- Call before createOrderItemsWithStockDecrease()

### Step 3: Remove Unnecessary fresh() Calls
- Update all services to avoid fresh() after increment/decrement
- Update in-memory instead

### Step 4: Add Database Indices
- Create migration for indices
- Test performance improvement

### Step 5: Add Prescription Validation
- Add validatePrescriptionRequirements() to OrderService
- Update Form Request if needed

### Step 6: Add Configuration
- Create config/pharmacy.php for business rules
- Max order quantity, session timeout, etc.

---

## 8. CODE EXAMPLES FOR IMPROVEMENTS

### Before (Race Condition)
```php
if (!$this->medicamentService->isAvailable($medicament, $quantity)) {
    throw new DomainException('Out of stock');
}
$medicament->decrement('stock', $quantity);
```

### After (Safe with Lock)
```php
$medicament = DB::transaction(function () use ($medicament, $quantity) {
    $medicament = Medicament::lockForUpdate()->find($medicament->id);
    
    if ($medicament->stock < $quantity) {
        throw new DomainException('Insufficient stock');
    }

    $medicament->decrement('stock', $quantity);
    return $medicament->refresh();
});
```

---

## 9. TESTING RECOMMENDATIONS

### Unit Tests
- [ ] Test stock decreases correctly with concurrent requests
- [ ] Test cart total calculation accuracy
- [ ] Test prescription validation
- [ ] Test order creation failure rollback

### Integration Tests
- [ ] Test full order flow with stock deduction
- [ ] Test concurrent cart modifications
- [ ] Test pharmacy validation in orders

### Load Tests
- [ ] Simulate 100+ concurrent orders
- [ ] Verify no overselling occurs
- [ ] Check query performance

---

## 10. MONITORING & LOGGING

### Add Application Logging
```php
// In OrderService
Log::info('Order created', [
    'order_id' => $order->id,
    'user_id' => $user->id,
    'total_items' => $cartItems->count(),
    'total_price' => $totalPrice,
]);
```

### Add Business Events
```php
event(new OrderCreated($order));
event(new StockDecreased($medicament, $quantity));
```

---

## Summary of Priorities

| Priority | Issue | Impact |
|----------|-------|--------|
| 🔴 CRITICAL | Race condition in stock management | Data integrity |
| 🔴 CRITICAL | No pre-validation stock check | Order failures |
| 🟠 HIGH | Database aggregation not used | Performance |
| 🟠 HIGH | Unnecessary fresh() calls | Extra queries |
| 🟡 MEDIUM | Missing prescription validation | Business rules |
| 🟡 MEDIUM | Method naming clarity | Code maintenance |
| 🟢 LOW | Missing database indices | Scalability |

---

## Implementation Timeline

**Phase 1 (Immediate):** Fix race conditions, add locking
**Phase 2 (Week 1):** Remove fresh() calls, add database aggregation
**Phase 3 (Week 2):** Add prescription validation, improve method names
**Phase 4 (Week 3):** Add indices, implement logging & events
