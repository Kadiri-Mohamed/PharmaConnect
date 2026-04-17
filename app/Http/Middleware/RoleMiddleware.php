<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user() || $request->user()->role !== $role) {
            abort(403, 'Unauthorized action.');
        }

        if ($role === 'pharmacien' && ! $request->routeIs('pharmacy.create', 'pharmacy.store')) {
            if (! $request->user()->pharmacy) {
                return redirect()->route('pharmacy.create');
            }
        }

        return $next($request);
    }
}
