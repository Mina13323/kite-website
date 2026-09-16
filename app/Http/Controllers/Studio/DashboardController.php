<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use App\Models\Website\Industry;
use App\Models\Website\Project;
use App\Models\Website\Service;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(): View
    {
        return view('studio.dashboard', [
            'services' => Service::query()->count(),
            'projects' => Project::query()->count(),
            'published' => Project::query()->where('status', 'published')->count(),
            'industries' => Industry::query()->count(),
        ]);
    }
}
