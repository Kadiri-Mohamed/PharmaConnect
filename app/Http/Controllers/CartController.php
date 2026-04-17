<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Services\CartService;
use DomainException;
use Inertia\Inertia;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index()
    {
        $cart = auth()->user()->cart()->firstOrCreate([]);

        return Inertia::render('cart', [
            'cart' => $this->cartData($cart),
        ]);
    }

    public function store(AddToCartRequest $request)
    {
        try {
            $cart = $request->user()->cart()->firstOrCreate([]);

            $this->cartService->addItem(
                $cart,
                $request->integer('medicament_id'),
                $request->integer('quantity')
            );
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Item added to cart.');
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem)
    {
        abort_unless($cartItem->cart->user_id === $request->user()->id, 403);

        try {
            $this->cartService->updateQuantity($cartItem, $request->integer('quantity'));
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Cart updated.');
    }

    public function destroy(CartItem $cartItem)
    {
        abort_unless($cartItem->cart->user_id === auth()->id(), 403);

        $this->cartService->removeItem($cartItem);

        return back()->with('success', 'Item removed from cart.');
    }

    public function clear()
    {
        $cart = auth()->user()->cart()->firstOrCreate([]);

        $this->cartService->clearCart($cart);

        return back()->with('success', 'Cart cleared.');
    }

    private function cartData($cart): array
    {
        $user = auth()->user();
        $items = $cart->items()->with('medicament')->get();
        $pharmacyId = $items->first()?->medicament?->pharmacy_id;

        return [
            'id' => $cart->id,
            'pharmacy_id' => $pharmacyId,
            'has_valid_prescription' => $user->prescriptions()
                ->where('status', 'validated')
                ->doesntHave('orders')
                ->exists(),
            'has_uploaded_prescription' => $user->prescriptions()
                ->whereIn('status', ['pending', 'validated'])
                ->doesntHave('orders')
                ->exists(),
            'has_prescription_required_items' => $items->contains(
                fn (CartItem $item) => (bool) $item->medicament?->requires_prescription
            ),
            'items' => $items->map(fn (CartItem $item) => [
                'id' => $item->id,
                'medicament_id' => $item->medicament_id,
                'pharmacy_id' => $item->medicament?->pharmacy_id,
                'medicament_name' => $item->medicament?->name,
                'price' => $item->medicament?->price,
                'quantity' => $item->quantity,
                'subtotal' => ($item->medicament?->price ?? 0) * $item->quantity,
                'requires_prescription' => (bool) $item->medicament?->requires_prescription,
            ])->values(),
            'total' => $this->cartService->calculateTotal($cart),
            'item_count' => $this->cartService->getItemCount($cart),
        ];
    }
}
