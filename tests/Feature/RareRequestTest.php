<?php

use App\Models\Pharmacy;
use App\Models\RareRequest;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('client rare request index only shows the authenticated user requests', function () {
    $client = User::factory()->create(['role' => 'client']);
    $otherClient = User::factory()->create(['role' => 'client']);
    $pharmacist = User::factory()->create(['role' => 'pharmacien']);

    $pharmacy = Pharmacy::create([
        'user_id' => $pharmacist->id,
        'name' => 'CarePlus Pharmacy',
        'address' => '42 Main Street',
        'phone' => '0611223344',
        'status_garde' => true,
    ]);

    RareRequest::create([
        'user_id' => $client->id,
        'medicine_name' => 'Rare Medicine A',
        'description' => 'Needed urgently.',
        'status' => 'found',
        'found_by_pharmacy_id' => $pharmacy->id,
    ]);

    RareRequest::create([
        'user_id' => $otherClient->id,
        'medicine_name' => 'Rare Medicine B',
        'description' => 'Other request.',
        'status' => 'pending',
        'found_by_pharmacy_id' => null,
    ]);

    $response = $this
        ->actingAs($client)
        ->get('/rare-requests');

    $response->assertInertia(fn (Assert $page) => $page
        ->component('rare-requests')
        ->has('requests', 1)
        ->where('requests.0.medicine_name', 'Rare Medicine A')
        ->where('requests.0.user_id', $client->id)
        ->where('requests.0.found_by_pharmacy.name', 'CarePlus Pharmacy')
        ->where('requests.0.found_by_pharmacy.id', $pharmacy->id)
    );
});

test('authenticated client rare requests are attached to the current user', function () {
    $client = User::factory()->create(['role' => 'client']);

    $response = $this
        ->actingAs($client)
        ->post('/rare-requests', [
            'medicine_name' => 'Paracetamol Forte',
            'description' => 'Looking for a hard to find format.',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('rare_requests', [
        'user_id' => $client->id,
        'medicine_name' => 'Paracetamol Forte',
        'status' => 'pending',
    ]);
});
