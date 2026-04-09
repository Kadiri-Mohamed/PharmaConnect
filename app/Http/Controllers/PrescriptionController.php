<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

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
            'message' => 'Prescription uploaded successfully. You can now place your order and the pharmacy will review it.',
            'data' => [
                'id' => $prescription->id,
                'image' => $prescription->image,
                'status' => $prescription->status,
                'created_at' => $prescription->created_at,
            ],
        ], Response::HTTP_CREATED);
    }

    /**
     * Stream a prescription file for authorized users.
     */
    public function file(Prescription $prescription)
    {
        $user = auth()->user();
        if (! $user) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $canAccess = false;

        if ($user->role === 'client' && $prescription->user_id === $user->id) {
            $canAccess = true;
        }

        if ($user->role === 'pharmacien' && $user->pharmacy) {
            $canAccess = $user->pharmacy->orders()
                ->where('prescription_id', $prescription->id)
                ->exists();
        }

        if (! $canAccess) {
            abort(Response::HTTP_FORBIDDEN);
        }

        return Storage::disk('public')->response($prescription->image);
    }
}
