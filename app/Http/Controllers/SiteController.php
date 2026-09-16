<?php

namespace App\Http\Controllers;

use App\Support\Website\CmsStore;
use App\Support\Website\PublicRenderer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SiteController extends Controller
{
    public function home(): Response
    {
        return response(PublicRenderer::home());
    }

    public function services(): Response
    {
        return response(PublicRenderer::servicesPage());
    }

    public function service(string $slug): Response
    {
        $html = PublicRenderer::servicePage($slug);
        abort_unless($html, 404);

        return response($html);
    }

    public function portfolio(): Response
    {
        return response(PublicRenderer::portfolioPage());
    }

    public function caseStudies(): Response
    {
        return response(PublicRenderer::caseStudiesPage());
    }

    public function caseStudy(string $slug): Response
    {
        $html = PublicRenderer::caseStudyPage($slug);
        abort_unless($html, 404);

        return response($html);
    }

    public function project(string $slug): Response
    {
        $html = PublicRenderer::projectPage($slug);
        abort_unless($html, 404);

        return response($html);
    }

    public function contact(): Response
    {
        return response(PublicRenderer::contactPage());
    }

    public function submitContact(Request $request): Response
    {
        $name = trim((string) $request->input('name', ''));
        $email = trim((string) $request->input('email', ''));
        if ($name === '' || $email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response(PublicRenderer::contactPage(false, 'Please enter your name and a valid email.'));
        }

        CmsStore::appendLead($request->only(['name', 'email', 'business', 'mobile']));

        return response(PublicRenderer::contactPage(true));
    }

    public function sitemap(): Response
    {
        return response(PublicRenderer::sitemap(), 200, ['Content-Type' => 'application/xml; charset=utf-8']);
    }

    public function robots(): Response
    {
        return response(PublicRenderer::robots(), 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }

    public function favicon(): Response
    {
        $file = public_path('assets/kite/preloader/logo-icon.svg');
        abort_unless(is_file($file), 404);

        return response((string) file_get_contents($file), 200, ['Content-Type' => 'image/svg+xml']);
    }
}
