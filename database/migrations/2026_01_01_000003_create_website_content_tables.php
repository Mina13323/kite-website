<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('visitor')->after('password');
        });

        Schema::create('website_industries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('website_services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->json('capabilities')->nullable();
            $table->string('status')->default('published');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('website_projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('client')->nullable();
            $table->foreignId('website_industry_id')->nullable()->constrained('website_industries')->nullOnDelete();
            $table->text('short_description')->nullable();
            $table->longText('full_description')->nullable();
            $table->json('service_labels')->nullable();
            $table->boolean('featured')->default(false);
            $table->string('status')->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->string('external_url')->nullable();
            $table->string('external_url_status')->nullable();
            $table->string('website_preview_type')->nullable();
            $table->string('year')->nullable();
            $table->text('challenge')->nullable();
            $table->text('approach')->nullable();
            $table->text('execution')->nullable();
            $table->text('results')->nullable();
            $table->string('credits')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('hero_image')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('mobile_image')->nullable();
            $table->string('website_preview_image')->nullable();
            $table->string('og_image')->nullable();
            $table->json('gallery')->nullable();
            $table->boolean('manually_edited')->default(false);
            $table->string('source')->nullable();
            $table->timestamps();
        });

        Schema::create('website_project_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_project_id')->constrained('website_projects')->cascadeOnDelete();
            $table->foreignId('website_service_id')->constrained('website_services')->cascadeOnDelete();
            $table->unique(['website_project_id', 'website_service_id']);
        });

        Schema::create('website_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_project_service');
        Schema::dropIfExists('website_projects');
        Schema::dropIfExists('website_services');
        Schema::dropIfExists('website_industries');
        Schema::dropIfExists('website_settings');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
