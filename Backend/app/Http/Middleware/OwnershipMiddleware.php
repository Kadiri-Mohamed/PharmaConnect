<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OwnershipMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $resource = null): Response
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Check ownership based on resource type
        switch ($resource) {
            case 'cart':
                if (!$this->checkCartOwnership($request, $user)) {
                    return response()->json(['message' => 'You can only access your own cart'], 403);
                }
                break;

            case 'order':
                if (!$this->checkOrderOwnership($request, $user)) {
                    return response()->json(['message' => 'You can only access your own orders'], 403);
                }
                break;

            case 'pharmacy':
                if (!$this->checkPharmacyOwnership($request, $user)) {
                    return response()->json(['message' => 'You can only access your own pharmacy'], 403);
                }
                break;

            case 'rare_medicine_request':
                if (!$this->checkRareMedicineRequestOwnership($request, $user)) {
                    return response()->json(['message' => 'You can only access your own requests'], 403);
                }
                break;

            default:
                // For general ownership checks, you might want to implement specific logic
                break;
        }

        return $next($request);
    }

    /**
     * Check if user owns the cart.
     */
    protected function checkCartOwnership(Request $request, $user): bool
    {
        // Cart ownership is handled in CartService, but we can add additional checks here
        return true; // CartService already handles ownership
    }

    /**
     * Check if user owns the order or is a pharmacist managing it.
     */
    protected function checkOrderOwnership(Request $request, $user): bool
    {
        $orderId = $request->route('orderId') ?? $request->route('id');

        if (!$orderId) {
            return true; // Allow if no specific order ID
        }

        $order = \App\Models\Commande::find($orderId);

        if (!$order) {
            return false;
        }

        // User owns the order OR user is pharmacist and order belongs to their pharmacy
        return $order->user_id === $user->id ||
               ($user->role === 'pharmacist' && $order->pharmacy_id === $user->pharmacy?->id);
    }

    /**
     * Check if user owns the pharmacy.
     */
    protected function checkPharmacyOwnership(Request $request, $user): bool
    {
        // Pharmacists can only access their own pharmacy
        return $user->role === 'pharmacist' && $user->pharmacy;
    }

    /**
     * Check if user owns the rare medicine request.
     */
    protected function checkRareMedicineRequestOwnership(Request $request, $user): bool
    {
        $requestId = $request->route('id');

        if (!$requestId) {
            return true; // Allow if no specific request ID
        }

        $rareRequest = \App\Models\RareMedicineRequest::find($requestId);

        if (!$rareRequest) {
            return false;
        }

        // User owns the request OR user is pharmacist (can view all)
        return $rareRequest->user_id === $user->id || $user->role === 'pharmacist';
    }
}