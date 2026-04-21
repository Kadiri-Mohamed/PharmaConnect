<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRareRequestRequest;
use App\Http\Requests\UpdateRareRequestStatusRequest;
use App\Models\RareRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RareRequestController extends Controller
{
    public function create()
    {
        return Inertia::render('rare-requests', [
            'requests' => [],
        ]);
    }

    public function index(Request $request)
    {
        return Inertia::render('rare-requests', [
            'requests' => $this->getRequests($request->user()),
        ]);
    }

    public function pharmacienIndex()
    {
        return Inertia::render('pharmacien/manage-rare-requests', [
            'requests' => $this->getRequests(),
        ]);
    }

    public function store(StoreRareRequestRequest $request)
    {
        $description = $request['description'];

        if ($description === '') {
            $description = null;
        }

        RareRequest::create([
            'user_id' => $request->user()?->id,
            'medicine_name' => $request['medicine_name'],
            'description' => $description,
            'status' => 'pending',
            'found_by_pharmacy_id' => null,
        ]);

        return back()->with('success', 'Rare request created successfully.');
    }

    public function updateStatus(UpdateRareRequestStatusRequest $request, RareRequest $rareRequest)
    {
        $status = $request['status'];
        $pharmacy = $request->user()->pharmacy;

        if ($status === 'found' && ! $pharmacy) {
            return back()->with('error', 'Create your pharmacy profile before marking a request as found.');
        }

        $foundByPharmacyId = null;
        if ($status === 'found') {
            $foundByPharmacyId = $pharmacy?->id;
        }

        $rareRequest->update([
            'status' => $status,
            'found_by_pharmacy_id' => $foundByPharmacyId,
        ]);

        return back()->with('success', 'Rare request status updated.');
    }

    private function formatRequest(RareRequest $rareRequest): array
    {
        $rareRequest->loadMissing('foundByPharmacy.user', 'user');

        $pharmacy = $rareRequest->foundByPharmacy;

        $formattedPharmacy = null;
        if ($pharmacy) {
            $formattedPharmacy = [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' => $pharmacy->status_garde,
                'pharmacist' => $pharmacy->user ? [
                    'id' => $pharmacy->user->id,
                    'name' => $pharmacy->user->name,
                    'email' => $pharmacy->user->email,
                ] : null,
            ];
        }

        return [
            'id' => $rareRequest->id,
            'medicine_name' => $rareRequest->medicine_name,
            'description' => $rareRequest->description,
            'status' => $rareRequest->status,
            'created_at' => $rareRequest->created_at,
            'updated_at' => $rareRequest->updated_at,
            'user_id' => $rareRequest->user_id,
            'found_by_pharmacy' => $formattedPharmacy,
        ];
    }

    private function getRequests(?User $user = null)
    {
        $query = RareRequest::with('foundByPharmacy.user')->latest();

        if ($user) {
            $query->where('user_id', $user->id);
        }

        $requests = $query->get();

        $formattedRequests = [];
        foreach ($requests as $request) {
            $formattedRequests[] = $this->formatRequest($request);
        }

        return $formattedRequests;
    }
}
