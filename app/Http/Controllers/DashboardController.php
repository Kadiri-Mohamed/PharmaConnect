<?php

namespace App\Http\Controllers;

use App\Models\Medicament;
use App\Models\Order;
use App\Services\CartService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private OrderService $orderService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'pharmacien') {
            return to_route('pharmacien.dashboard');
        }

        $cart = $user->cart()->firstOrCreate([]);
        $recentOrders = $this->orderService->getUserOrders($user)->take(5);
        
        $formattedOrders = [];
        foreach ($recentOrders as $order) {
            $formattedOrders[] = [
                'id' => $order->id,
                'pharmacy_name' => $order->pharmacy?->name,
                'status' => $order->status,
                'total_price' => $order->total_price,
                'created_at' => $order->created_at,
            ];
        }

        return Inertia::render('dashboard', [
            'recentOrders' => $formattedOrders,
            'cartSummary' => [
                'itemCount' => $this->cartService->getItemCount($cart),
                'totalPrice' => $this->cartService->calculateTotal($cart),
            ],
        ]);
    }

    public function pharmacien(Request $request)
    {
        $pharmacy = $request->user()->pharmacy;
        
        if (!$pharmacy) {
            abort(403);
        }
        
        $medicaments = $pharmacy->medicaments()->latest()->get();
        
        $formattedMedicaments = [];
        foreach ($medicaments as $medicament) {
            $formattedMedicaments[] = [
                'id' => $medicament->id,
                'name' => $medicament->name,
                'stock' => $medicament->stock,
            ];
        }
        
        $recentOrders = Order::where('pharmacy_id', $pharmacy->id)->latest()->take(5)->get();
            
        $formattedOrders = [];
        foreach ($recentOrders as $order) {
            $formattedOrders[] = [
                'id' => $order->id,
                'status' => $order->status,
                'total_price' => $order->total_price,
                'created_at' => $order->created_at,
            ];
        }
        
        $lowStockCount = 0;
        foreach ($formattedMedicaments as $medicament) {
            if ($medicament['stock'] <= 20) {
                $lowStockCount++;
            }
        }

        return Inertia::render('pharmacien-dashboard', [
            'pharmacy' => [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' => $pharmacy->status_garde,
            ],
            'medicaments' => $formattedMedicaments,
            'recentOrders' => $formattedOrders,
            'stats' => [
                'totalMedicaments' => count($formattedMedicaments),
                'lowStockCount' => $lowStockCount,
                'totalOrders' => $pharmacy->orders()->count(),
                'totalRevenue' => $pharmacy->orders()->where('status', 'delivered')->sum('total_price'),
            ],
        ]);
    }
}
