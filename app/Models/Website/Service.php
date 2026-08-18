<?php

namespace App\Models\Website;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Service extends Model
{
    protected $table = 'website_services';

    protected $fillable = [
        'name', 'slug', 'description', 'short_description', 'statement', 'capabilities',
        'status', 'featured', 'sort_order', 'cover_image', 'images', 'featured_project_slugs',
        'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'capabilities' => 'array',
            'images' => 'array',
            'featured_project_slugs' => 'array',
            'featured' => 'boolean',
        ];
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'website_project_service', 'website_service_id', 'website_project_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->orderBy('sort_order');
    }
}
