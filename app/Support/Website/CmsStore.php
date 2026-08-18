<?php

namespace App\Support\Website;

/**
 * Same JSON store as database/data/cms-store.cjs.
 * Public pages and sitemap read this file — never resources/site/content.php.
 */
class CmsStore
{
    public const SERVICE_ALIASES = [
        'media' => 'media-production',
        'web' => 'web-development',
        'digital' => 'digital-content',
        'marketing' => 'marketing-materials',
        'graphic-design' => 'branding',
        'btl' => 'marketing-materials',
    ];

    public const SERVICE_ART = [
        'branding' => '/assets/kite/services/branding.jpg',
        'media-production' => '/assets/kite/services/media.jpg',
        'web-development' => '/assets/kite/services/web.jpg',
        'digital-content' => '/assets/kite/services/digital.jpg',
        'marketing-materials' => '/assets/kite/services/marketing.jpg',
    ];

    public static function storePath(): string
    {
        return storage_path('app/website/cms.json');
    }

    public static function seedPath(): string
    {
        return database_path('data/website-seed.json');
    }

    public static function leadsPath(): string
    {
        return storage_path('app/website/leads.json');
    }

    public static function read(): array
    {
        $path = self::storePath();
        if (! is_file($path)) {
            $seed = json_decode((string) file_get_contents(self::seedPath()), true) ?: [];
            self::write(self::normalizeSeed($seed));
        }

        return json_decode((string) file_get_contents(self::storePath()), true) ?: [];
    }

