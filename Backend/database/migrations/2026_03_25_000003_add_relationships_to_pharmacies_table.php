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
        Schema::table('pharmacies', function (Blueprint $table) {
            // Add user_id foreign key if not exists
            if (!Schema::hasColumn('pharmacies', 'user_id')) {
                $table->foreignId('user_id')
                    ->after('id')
                    ->constrained('users')
                    ->cascadeOnDelete();
            }

            // Add indexes if not exist
            if (!Schema::hasIndex('pharmacies', 'pharmacies_user_id_index')) {
                $table->index('user_id');
            }

            if (!Schema::hasIndex('pharmacies', 'pharmacies_is_on_duty_index')) {
                $table->index('is_on_duty');
            }

            if (!Schema::hasIndex('pharmacies', 'pharmacies_name_index')) {
                $table->index('name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['user_id']);
            $table->dropIndexIfExists('pharmacies_user_id_index');
        });
    }
};
