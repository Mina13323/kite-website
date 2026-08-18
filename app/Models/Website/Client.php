<?php

namespace App\Models\Website;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $table = 'website_clients';

    protected $fillable = [
        'name', 'slug', 'logo', 'website_url', 'industry', 'sort_order', 'status',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->orderBy('sort_order');
    }
}
