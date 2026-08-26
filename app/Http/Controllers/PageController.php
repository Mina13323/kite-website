<?php

namespace App\Http\Controllers;

use App\Support\SiteData;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PageController extends Controller
{
    public function __construct(protected SiteData $site) {}

    public function home()
    {
        return view('pages.home', [
            'meta' => [
                'title' => $this->site->get('home.title'),
                'description' => $this->site->get('home.description'),
            ],
            'home' => $this->site->get('home'),
            'caseStudies' => $this->site->caseStudies(),
        ]);
    }

    public function services()
    {
        return view('pages.services', [
            'meta' => [
                'title' => '360 Advertising Agency | Best Advertising Agencies in Egypt',
                'description' => 'Explore MWG services: digital marketing, graphic design, web & mobile apps, BTL, content creation, social media, SEO, media buying and media production.',
            ],
            'services' => $this->site->services(),
        ]);
    }

    public function service(string $slug)
    {
        $service = $this->site->service($slug) ?? throw new NotFoundHttpException();

        return view('pages.service', [
            'meta' => [
                'title' => $service['metaTitle'],
                'description' => \Illuminate\Support\Str::limit($service['blocks'][0]['body'], 175, ''),
            ],
            'service' => $service,
        ]);
    }

    public function portfolio()
    {
        return view('pages.portfolio', [
            'meta' => [
                'title' => 'mwg advertising agency',
                'description' => 'Selected work by MWG Advertising Agency across production, digital, graphics, BTL, 3D design and web & mobile apps.',
            ],
        ]);
    }

    public function project(string $slug)
    {
        $project = $this->site->project($slug) ?? throw new NotFoundHttpException();

        return view('pages.project', [
            'meta' => [
                'title' => $project['metaTitle'] ?? $project['title'].' | MWG Advertising Agency',
                'description' => $project['excerpt'] ?? \Illuminate\Support\Str::limit($project['body'], 175, ''),
            ],
            'project' => $project,
            'related' => collect($this->site->projects())->where('slug', '!=', $slug)->take(3)->values()->all(),
        ]);
    }

    public function caseStudies()
    {
        return view('pages.case-studies', [
            'meta' => [
                'title' => 'mwg advertising agency',
                'description' => 'Case studies from MWG Advertising Agency — strategy, production and results.',
            ],
            'caseStudies' => $this->site->caseStudies(),
        ]);
    }

    public function caseStudy(string $slug)
    {
        $study = $this->site->caseStudy($slug) ?? throw new NotFoundHttpException();

        return view('pages.case-study', [
            'meta' => [
                'title' => 'mwg advertising agency',
                'description' => \Illuminate\Support\Str::limit($study['body'], 175, ''),
            ],
            'study' => $study,
        ]);
    }

    public function bigBang()
    {
        return view('pages.big-bang', [
            'meta' => [
                'title' => $this->site->get('bigBang.title'),
                'description' => 'Breakthrough campaigns by MWG — a top advertising agency in Egypt.',
            ],
            'bigBang' => $this->site->get('bigBang'),
        ]);
    }

    public function blog()
    {
        return view('pages.blog', [
            'meta' => [
                'title' => 'mwg advertising agency',
                'description' => 'THE BIG BANG LOG — insights, strategies and digital victories from MWG Advertising Agency.',
            ],
            'blog' => $this->site->get('blog'),
        ]);
    }

    public function post(string $slug)
    {
        $post = $this->site->post($slug) ?? throw new NotFoundHttpException();

        return view('pages.post', [
            'meta' => [
                'title' => $post['title'].' | MWG',
                'description' => $post['excerpt'] ?: $post['title'],
            ],
            'post' => $post,
            'related' => collect($this->site->posts())->where('slug', '!=', $slug)->take(3)->values()->all(),
        ]);
    }

    public function contact()
    {
        return view('pages.contact', [
            'meta' => [
                'title' => $this->site->get('contact.title'),
                'description' => "Hire MWG Advertising Agency — offices in Cairo, Dubai and Los Angeles. Let's talk.",
            ],
            'contact' => $this->site->get('contact'),
        ]);
    }

    /** Handles the lead form on every page. */
    public function lead(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'business' => ['required', 'string', 'max:160'],
            'mobile' => ['required', 'string', 'max:40'],
            'services' => ['required', 'array', 'min:1'],
            'services.*' => ['string', 'max:80'],
        ]);

        logger()->info('MWG lead received', $data);

        return back()->with('lead_sent', true);
    }
}