    public static function write(array $data): void
    {
        $dir = dirname(self::storePath());
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents(self::storePath(), json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    public static function published(array $list): array
    {
        $out = array_values(array_filter($list, fn ($item) => ($item['status'] ?? '') === 'published'));
        usort($out, fn ($a, $b) => ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0));

        return $out;
    }

    public static function publicPayload(): array
    {
        $data = self::read();
        $projects = self::published($data['projects'] ?? []);
        $services = array_map([self::class, 'withServiceArt'], self::published($data['services'] ?? []));
        $clients = self::published($data['clients'] ?? []);
        $cases = self::published($data['case_studies'] ?? []);
        $featuredSlugs = $data['homepage']['featured_project_slugs'] ?? [];
        $featured = [];
        foreach ($featuredSlugs as $slug) {
            foreach ($projects as $project) {
                if (($project['slug'] ?? '') === $slug) {
                    $featured[] = $project;
                    break;
                }
            }
        }

        return [
            'settings' => $data['settings'] ?? [],
            'company' => $data['company'] ?? [],
            'homepage' => $data['homepage'] ?? [],
            'image_specs' => $data['image_specs'] ?? [],
            'services' => $services,
            'industries' => $data['industries'] ?? [],
            'projects' => $projects,
            'featured_projects' => $featured ?: array_values(array_filter($projects, fn ($p) => ! empty($p['featured']))),
            'clients' => $clients,
            'case_studies' => $cases,
        ];
    }

    public static function withServiceArt(array $service): array
    {
        if (empty($service['cover_image'])) {
            $service['cover_image'] = self::SERVICE_ART[$service['slug'] ?? ''] ?? null;
        }

        return $service;
    }

    public static function resolveServiceSlug(string $slug): string
    {
        return self::SERVICE_ALIASES[$slug] ?? $slug;
    }

    public static function serviceBySlug(string $slug, bool $allowUnpublished = false): ?array
    {
        $slug = self::resolveServiceSlug($slug);
        foreach (self::read()['services'] ?? [] as $service) {
            if (($service['slug'] ?? '') !== $slug) {
                continue;
            }
            if (! $allowUnpublished && ($service['status'] ?? '') !== 'published') {
                return null;
            }

            return self::withServiceArt($service);
        }

        return null;
    }

    public static function projectBySlug(string $slug, bool $allowUnpublished = false): ?array
    {
        foreach (self::read()['projects'] ?? [] as $project) {
            if (($project['slug'] ?? '') !== $slug) {
                continue;
            }
            if (! $allowUnpublished && ($project['status'] ?? '') !== 'published') {
                return null;
            }

            return $project;
        }

        return null;
    }

    public static function caseBySlug(string $slug, bool $allowUnpublished = false): ?array
    {
        foreach (self::read()['case_studies'] ?? [] as $case) {
            if (($case['slug'] ?? '') !== $slug) {
                continue;
            }
            if (! $allowUnpublished && ($case['status'] ?? '') !== 'published') {
                return null;
            }

            return $case;
        }

        return null;
    }

    public static function projectsForService(string $slug): array
    {
        $slug = self::resolveServiceSlug($slug);

        return array_values(array_filter(
            self::published(self::read()['projects'] ?? []),
            fn ($project) => in_array($slug, $project['services'] ?? [], true)
        ));
    }

    public static function industryName(?string $slug): string
    {
        foreach (self::read()['industries'] ?? [] as $industry) {
            if (($industry['slug'] ?? '') === $slug) {
                return (string) ($industry['name'] ?? '');
            }
        }

        return '';
    }

    public static function stats(): array
    {
        $data = self::read();

        return [
            'projects' => count($data['projects'] ?? []),
            'published_projects' => count(array_filter($data['projects'] ?? [], fn ($p) => ($p['status'] ?? '') === 'published')),
            'draft_projects' => count(array_filter($data['projects'] ?? [], fn ($p) => ($p['status'] ?? '') === 'draft')),
            'published_services' => count(self::published($data['services'] ?? [])),
            'published_case_studies' => count(self::published($data['case_studies'] ?? [])),
            'published_clients' => count(self::published($data['clients'] ?? [])),
            'media' => count($data['media'] ?? []),
            'industries' => count($data['industries'] ?? []),
            'missing_email' => empty($data['settings']['email']),
            'missing_address' => empty($data['settings']['address']),
        ];
    }

    public static function appendLead(array $fields): array
    {
        $path = self::leadsPath();
        $dir = dirname($path);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $existing = is_file($path) ? (json_decode((string) file_get_contents($path), true) ?: []) : [];
        $lead = [
            'name' => mb_substr((string) ($fields['name'] ?? ''), 0, 120),
            'email' => mb_substr((string) ($fields['email'] ?? ''), 0, 180),
            'business' => mb_substr((string) ($fields['business'] ?? ''), 0, 180),
            'mobile' => mb_substr((string) ($fields['mobile'] ?? ''), 0, 60),
            'at' => date('c'),
        ];
        $existing[] = $lead;
        file_put_contents($path, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return $lead;
    }

    public static function origin(): string
    {
        return rtrim((string) (env('APP_URL') ?: 'https://www.kiteagency-eg.com'), '/');
    }

    private static function normalizeSeed(array $seed): array
    {
        $projects = [];
        foreach ($seed['projects'] ?? [] as $i => $project) {
            $projects[] = array_merge($project, [
                'id' => $project['slug'] ?? ('project-'.$i),
                'sort_order' => $project['sort_order'] ?? ($i + 1),
                'blocks' => $project['blocks'] ?? [],
                'gallery' => $project['gallery'] ?? [],
                'cover_image' => $project['cover_image'] ?? null,
                'hero_image' => $project['hero_image'] ?? null,
                'featured' => false,
                'status' => 'draft',
            ]);
        }

        return [
            'settings' => $seed['settings'] ?? [],
            'company' => $seed['company'] ?? [],
            'homepage' => $seed['homepage'] ?? [],
            'image_specs' => $seed['image_specs'] ?? [],
            'industries' => $seed['industries'] ?? [],
            'services' => $seed['services'] ?? [],
            'projects' => $projects,
            'clients' => $seed['clients'] ?? [],
            'case_studies' => $seed['case_studies'] ?? [],
            'media' => $seed['media'] ?? [],
        ];
    }
}
