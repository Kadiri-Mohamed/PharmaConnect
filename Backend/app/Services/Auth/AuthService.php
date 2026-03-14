<?php

namespace App\Services;

use App\Models\User;
use App\DTOs\Auth\SignUpDTO;
use App\DTOs\Auth\SignInDTO;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new user
     */
    public function signUp(SignUpDTO $dto): array
    {
        // Create user
        $user = User::create([
            'name' => $dto->name,
            'email' => $dto->email,
            'password' => Hash::make($dto->password)
        ]);

        // Generate token
        $token = Auth::guard('api')->login($user);

        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer'
        ];
    }

    /**
     * Authenticate user and generate token
     */
    public function signIn(SignInDTO $dto): array
    {
        $credentials = $dto->toArray();

        if (!$token = Auth::guard('api')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.']
            ]);
        }

        return [
            'token' => $token,
            'token_type' => 'Bearer'
        ];
    }

    /**
     * Logout user
     */
    public function logout(): void
    {
        if (Auth::guard('api')->check()) {
            Auth::guard('api')->logout();
        }
    }

    /**
     * Refresh token
     */
    public function refreshToken(): array
    {
        $token = Auth::guard('api')->refresh();
        
        return [
            'token' => $token,
            'token_type' => 'Bearer'
        ];
    }

    /**
     * Get authenticated user
     */
    public function getAuthenticatedUser(): ?User
    {
        return Auth::guard('api')->user();
    }
}