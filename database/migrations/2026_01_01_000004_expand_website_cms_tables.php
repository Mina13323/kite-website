<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('website_industries', function (Blueprint $table) {
            $table->string('status')->default('published')->after('sort_order');
            $table->text('description')->nullable()->after('status');
        });

        Schema::table('website_services', function (Blueprint $table) {
            $table->string('statement')->nullable()->after('description');
            $table->text('short_description')->nullable()->after('statement');
            $table->boolean('featured')->default(false)->after('status');
            $table->string('cover_image')->nullable();
            $table->json('images')->nullable();
            $table->json('featured_project_slugs')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
        });

        Schema::table('website_projects', function (Blueprint $table) {
            $table->text('solution')->nullable()->after('approach');
            $table->unsignedInteger('sort_order')->default(0)->after('featured');
            $table->json('blocks')->nullable();
        });

        Schema::create('website_clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('website_url')->nullable();
            $table->string('industry')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status')->default('draft');
            $table->timestamps();
        });

        Schema::create('website_case_studies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('project_slug')->nullable();
            $table->text('introduction')->nullable();
            $table->text('challenge')->nullable();
            $table->text('approach')->nullable();
            $table->text('solution')->nullable();
            $table->text('results')->nullable();
            $table->json('gallery')->nullable();
            $table->string('website_url')->nullable();
            $table->json('services')->nullable();
            $table->string('industry')->nullable();
            $table->boolean('featured')->default(false);
            $table->string('status')->default('draft');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('website_media', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('url');
            $table->string('mime')->nullable();
            $table->unsignedInteger('size')->default(0);
            $table->string('kind')->default('image');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_media');
        Schema::dropIfExists('website_case_studies');
        Schema::dropIfExists('website_clients');
    }
};
