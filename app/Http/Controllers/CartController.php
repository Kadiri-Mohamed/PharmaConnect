<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToCartRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Services\CartService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CartController extends Controller
{
    /**
     * Constructor to inject service.
     *
     * @param CartService $cartService
     */
    public function __construct(private CartService $cartService) {}

    /**
     * Display the user's cart.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $user = auth()->user();
            $cart = $user->cart()->firstOrCreate([]);
            $items = $cart->items()->with('medicament')->get();
            $pharmacyId = $items->first()?->medicament?->pharmacy_id;
            $hasValidPrescription = $user->prescriptions()
                ->where('status', 'validated')
                ->exists();
            $hasUploadedPrescription = $user->prescriptions()
                ->whereIn('status', ['pending', 'validated'])
                ->exists();
            $hasPrescriptionRequiredItems = $items->contains(
                fn ($item) => (bool) $item->medicament->requires_prescription
            );

            return response()->json([
                'message' => 'Cart retrieved successfully',
                'data' => [
                    'id' => $cart->id,
                    'pharmacy_id' => $pharmacyId,
                    'has_valid_prescription' => $hasValidPrescription,
                    'has_uploaded_prescription' => $hasUploadedPrescription,
                    'has_prescription_required_items' => $hasPrescriptionRequiredItems,
                    'items' => $items->map(fn ($item) => [
                        'id' => $item->id,
                        'medicament_id' => $item->medicament_id,
                        'pharmacy_id' => $item->medicament->pharmacy_id,
                        'medicament_name' => $item->medicament->name,
                        'price' => $item->medicament->price,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->medicament->price * $item->quantity,
                        'requires_prescription' => (bool) $item->medicament->requires_prescription,
                    ]),
                    'total' => $this->cartService->calculateTotal($cart),
                    'item_count' => $this->cartService->getItemCount($cart),
                ],
            ], Response::HTTP_OK);
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving the cart',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Add an item to the cart.
     *
     * @param AddToCartRequest $request
     * @return JsonResponse
     */
    public function store(AddToCartRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $cart = $user->cart()->firstOrCreate([]);

            $cartItem = $this->cartService->addItem(
                $cart,
                $request->input('medicament_id'),
                $request->input('quantity')
            );

            return response()->json([
                'message' => 'Item added to cart successfully',
                'data' => [
                    'id' => $cartItem->id,
                    'medicament_id' => $cartItem->medicament_id,
                    'quantity' => $cartItem->quantity,
                ],
            ], Response::HTTP_CREATED);
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while adding item to cart',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the quantity of a cart item.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $cartItemId
     * @return JsonResponse
     */
    public function update(\Illuminate\Http\Request $request, int $cartItemId): JsonResponse
    {
        try {
            $request->validate([
                'quantity' => ['required', 'integer', 'min:1'],
            ]);

            $cartItem = CartItem::findOrFail($cartItemId);

            // Verify cart belongs to authenticated user
            if ($cartItem->cart->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], Response::HTTP_FORBIDDEN);
            }

            $updated = $this->cartService->updateQuantity($cartItem, $request->input('quantity'));

            return response()->json([
                'message' => 'Cart item updated successfully',
                'data' => [
                    'id' => $updated->id,
                    'quantity' => $updated->quantity,
                ],
            ], Response::HTTP_OK);
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating cart item',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove an item from the cart.
     *
     * @param int $cartItemId
     * @return JsonResponse
     */
    public function destroy(int $cartItemId): JsonResponse
    {
        try {
            $cartItem = CartItem::findOrFail($cartItemId);

            // Verify cart belongs to authenticated user
            if ($cartItem->cart->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], Response::HTTP_FORBIDDEN);
            }

            $this->cartService->removeItem($cartItem);

            return response()->json([
                'message' => 'Item removed from cart successfully',
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while removing item from cart',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Clear the entire cart.
     *
     * @return JsonResponse
     */
    public function clear(): JsonResponse
    {
        try {
            $user = auth()->user();
            $cart = $user->cart()->firstOrCreate([]);

            $this->cartService->clearCart($cart);

            return response()->json([
                'message' => 'Cart cleared successfully',
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while clearing cart',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
