<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePrescriptionRequest;
use App\Models\Prescription;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PrescriptionController extends Controller
{
    public function store(StorePrescriptionRequest $request)
    {
        $path = $request->file('image')->store('prescriptions', 'public');

        Prescription::create([
            'user_id' => $request->user()->id,
            'image' => $path,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Prescription uploaded successfully.');
    }

    public function file(Prescription $prescription)
    {
        $user = auth()->user();

        if (!$user) {
            abort(403);
        }

        $canAccess = false;

        if ($user->role === 'client' && $prescription->user_id === $user->id) {
            $canAccess = true;
        }

        if ($user->role === 'pharmacien' && $user->pharmacy) {
            $hasOrder = $user->pharmacy->orders()->where('prescription_id', $prescription->id)->exists();

            if ($hasOrder) {
                $canAccess = true;
            }
        }

        if (!$canAccess) {
            abort(403);
        }

        return Storage::disk('public')->response($prescription->image);
    }
}