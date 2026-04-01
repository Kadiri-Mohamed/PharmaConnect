<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    protected $limiter;

    public function __construct(RateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $key = 'api', int $maxAttempts = 60, int $decayMinutes = 1): Response
    {
        $key = $this->resolveRequestKey($request, $key);

        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'message' => 'API rate limit exceeded. Please try again later.',
                'retry_after' => $this->limiter->availableIn($key),
            ], 429, [
                'Retry-After' => $this->limiter->availableIn($key),
                'X-RateLimit-Limit' => $maxAttempts,
                'X-RateLimit-Remaining' => 0,
            ]);
        }

        $this->limiter->hit($key, $decayMinutes * 60);

        $response = $next($request);

        // Add rate limit headers to response
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', $this->limiter->retriesLeft($key, $maxAttempts));

        return $response;
    }

    /**
     * Resolve the rate limit key for the request.
     */
    protected function resolveRequestKey(Request $request, string $key): string
    {
        switch ($key) {
            case 'auth':
                // Rate limit by IP for auth endpoints
                return 'auth:' . $request->ip();
            case 'api':
                // Rate limit by user ID if authenticated, otherwise by IP
                $userId = auth('api')->id();
                return $userId ? 'user:' . $userId : 'ip:' . $request->ip();
            case 'public':
                // Rate limit by IP for public endpoints
                return 'public:' . $request->ip();
            default:
                return $key . ':' . $request->ip();
        }
    }
}