<?php

namespace App\Models\Website;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    protected $table = 'website_projects';

    protected $fillable = [
        'title', 'slug', 'client', 'website_industry_id', 'short_description', 'full_description',
        'service_labels', 'featured', 'sort_order', 'status', 'published_at', 'external_url',
        'external_url_status', 'website_preview_type', 'year', 'challenge', 'approach', 'solution',
        'execution', 'results', 'credits', 'seo_title', 'seo_description', 'hero_image',
        'cover_image', 'thumbnail', 'mobile_image', 'website_preview_image', 'og_image',
        'gallery', 'blocks', 'manually_edited', 'source',
    ];

    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
            'manually_edited' => 'boolean',
            'published_at' => 'datetime',
            'service_labels' => 'array',
            'gallery' => 'array',
            'blocks' => 'array',
        ];
    }

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class, 'website_industry_id');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'website_project_service', 'website_project_id', 'website_service_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->orderBy('sort_order');
    }
}
