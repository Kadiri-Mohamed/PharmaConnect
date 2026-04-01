<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{

    public function signUp(RegisterRequest $request, AuthService $authService)
    {
        $data = $request->validated();

        $result = $authService->signUp($data);

        return response()->json([
            'message' => 'Account created successfully',
            'token' => $result['token'],
            'token_type' => $result['token_type'],
            'user' => $result['user']
        ], 201);
    }

    public function signIn(Request $request, AuthService $authService)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $validator->validated();

        try {
            $result = $authService->signIn($credentials);

            return response()->json([
                'message' => 'Login successful',
                'token' => $result['token'],
                'token_type' => $result['token_type'],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }
    }


    public function signOut()
    {
        if (!Auth::guard('api')->check()) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        Auth::guard('api')->logout();

        return response()->json([
            'message' => 'Logout successful'
        ], 200);
    }

    /**
     * Refresh JWT token
     */
    public function refresh(Request $request, AuthService $authService)
    {
        try {
            $result = $authService->refreshToken();

            return response()->json([
                'message' => 'Token refreshed successfully',
                'token' => $result['token'],
                'token_type' => $result['token_type'],
            ], 200);

        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json([
                'message' => 'Token is invalid'
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json([
                'message' => 'Token refresh failed'
            ], 401);
        }
    }

    /**
     * Get current authenticated user
     */
    public function me()
    {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        return response()->json([
            'user' => $user
        ], 200);
    }

}