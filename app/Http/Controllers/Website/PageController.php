<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Models\Website\CaseStudy;
use App\Models\Website\Project;
use App\Models\Website\Service;
use Illuminate\Http\Response;

class PageController extends Controller
{
    public function project(string $slug): Response
    {
        $project = Project::query()->published()->where('slug', $slug)->first();
        abort_unless($project, 404);

        return response('Use the Node preview or extend the Blade renderer for this published project.', 200);
    }

    public function service(string $slug): Response
    {
        $service = Service::query()->published()->where('slug', $slug)->first();
        abort_unless($service, 404);

        return response('Published service.', 200);
    }

    public function caseStudy(string $slug): Response
    {
        $case = CaseStudy::query()->published()->where('slug', $slug)->first();
        abort_unless($case, 404);

        return response('Published case study.', 200);
    }
}
