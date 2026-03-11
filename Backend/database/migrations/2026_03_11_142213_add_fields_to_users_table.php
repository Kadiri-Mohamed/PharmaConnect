<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->enum('role', ['client', 'pharmacist', 'admin'])
                  ->default('client')
                  ->after('password');

            $table->string('phone')
                  ->nullable()
                  ->after('role');

            $table->text('address')
                  ->nullable()
                  ->after('phone');

            $table->foreignId('pharmacy_id')
                  ->nullable()
                  ->constrained()
                  ->nullOnDelete()
                  ->after('address');

        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropForeign(['pharmacy_id']);
            $table->dropColumn(['role', 'phone', 'address', 'pharmacy_id']);

        });
    }
};