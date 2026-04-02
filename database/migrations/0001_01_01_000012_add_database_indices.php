<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->index('cart_id');
            $table->index('medicament_id');
            $table->unique(['cart_id', 'medicament_id']); // Prevent duplicate items in cart
        });

        Schema::table('medicaments', function (Blueprint $table) {
            $table->index('pharmacy_id');
            $table->index('requires_prescription');
            $table->index('stock');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('pharmacy_id');
            $table->index('status');
            $table->index(['user_id', 'created_at']); // For user order history
            $table->index(['status', 'created_at']); // For status queries
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id');
            $table->index('medicament_id');
        });

        Schema::table('prescriptions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index(['user_id', 'status']); // For validated prescriptions query
            $table->index(['user_id', 'created_at']); // For recent prescriptions
        });

        Schema::table('rare_requests', function (Blueprint $table) {
            $table->index('status');
            $table->index('created_at');
        });

        Schema::table('pharmacies', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status_garde');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropIndex(['cart_id']);
            $table->dropIndex(['medicament_id']);
            $table->dropUnique(['cart_id', 'medicament_id']);
        });

        Schema::table('medicaments', function (Blueprint $table) {
            $table->dropIndex(['pharmacy_id']);
            $table->dropIndex(['requires_prescription']);
            $table->dropIndex(['stock']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['pharmacy_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['status', 'created_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropIndex(['medicament_id']);
        });

        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['user_id', 'created_at']);
        });

        Schema::table('rare_requests', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('pharmacies', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status_garde']);
        });
    }
};
