<?php

namespace App\Http\Controllers;

use App\Models\Medicament;
use App\Models\Order;
use App\Services\CartService;
use App\Services\OrderServiceImproved;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private OrderServiceImproved $orderService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'pharmacien') {
            return to_route('pharmacien.dashboard');
        }

        $cart = $user->cart()->firstOrCreate([]);
        $recentOrders = $this->orderService->getUserOrders($user)
            ->take(5)
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'pharmacy_name' => $order->pharmacy?->name,
                'status' => $order->status,
                'total_price' => $order->total_price,
                'created_at' => $order->created_at,
            ])
            ->values();

        return Inertia::render('Client/Dashboard', [
            'recentOrders' => $recentOrders,
            'cartSummary' => [
                'itemCount' => $this->cartService->getItemCount($cart),
                'totalPrice' => $this->cartService->calculateTotal($cart),
            ],
        ]);
    }

    public function pharmacien(Request $request)
    {
        $pharmacy = $request->user()->pharmacy;

        abort_unless($pharmacy, 403);

        $medicaments = $pharmacy->medicaments()
            ->latest()
            ->get()
            ->map(fn (Medicament $medicament) => [
                'id' => $medicament->id,
                'name' => $medicament->name,
                'stock' => $medicament->stock,
            ])
            ->values();

        $recentOrders = Order::query()
            ->where('pharmacy_id', $pharmacy->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'status' => $order->status,
                'total_price' => $order->total_price,
                'created_at' => $order->created_at,
            ])
            ->values();

        return Inertia::render('pharmacien-dashboard', [
            'pharmacy' => [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' => (bool) $pharmacy->status_garde,
            ],
            'medicaments' => $medicaments,
            'recentOrders' => $recentOrders,
            'stats' => [
                'totalMedicaments' => $medicaments->count(),
                'lowStockCount' => $medicaments->filter(fn (array $medicament) => $medicament['stock'] <= 20)->count(),
                'totalOrders' => $pharmacy->orders()->count(),
            ],
        ]);
    }
}
