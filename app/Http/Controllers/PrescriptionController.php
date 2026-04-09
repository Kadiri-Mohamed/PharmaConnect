<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PrescriptionController extends Controller
{
    /**
     * List prescriptions for the authenticated client.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || $user->role !== 'client') {
            return response()->json([
                'message' => 'Unauthorized',
            ], Response::HTTP_FORBIDDEN);
        }

        $prescriptions = $user->prescriptions()
            ->latest()
            ->get()
            ->map(fn (Prescription $prescription) => [
                'id' => $prescription->id,
                'image' => $prescription->image,
                'status' => $prescription->status,
                'created_at' => $prescription->created_at,
            ]);

        return response()->json([
            'message' => 'Prescriptions retrieved successfully',
            'data' => $prescriptions,
        ], Response::HTTP_OK);
    }

    /**
     * Upload a new prescription for the authenticated client.
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (! $user || $user->role !== 'client') {
            return response()->json([
                'message' => 'Unauthorized',
            ], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $path = $validated['image']->store('prescriptions', 'public');

        $prescription = Prescription::create([
            'user_id' => $user->id,
            'image' => $path,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Prescription uploaded successfully. It will be reviewed soon.',
            'data' => [
                'id' => $prescription->id,
                'image' => $prescription->image,
                'status' => $prescription->status,
                'created_at' => $prescription->created_at,
            ],
        ], Response::HTTP_CREATED);
    }
}
