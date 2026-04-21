<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
<<<<<<< HEAD
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'email_verified_at' => $request->user()->email_verified_at?->toJSON(),
                        'role' => $request->user()->role,
                    ]
                    : null,
=======
                'user' => $request->user(),
>>>>>>> abb3fb790f53f244a146bcee742f47d90d11522a
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}