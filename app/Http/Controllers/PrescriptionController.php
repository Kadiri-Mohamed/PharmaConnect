<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePrescriptionRequest;
use App\Models\Prescription;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PrescriptionController extends Controller
{
    public function index()
    {
        $prescriptions = auth()->user()->prescriptions()
            ->latest()
            ->get()
            ->map(fn (Prescription $prescription) => [
                'id' => $prescription->id,
                'image' => $prescription->image,
                'status' => $prescription->status,
                'created_at' => $prescription->created_at,
                'file_url' => route('prescriptions.file', $prescription),
            ])
            ->values();

        return Inertia::render('prescriptions', [
            'prescriptions' => $prescriptions,
        ]);
    }

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
