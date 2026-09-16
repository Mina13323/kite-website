<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Website\Industry;
use App\Models\Website\Project;
use App\Models\Website\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class WebsiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $seed = json_decode((string) file_get_contents(database_path('data/website-seed.json')), true);

        User::query()->firstOrCreate(
            ['email' => 'studio@kiteagency-eg.com'],
            [
                'name' => 'Website Content Manager',
                'password' => Hash::make(env('STUDIO_PASSWORD', 'kite-studio')),
                'role' => 'content_manager',
            ]
        );

        foreach ($seed['industries'] as $row) {
            Industry::query()->updateOrCreate(
                ['slug' => $row['slug']],
                ['name' => $row['name'], 'sort_order' => $row['sort_order']]
            );
        }

        foreach ($seed['services'] as $row) {
            Service::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'name' => $row['name'],
                    'description' => $row['description'],
                    'capabilities' => $row['capabilities'],
                    'status' => $row['status'] ?? 'published',
                    'sort_order' => $row['sort_order'],
                ]
            );
        }

        foreach ($seed['projects'] as $row) {
            $existing = Project::query()->where('slug', $row['slug'])->first();

            if ($existing?->manually_edited) {
                continue;
            }

            $industry = Industry::query()->where('slug', $row['industry'])->first();

            $project = Project::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'title' => $row['title'],
                    'client' => $row['client'] ?? $row['title'],
                    'website_industry_id' => $industry?->id,
                    'short_description' => $existing?->short_description ?: ($row['short_description'] ?? null),
                    'full_description' => $existing?->full_description ?: ($row['full_description'] ?? null),
                    'service_labels' => $row['service_labels'] ?? [],
                    'featured' => $existing?->featured ?? false,
                    'status' => $existing?->status ?? 'draft',
                    'external_url' => $existing?->external_url ?: ($row['external_url'] ?? null),
                    'external_url_status' => $row['external_url_status'] ?? null,
                    'hero_image' => $existing?->hero_image,
                    'cover_image' => $existing?->cover_image,
                    'thumbnail' => $existing?->thumbnail,
                    'mobile_image' => $existing?->mobile_image,
                    'website_preview_image' => $existing?->website_preview_image,
                    'og_image' => $existing?->og_image,
                    'gallery' => $existing?->gallery ?? [],
                    'source' => 'kite-portfolio-2025',
                ]
            );

            $serviceIds = Service::query()->whereIn('slug', $row['services'] ?? [])->pluck('id');
            $project->services()->sync($serviceIds);
        }

        DB::table('website_settings')->updateOrInsert(
            ['key' => 'company'],
            ['value' => json_encode($seed['settings']), 'updated_at' => now(), 'created_at' => now()]
        );
    }
}
