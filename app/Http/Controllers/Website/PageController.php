<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Support\Website\PublicRenderer;
use Illuminate\Http\Response;

class PageController extends Controller
{
    public function project(string $slug): Response
    {
        $html = PublicRenderer::projectPage($slug);
        abort_unless($html, 404);

        return response($html);
    }

    public function service(string $slug): Response
    {
        $html = PublicRenderer::servicePage($slug);
        abort_unless($html, 404);

        return response($html);
    }

    public function caseStudy(string $slug): Response
    {
        $html = PublicRenderer::caseStudyPage($slug);
        abort_unless($html, 404);

        return response($html);
    }
}
