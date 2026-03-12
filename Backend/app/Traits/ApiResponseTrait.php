<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    protected function successResponse(string $message, $data = null, int $code = 200): JsonResponse
    {
        $response = ['message' => $message];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        return response()->json($response, $code);
    }

    protected function errorResponse(string $message, $errors = null, int $code = 400): JsonResponse
    {
        $response = ['message' => $message];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        return response()->json($response, $code);
    }

    protected function createdResponse(string $message, $data = null): JsonResponse
    {
        return $this->successResponse($message, $data, 201);
    }

    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, 204);
    }

    protected function validationErrorResponse($errors): JsonResponse
    {
        return response()->json([
            'message' => 'Validation error',
            'errors' => $errors
        ], 422);
    }

    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return response()->json(['message' => $message], 401);
    }

    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return response()->json(['message' => $message], 403);
    }

    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return response()->json(['message' => $message], 404);
    }
}