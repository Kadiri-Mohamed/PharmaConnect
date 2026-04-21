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
        Schema::table('rare_requests', function (Blueprint $table) {
            $table->foreignId('found_by_pharmacy_id')
                ->nullable()
                ->after('status')
                ->constrained('pharmacies')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rare_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('found_by_pharmacy_id');
        });
    }
};
