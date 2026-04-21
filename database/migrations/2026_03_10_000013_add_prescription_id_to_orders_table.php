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
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'prescription_id')) {
                $table->foreignId('prescription_id')
                    ->nullable()
                    ->after('pharmacy_id')
                    ->constrained('prescriptions')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'prescription_id')) {
                $table->dropConstrainedForeignId('prescription_id');
            }
        });
    }
};
