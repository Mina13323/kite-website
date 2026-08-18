<?php

namespace App\Models\Website;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class CaseStudy extends Model
{
    protected $table = 'website_case_studies';

    protected $fillable = [
        'title', 'slug', 'project_slug', 'introduction', 'challenge', 'approach',
        'solution', 'results', 'gallery', 'website_url', 'services', 'industry',
        'featured', 'status', 'sort_order', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'services' => 'array',
            'featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->orderBy('sort_order');
    }
}
