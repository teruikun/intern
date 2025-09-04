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
        Schema::create('borantia_contents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('organization_id');
            $table->foreign('organization_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->string('title');
            $table->string('location');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('recruiting_number');
            $table->integer('applicants_number')->default(0);
            $table->string('phone');
            $table->boolean('accommodation');
            $table->enum('car', ['must', 'preferred', 'none']);
            $table->text('note')->nullable();
            $table->enum('status', ['recruiting', 'closed', 'cancelled'])->default('recruiting');
            $table->unsignedBigInteger('borantia_image_id')->nullable();
            $table->foreign('borantia_image_id')->references('id')->on('images')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borantia_contents');
    }
};
