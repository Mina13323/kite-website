<?php

namespace App\Support;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

/**
 * Loads the MWG site content from resources/data/site.json.
 *
 * The same JSON file feeds the static build (tools/build-static.mjs),
 * so both renderers stay in sync from a single source of truth.
 */
class SiteData
{
    protected ?array $data = null;

    public function all(): array
    {
        if ($this->data !== null) {
            return $this->data;
        }

        $load = fn () => json_decode(
            file_get_contents(resource_path('data/site.json')),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        $this->data = app()->isProduction()
            ? Cache::rememberForever('site.data', $load)
            : $load();

        return $this->data;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return Arr::get($this->all(), $key, $default);
    }

    /* ---------------- collections ---------------- */

    public function services(): array
    {
        return $this->get('services', []);
    }

    public function service(string $slug): ?array
    {
        return collect($this->services())->firstWhere('slug', $slug);
    }

    public function projects(): array
    {
        return $this->get('projects', []);
    }

    public function project(string $slug): ?array
    {
        return collect($this->projects())->firstWhere('slug', $slug);
    }

    public function caseStudies(): array
    {
        return $this->get('caseStudies', []);
    }

    public function caseStudy(string $slug): ?array
    {
        return collect($this->caseStudies())->firstWhere('slug', $slug);
    }

    public function posts(): array
    {
        return $this->get('blog.posts', []);
    }

    public function post(string $slug): ?array
    {
        return collect($this->posts())->firstWhere('slug', $slug);
    }
}
