<?php

namespace App\Models\Website;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Industry extends Model
{
    protected $table = 'website_industries';

    protected $fillable = ['name', 'slug', 'sort_order', 'status', 'description'];

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'website_industry_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->orderBy('sort_order');
    }
}
