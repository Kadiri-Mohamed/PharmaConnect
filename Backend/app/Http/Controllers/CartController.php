<?php

namespace App\Http\Controllers;

use App\Services\Cart\CartService;
use App\Http\Requests\CartRequest;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private CartService $cartService)
    {
    }

    /**
     * Get current cart with all items and details.
     */
    public function show(): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $cart = $this->cartService->getCartWithDetails($user);

            return $this->successResponse(
                'Cart retrieved successfully',
                ['cart' => $cart]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve cart',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Add item to cart (or update quantity if already exists).
     * If item exists, quantity will be added to existing quantity.
     */
    public function addItem(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'medicine_id' => 'required|integer|exists:medicines,id',
                'quantity' => 'required|integer|min:1|max:10000',
            ]);

            $user = auth('api')->user();
            $result = $this->cartService->addItem(
                $user,
                $validated['medicine_id'],
                $validated['quantity']
            );

            return $this->successResponse(
                'Item added to cart successfully',
                ['item' => $result]
            );
        } catch (\Exception $e) {
            $statusCode = str_contains($e->getMessage(), 'not found') ? 404 : 400;
            return $this->errorResponse(
                'Failed to add item to cart',
                ['error' => $e->getMessage()],
                $statusCode
            );
        }
    }

    /**
     * Update quantity of an item in the cart.
     */
    public function updateItem(Request $request, int $itemId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1|max:10000',
            ]);

            $user = auth('api')->user();
            $result = $this->cartService->updateItemQuantity(
                $user,
                $itemId,
                $validated['quantity']
            );

            return $this->successResponse(
                'Item quantity updated successfully',
                ['item' => $result]
            );
        } catch (\Exception $e) {
            $statusCode = str_contains($e->getMessage(), 'not found') ? 404 : 400;
            return $this->errorResponse(
                'Failed to update item',
                ['error' => $e->getMessage()],
                $statusCode
            );
        }
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(int $itemId): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $result = $this->cartService->removeItem($user, $itemId);

            return $this->successResponse(
                'Item removed from cart',
                ['result' => $result]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to remove item',
                ['error' => $e->getMessage()],
                404
            );
        }
    }

    /**
     * Clear entire cart.
     */
    public function clear(): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $result = $this->cartService->clearCart($user);

            return $this->successResponse(
                'Cart cleared successfully',
                ['result' => $result]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to clear cart',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get cart total price and item count.
     */
    public function total(): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $result = $this->cartService->calculateTotal($user);

            return $this->successResponse(
                'Cart total retrieved successfully',
                ['total' => $result]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to calculate total',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Validate that all items in cart have sufficient stock.
     * Useful before checkout to ensure items are still available.
     */
    public function validateStock(): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $result = $this->cartService->validateCartStock($user);

            if ($result['is_valid']) {
                return $this->successResponse(
                    'All cart items are available',
                    ['validation' => $result]
                );
            }

            return $this->errorResponse(
                'Some items in your cart are no longer available in the requested quantity',
                ['validation' => $result],
                409
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to validate stock',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get cart summary (lightweight, for UI updates).
     */
    public function summary(): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $result = $this->cartService->calculateTotal($user);

            return $this->successResponse(
                'Cart summary retrieved',
                ['summary' => $result]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to get cart summary',
                ['error' => $e->getMessage()],
                500
            );
        }
    }
}
