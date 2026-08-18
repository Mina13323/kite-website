<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use App\Support\Website\CmsStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\View\View;

class ContentController extends Controller
{
    public function dashboard(): View
    {
        return view('studio.dashboard', ['stats' => CmsStore::stats()]);
    }

    public function homepage(): View
    {
        $data = CmsStore::read();
        return view('studio.homepage', compact('data'));
    }

    public function saveHomepage(Request $request): RedirectResponse
    {
        $fields = $request->validate([
            'hero_headline' => ['nullable', 'string', 'max:300'], 'hero_supporting' => ['nullable', 'string', 'max:3000'],
            'hero_cta_label' => ['nullable', 'string', 'max:100'], 'hero_cta_url' => ['nullable', 'string', 'max:500'],
            'hero_secondary_cta_label' => ['nullable', 'string', 'max:100'], 'hero_secondary_cta_url' => ['nullable', 'string', 'max:500'],
            'svc_title' => ['nullable', 'string', 'max:200'], 'svc_statement' => ['nullable', 'string', 'max:500'], 'svc_supporting' => ['nullable', 'string', 'max:3000'],
            'about_title' => ['nullable', 'string', 'max:200'], 'about_main' => ['nullable', 'string', 'max:500'], 'about_description' => ['nullable', 'string', 'max:8000'],
            'about_mission' => ['nullable', 'string', 'max:8000'], 'about_vision' => ['nullable', 'string', 'max:8000'], 'about_how' => ['nullable', 'string', 'max:8000'],
            'cta_headline' => ['nullable', 'string', 'max:300'], 'cta_supporting' => ['nullable', 'string', 'max:1000'], 'cta_label' => ['nullable', 'string', 'max:100'], 'cta_url' => ['nullable', 'string', 'max:500'],
            'featured_project_slugs' => ['array'], 'featured_project_slugs.*' => ['string'],
            'featured_case_study_slugs' => ['array'], 'featured_case_study_slugs.*' => ['string'],
            'featured_client_slugs' => ['array'], 'featured_client_slugs.*' => ['string'],
        ]);
        CmsStore::update(function (&$data) use ($fields) {
            $home = $data['homepage'] ?? [];
            $home['hero'] = array_merge($home['hero'] ?? [], $this->map($fields, ['headline' => 'hero_headline', 'supporting' => 'hero_supporting', 'cta_label' => 'hero_cta_label', 'cta_url' => 'hero_cta_url', 'secondary_cta_label' => 'hero_secondary_cta_label', 'secondary_cta_url' => 'hero_secondary_cta_url']));
            $home['services_intro'] = array_merge($home['services_intro'] ?? [], $this->map($fields, ['title' => 'svc_title', 'statement' => 'svc_statement', 'supporting' => 'svc_supporting']));
            $home['about'] = array_merge($home['about'] ?? [], $this->map($fields, ['title' => 'about_title', 'main_statement' => 'about_main', 'description' => 'about_description', 'mission' => 'about_mission', 'vision' => 'about_vision', 'how_we_work' => 'about_how']));
            $home['cta'] = array_merge($home['cta'] ?? [], $this->map($fields, ['headline' => 'cta_headline', 'supporting' => 'cta_supporting', 'cta_label' => 'cta_label', 'cta_url' => 'cta_url']));
            foreach (['featured_project_slugs', 'featured_case_study_slugs', 'featured_client_slugs'] as $key) $home[$key] = array_values($fields[$key] ?? []);
            $data['homepage'] = $home;
        });
        return back()->with('status', 'Homepage saved.');
    }

    public function projects(): View
    {
        return view('studio.projects.index', ['projects' => CmsStore::read()['projects'] ?? []]);
    }

    public function project(?string $slug = null): View
    {
        $data = CmsStore::read();
        $project = $slug ? collect($data['projects'] ?? [])->firstWhere('slug', $slug) : [];
        abort_if($slug && ! $project, 404);
        return view('studio.projects.form', compact('data', 'project'));
    }

