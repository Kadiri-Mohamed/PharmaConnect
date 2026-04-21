<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToCartRequest;
<<<<<<< HEAD
=======
use App\Http\Requests\UpdateCartItemRequest;
>>>>>>> abb3fb790f53f244a146bcee742f47d90d11522a
use App\Models\CartItem;
use App\Services\CartService;
use Exception;
use Inertia\Inertia;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index()
    {
        $user = auth()->user();
        $cart = $user->cart()->firstOrCreate([]);
        
        $cartData = $this->getCartData($cart);

        return Inertia::render('cart', [
            'cart' => $cartData,
        ]);
    }

    public function store(AddToCartRequest $request)
    {
        try {
            $user = $request->user();
            $cart = $user->cart()->firstOrCreate([]);
            
            $medicamentId = $request['medicament_id'];
            $quantity = $request['quantity'];

            $this->cartService->addItem($cart, $medicamentId, $quantity);
            
            return back()->with('success', 'Item added to cart.');
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem)
    {
        $user = $request->user();
        
        if ($cartItem->cart->user_id !== $user->id) {
            abort(403);
        }

        try {
            $quantity = $request['quantity'];
            $this->cartService->updateQuantity($cartItem, $quantity);
            
            return back()->with('success', 'Cart updated.');
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(CartItem $cartItem)
    {
        $user = auth()->user();
        
        if ($cartItem->cart->user_id !== $user->id) {
            abort(403);
        }

        $this->cartService->removeItem($cartItem);

        return back()->with('success', 'Item removed from cart.');
    }

    public function clear()
    {
        $user = auth()->user();
        $cart = $user->cart()->firstOrCreate([]);

        $this->cartService->clearCart($cart);

        return back()->with('success', 'Cart cleared.');
    }

    private function getCartData($cart): array
    {
        $user = auth()->user();
        $items = $cart->items()->with('medicament')->get();
        
        $pharmacyId = null;
        $firstItem = $items->first();
        if ($firstItem && $firstItem->medicament) {
            $pharmacyId = $firstItem->medicament->pharmacy_id;
        }
        
        $hasValidPrescription = $user->prescriptions()->where('status', 'validated')->doesntHave('orders')->exists();
        
        $hasUploadedPrescription = $user->prescriptions()->whereIn('status', ['pending', 'validated'])->doesntHave('orders')->exists();
        
        $hasPrescriptionRequiredItems = false;
        foreach ($items as $item) {
            if ($item->medicament && $item->medicament->requires_prescription) {
                $hasPrescriptionRequiredItems = true;
                break;
            }
        }
        
        $formattedItems = [];
        foreach ($items as $item) {
            $medicament = $item->medicament;
            
            $price = 0;
            $medicamentName = null;
            $itemPharmacyId = null;
            $requiresPrescription = false;
            
            if ($medicament) {
                $price = $medicament->price;
                $medicamentName = $medicament->name;
                $itemPharmacyId = $medicament->pharmacy_id;
                $requiresPrescription = $medicament->requires_prescription;
            }
            
            $subtotal = $price * $item->quantity;
            
            $formattedItems[] = [
                'id' => $item->id,
                'medicament_id' => $item->medicament_id,
                'pharmacy_id' => $itemPharmacyId,
                'medicament_name' => $medicamentName,
                'price' => $price,
                'quantity' => $item->quantity,
                'subtotal' => $subtotal,
                'requires_prescription' => $requiresPrescription,
            ];
        }
        
        $total = $this->cartService->calculateTotal($cart);
        $itemCount = $this->cartService->getItemCount($cart);
        
        return [
            'id' => $cart->id,
            'pharmacy_id' => $pharmacyId,
            'has_valid_prescription' => $hasValidPrescription,
            'has_uploaded_prescription' => $hasUploadedPrescription,
            'has_prescription_required_items' => $hasPrescriptionRequiredItems,
            'items' => $formattedItems,
            'total' => $total,
            'item_count' => $itemCount,
        ];
    }
}
