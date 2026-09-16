<?php

namespace App\Models\Website;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'website_settings';

    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }
}
