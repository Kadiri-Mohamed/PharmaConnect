<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PharmacyExistsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'pharmacien' && !$user->pharmacy) {
            return redirect()->route('pharmacy.create');
        }

        return $next($request);
    }
}