    public function saveProject(Request $request, ?string $slug = null): RedirectResponse
    {
        $f = $request->validate([
            'title' => ['required', 'string', 'max:255'], 'slug' => ['nullable', 'string', 'max:100'], 'client' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'string', 'max:20'], 'industry' => ['nullable', 'string', 'max:100'], 'status' => ['required', 'in:draft,published,archived'],
            'short_description' => ['nullable', 'string', 'max:3000'], 'full_description' => ['nullable', 'string', 'max:20000'], 'services' => ['array'], 'services.*' => ['string'],
            'external_url' => ['nullable', 'url', 'max:1000'], 'cover_image' => ['nullable', 'string', 'max:1000'], 'hero_image' => ['nullable', 'string', 'max:1000'],
            'cover_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'], 'hero_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'seo_title' => ['nullable', 'string', 'max:255'], 'seo_description' => ['nullable', 'string', 'max:2000'],
            'challenge' => ['nullable', 'string', 'max:12000'], 'approach' => ['nullable', 'string', 'max:12000'], 'solution' => ['nullable', 'string', 'max:12000'], 'results' => ['nullable', 'string', 'max:12000'],
            'gallery' => ['nullable', 'string', 'max:30000'], 'sections' => ['nullable', 'json', 'max:100000'], 'anim_theme' => ['nullable', 'in:default,cinematic,editorial,minimal'], 'anim_intensity' => ['nullable', 'in:low,medium,high'],
        ]);
        $savedSlug = CmsStore::update(function (&$data) use ($request, $f, $slug) {
            $items = &$data['projects'];
            $index = $slug === null ? false : $this->indexOf($items, $slug);
            abort_if($slug !== null && $index === false, 404);
            $current = $index === false ? [] : $items[$index];
            $id = $current['id'] ?? ($current['slug'] ?? null);
            $newSlug = CmsStore::uniqueSlug($items, $f['slug'] ?? $f['title'], $id);
            $serviceNames = collect($data['services'] ?? [])->pluck('name', 'slug');
            $project = array_merge([
                'id' => $newSlug, 'sort_order' => count($items) + 1, 'blocks' => [], 'gallery' => [], 'sections' => [], 'featured' => false,
            ], $current, $f, [
                'slug' => $newSlug, 'featured' => $request->boolean('featured'), 'services' => array_values($f['services'] ?? []),
                'service_labels' => collect($f['services'] ?? [])->map(fn ($s) => $serviceNames[$s] ?? $s)->values()->all(),
                'cover_image' => $this->uploadedUrl($request->file('cover_file')) ?? ($request->boolean('cover_clear') ? null : ($f['cover_image'] ?? null)),
                'hero_image' => $this->uploadedUrl($request->file('hero_file')) ?? ($request->boolean('hero_clear') ? null : ($f['hero_image'] ?? null)),
                'gallery' => collect(preg_split('/\R/', $f['gallery'] ?? ''))->map(fn ($url) => trim($url))->filter()->map(fn ($url) => ['id' => bin2hex(random_bytes(4)), 'url' => $url])->values()->all(),
                'sections' => $this->sections($f['sections'] ?? '[]'),
                'animation' => ['theme' => $f['anim_theme'] ?? 'default', 'intensity' => $f['anim_intensity'] ?? 'medium', 'respect_reduced_motion' => true],
                'manually_edited' => true, 'updated_at' => now()->toIso8601String(),
            ]);
            if ($project['status'] === 'published' && empty($project['published_at'])) $project['published_at'] = now()->toIso8601String();
            if ($index === false) $items[] = $project; else $items[$index] = $project;
            return $newSlug;
        });
        return redirect("/studio/projects/{$savedSlug}")->with('status', 'Project saved.');
    }

    public function deleteProject(string $slug): RedirectResponse
    {
        $this->remove('projects', $slug);
        return redirect('/studio/projects')->with('status', 'Project deleted.');
    }

    public function services(): View
    {
        return view('studio.services.index', ['services' => CmsStore::read()['services'] ?? []]);
    }

    public function reorderServices(Request $request): RedirectResponse
    {
        CmsStore::update(function (&$data) use ($request) { foreach ($data['services'] ?? [] as &$service) $service['sort_order'] = (int) $request->input('sort_'.$service['slug'], $service['sort_order'] ?? 0); });
        return back()->with('status', 'Service order saved.');
    }

    public function service(?string $slug = null): View
    {
        $data = CmsStore::read(); $service = $slug ? collect($data['services'] ?? [])->firstWhere('slug', $slug) : [];
        abort_if($slug && ! $service, 404);
        return view('studio.services.form', compact('data', 'service'));
    }

    public function saveService(Request $request, ?string $slug = null): RedirectResponse
    {
        $f = $request->validate([
            'name' => ['required', 'string', 'max:255'], 'slug' => ['nullable', 'string', 'max:100'], 'statement' => ['nullable', 'string', 'max:500'], 'status' => ['required', 'in:draft,published,archived'],
            'short_description' => ['nullable', 'string', 'max:3000'], 'description' => ['nullable', 'string', 'max:20000'], 'capabilities' => ['nullable', 'string', 'max:10000'], 'horizon_tags' => ['nullable', 'string', 'max:5000'],
            'cover_image' => ['nullable', 'string', 'max:1000'], 'cover_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'seo_title' => ['nullable', 'string', 'max:255'], 'seo_description' => ['nullable', 'string', 'max:2000'], 'featured_project_slugs' => ['array'], 'featured_project_slugs.*' => ['string'],
        ]);
        $savedSlug = CmsStore::update(function (&$data) use ($request, $f, $slug) {
            $items = &$data['services']; $index = $slug === null ? false : $this->indexOf($items, $slug); abort_if($slug !== null && $index === false, 404);
            $current = $index === false ? [] : $items[$index]; $newSlug = CmsStore::uniqueSlug($items, $f['slug'] ?? $f['name'], $current['id'] ?? ($current['slug'] ?? null));
            $item = array_merge(['id' => $newSlug, 'sort_order' => count($items) + 1, 'images' => []], $current, $f, [
                'slug' => $newSlug, 'capabilities' => $this->lines($f['capabilities'] ?? ''), 'horizon_tags' => $this->lines($f['horizon_tags'] ?? ''),
                'featured_project_slugs' => array_values($f['featured_project_slugs'] ?? []), 'featured' => $request->boolean('featured'),
                'cover_image' => $this->uploadedUrl($request->file('cover_file')) ?? ($request->boolean('cover_clear') ? null : ($f['cover_image'] ?? null)),
            ]);
            if ($index === false) $items[] = $item; else $items[$index] = $item; return $newSlug;
        });
        return redirect("/studio/services/{$savedSlug}")->with('status', 'Service saved.');
    }

    public function clients(): View
    {
        return view('studio.clients.index', ['clients' => CmsStore::read()['clients'] ?? []]);
    }

    public function client(?string $slug = null): View
    {
        $data = CmsStore::read(); $client = $slug ? collect($data['clients'] ?? [])->firstWhere('slug', $slug) : [];
        abort_if($slug && ! $client, 404); return view('studio.clients.form', compact('data', 'client'));
    }

    public function saveClient(Request $request, ?string $slug = null): RedirectResponse
    {
        $f = $request->validate([
            'name' => ['required', 'string', 'max:255'], 'slug' => ['nullable', 'string', 'max:100'], 'logo' => ['nullable', 'string', 'max:1000'], 'logo_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'website_url' => ['nullable', 'url', 'max:1000'], 'industry' => ['nullable', 'string', 'max:100'], 'status' => ['required', 'in:draft,published,archived'], 'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
        $savedSlug = CmsStore::update(function (&$data) use ($request, $f, $slug) {
            $items = &$data['clients']; $index = $slug === null ? false : $this->indexOf($items, $slug); abort_if($slug !== null && $index === false, 404);
            $current = $index === false ? [] : $items[$index]; $newSlug = CmsStore::uniqueSlug($items, $f['slug'] ?? $f['name'], $current['id'] ?? ($current['slug'] ?? null));
            $item = array_merge(['id' => $newSlug, 'sort_order' => count($items) + 1], $current, $f, ['slug' => $newSlug, 'logo' => $this->uploadedUrl($request->file('logo_file')) ?? ($request->boolean('logo_clear') ? null : ($f['logo'] ?? null))]);
            if ($index === false) $items[] = $item; else $items[$index] = $item; return $newSlug;
        });
        return redirect("/studio/clients/{$savedSlug}")->with('status', 'Client saved.');
    }

    public function deleteClient(string $slug): RedirectResponse
    {
        $this->remove('clients', $slug); return redirect('/studio/clients')->with('status', 'Client deleted.');
    }

    public function media(): View
    {
        $data = CmsStore::read(); return view('studio.media', compact('data'));
    }

    public function uploadMedia(Request $request): RedirectResponse
    {
        $request->validate(['image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192']]);
        $file = $request->file('image'); $url = $this->uploadedUrl($file);
        CmsStore::update(function (&$data) use ($file, $url) {
            array_unshift($data['media'], ['id' => bin2hex(random_bytes(6)), 'filename' => $file->getClientOriginalName(), 'url' => $url, 'mime' => $file->getMimeType(), 'size' => $file->getSize(), 'kind' => 'image', 'created_at' => now()->toIso8601String()]);
        });
        return back()->with('status', 'Image uploaded.');
    }

    public function deleteMedia(string $id): RedirectResponse
    {
        CmsStore::update(function (&$data) use ($id) {
            // Keep the physical file: a project or service may still reference its URL.
            $data['media'] = array_values(array_filter($data['media'] ?? [], fn ($m) => ($m['id'] ?? '') !== $id));
        });
        return redirect('/studio/media')->with('status', 'Media removed.');
    }

    public function contact(): View
    {
        return view('studio.contact', ['data' => CmsStore::read()]);
    }

    public function saveContact(Request $request): RedirectResponse
    {
        $f = $request->validate(array_fill_keys(['company_name','tagline','phone','website','email','address','behance','instagram','facebook','linkedin','whatsapp','story','mission','vision'], ['nullable', 'string', 'max:12000']));
        CmsStore::update(function (&$data) use ($f) {
            $data['settings'] = array_merge($data['settings'] ?? [], $this->map($f, array_combine(['company_name','tagline','phone','website','email','address'], ['company_name','tagline','phone','website','email','address'])));
            $socials = []; foreach (['behance','instagram','facebook','linkedin','whatsapp'] as $key) $socials[$key] = $f[$key] ?? '';
            $data['settings']['socials'] = array_merge($data['settings']['socials'] ?? [], $socials);
            $data['company'] = array_merge($data['company'] ?? [], $this->map($f, ['story' => 'story', 'mission' => 'mission', 'vision' => 'vision']));
        });
        return back()->with('status', 'Contact and company details saved.');
    }

    private function uploadedUrl(?UploadedFile $file): ?string
    {
        if (! $file) return null;
        $directory = public_path('uploads/website'); if (! is_dir($directory)) mkdir($directory, 0755, true);
        $base = CmsStore::slugify(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $name = time().'-'.bin2hex(random_bytes(4)).'-'.$base.'.'.strtolower($file->getClientOriginalExtension());
        $file->move($directory, $name); return '/uploads/website/'.$name;
    }

    private function indexOf(array $items, string $slug): int|false
    { foreach ($items as $i => $item) if (($item['slug'] ?? '') === $slug) return $i; return false; }
    private function remove(string $list, string $slug): void
    { CmsStore::update(function (&$data) use ($list, $slug) { $data[$list] = array_values(array_filter($data[$list] ?? [], fn ($item) => ($item['slug'] ?? '') !== $slug)); }); }
    private function lines(string $value): array
    { return array_values(array_filter(array_map('trim', preg_split('/\R/', $value)))); }
    private function map(array $source, array $map): array
    { $out = []; foreach ($map as $to => $from) $out[$to] = $source[$from] ?? ''; return $out; }
    private function sections(string $json): array
    {
        $sections = json_decode($json, true); if (! is_array($sections)) return [];
        $types = ['hero','text','story','full_image','full_visual','image_text','two_image','three_grid','gallery','before_after','video','quote','info','website_preview','cta','related'];
        $presets = ['fade-up','fade-left','fade-right','scale-in','image-wipe','image-clip','image-parallax','text-stagger','text-highlight','horizontal-gallery','pin-scale','none'];
        return collect($sections)->take(40)->map(fn ($s) => ['id' => substr((string) ($s['id'] ?? uniqid('sec-')), 0, 40), 'type' => in_array($s['type'] ?? '', $types, true) ? $s['type'] : 'text', 'heading' => substr((string) ($s['heading'] ?? ''), 0, 200), 'text' => substr((string) ($s['text'] ?? ''), 0, 8000), 'media' => collect($s['media'] ?? [])->map('strval')->filter()->take(12)->values()->all(), 'video_url' => substr((string) ($s['video_url'] ?? ''), 0, 400), 'animation' => array_merge($s['animation'] ?? [], ['preset' => in_array($s['animation']['preset'] ?? '', $presets, true) ? $s['animation']['preset'] : 'fade-up'])])->all();
    }
}
