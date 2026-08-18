<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SiteController extends Controller
{
    public function home(): Response
    {
        return $this->page('home', 'KITE Design Studio — Aim High. Fly Higher.');
    }

    public function services(): Response
    {
        return $this->page('services', 'Services · KITE Design Studio');
    }

    public function portfolio(): Response
    {
        return $this->page('portfolio', 'Portfolio · KITE Design Studio');
    }

    public function caseStudies(): Response
    {
        return $this->page('case-studies', 'Case Studies · KITE Design Studio');
    }

    public function caseStudy(string $slug): Response
    {
        return app(\App\Http\Controllers\Website\PageController::class)->caseStudy($slug);
    }

    public function project(string $slug): Response
    {
        return app(\App\Http\Controllers\Website\PageController::class)->project($slug);
    }

    public function contact(): Response
    {
        return $this->page('contact', 'Contact · KITE Design Studio');
    }

    public function view(string $name, string $title): Response
    {
        return $this->page($name, $title);
    }

    public function service(string $slug): Response
    {
        $data = require resource_path('site/content.php');
        $service = $data['services'][$slug] ?? null;
        abort_unless($service, 404);

        $paragraphs = '';
        foreach ($service['paragraphs'] as $p) {
            $paragraphs .= '<p>'.e($p).'</p>';
        }

        $html = <<<HTML
<section class="service-stage">
  <div class="service-visual"><img src="{$service['image']}" alt="{$service['title']}"></div>
  <div class="service-copy">
    <div class="num">{$service['num']}</div>
    <h1>{$service['title']}</h1>
    <h2>{$service['eyebrow']}</h2>
    {$paragraphs}
  </div>
</section>
HTML;

        return $this->wrap($html, $service['title'].' · MWG', 'is-solid');
    }

    public function fallback(string $title, string $body, string $image): Response
    {
        $html = <<<HTML
<section class="project-hero">
  <img src="{$image}" alt="">
  <div class="shade"></div>
  <div class="inner"><h1>{$title}</h1></div>
</section>
<div class="project-body"><p>{$body}</p></div>
HTML;

        return $this->wrap($html, $title.' · MWG', 'is-solid');
    }

    private function page(string $name, string $title): Response
    {
        $file = resource_path("site/pages/{$name}.html");
        abort_unless(is_file($file), 404);

        return $this->wrap((string) file_get_contents($file), $title, $name === 'home' ? '' : 'is-solid');
    }

    private function wrap(string $content, string $title, string $headerClass = ''): Response
    {
        $html = (string) file_get_contents(resource_path('site/layout.html'));
        $html = str_replace(
            ['{{title}}', '{{description}}', '{{headerClass}}', '{{bodyClass}}', '{{extraHead}}', '{{extraScript}}', '{{content}}', '{{footerTag}}', '{{footerWeb}}', '{{footerPhone}}', '{{footerSocials}}'],
            [$title, 'KITE Design Studio', $headerClass, '', '', '', $content, 'Aim high. Fly higher.', 'www.kiteagency-eg.com', '+20 127 551 0701', ''],
            $html
        );

        return response($html);
    }
}
