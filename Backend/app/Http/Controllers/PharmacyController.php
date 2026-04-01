<?php

namespace App\Http\Controllers;

use App\Http\Requests\PharmacyRequest;
use App\Services\Pharmacy\PharmacyService;
use Illuminate\Http\Request;

class PharmacyController extends Controller
{
    public function __construct(private PharmacyService $pharmacyService)
    {
    }

    public function show(Request $request)
    {
        $user = auth('api')->user();

        $pharmacy = $this->pharmacyService->getForUser($user);

        if (!$pharmacy) {
            return response()->json(['message' => 'No pharmacy profile found.'], 404);
        }

        return response()->json(['pharmacy' => $pharmacy], 200);
    }

    public function store(PharmacyRequest $request)
    {
        $user = auth('api')->user();
        $data = $request->validated();

        try {
            $pharmacy = $this->pharmacyService->createForUser($user, $data);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return response()->json(['pharmacy' => $pharmacy, 'message' => 'Pharmacy profile created.'], 201);
    }

    public function update(PharmacyRequest $request)
    {
        $user = auth('api')->user();
        $data = $request->validated();

        try {
            $pharmacy = $this->pharmacyService->updateForUser($user, $data);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }

        return response()->json(['pharmacy' => $pharmacy, 'message' => 'Pharmacy profile updated.'], 200);
    }
}
