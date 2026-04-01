<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('pharmacy_id')
                ->constrained('pharmacies')
                ->cascadeOnDelete();

            $table->enum('status', [
                'pending',
                'preparing',
                'ready',
                'delivered',
                'cancelled'
            ])->default('pending')->index();

            $table->decimal('total_price', 10, 2);
            $table->string('delivery_type')->nullable()->comment('pickup or delivery');
            $table->text('delivery_address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Performance indexes
            $table->index(['user_id', 'status']);
            $table->index(['pharmacy_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
