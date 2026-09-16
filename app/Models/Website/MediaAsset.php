<?php

namespace App\Models\Website;

use Illuminate\Database\Eloquent\Model;

class MediaAsset extends Model
{
    protected $table = 'website_media';

    protected $fillable = ['filename', 'url', 'mime', 'size', 'kind'];
}
