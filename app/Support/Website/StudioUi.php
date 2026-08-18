<?php

namespace App\Support\Website;

/**
 * Hostinger-safe Studio HTML renderer.
 *
 * Studio pages deliberately do not use Blade so they continue to work when
 * resources/views or storage/framework/views are absent or not writable.
 */
class StudioUi
{
    public static function dashboard(array $stats): string
    {
        $note = ($stats['missing_email'] ?? false) || ($stats['missing_address'] ?? false)
            ? '<p class="note">'.(($stats['missing_email'] ?? false) ? 'Email is CONTENT_REQUIRED. ' : '').(($stats['missing_address'] ?? false) ? 'Street address is CONTENT_REQUIRED.' : '').'</p>'
            : '';
        $body = '<h1>Website content</h1><p class="lede">The complete PHP editor for Hostinger. Every save writes the same CMS store used by the public website; draft and archived items stay private.</p>
        <div class="stat-grid">'
            .self::stat($stats['published_projects'] ?? 0, 'Published projects')
            .self::stat($stats['draft_projects'] ?? 0, 'Draft projects')
            .self::stat($stats['published_services'] ?? 0, 'Live services')
            .self::stat($stats['published_clients'] ?? 0, 'Live clients')
            .self::stat($stats['media'] ?? 0, 'Media files')
            .self::stat($stats['published_case_studies'] ?? 0, 'Case studies')
            .'</div>'.$note.'<div class="row-actions"><a class="btn" href="'.self::url('studio.projects.new').'">New project</a><a class="btn ghost" href="'.self::url('studio.homepage').'">Edit homepage</a><a class="btn ghost" href="'.self::url('studio.media').'">Upload media</a></div>';

        return self::layout('Dashboard', $body, 'dashboard');
    }

    public static function homepage(array $data): string
    {
        $home = $data['homepage'] ?? [];
        $hero = $home['hero'] ?? [];
        $services = $home['services_intro'] ?? [];
        $about = $home['about'] ?? [];
        $cta = $home['cta'] ?? [];
        $body = '<h1>Homepage content</h1><p class="lede">Manage the words, calls to action, and featured content. The preloader animation stays in code.</p>
        <form method="post" action="'.self::url('studio.homepage.save').'">'.self::csrf().'
        <h2>Hero</h2><div class="form-grid">'
            .self::input('Headline', 'hero_headline', $hero['headline'] ?? '', 'full')
            .self::textarea('Supporting text', 'hero_supporting', $hero['supporting'] ?? '', 'full')
            .self::input('Primary CTA', 'hero_cta_label', $hero['cta_label'] ?? '')
            .self::input('Primary URL', 'hero_cta_url', $hero['cta_url'] ?? '')
            .self::input('Secondary CTA', 'hero_secondary_cta_label', $hero['secondary_cta_label'] ?? '')
            .self::input('Secondary URL', 'hero_secondary_cta_url', $hero['secondary_cta_url'] ?? '')
            .'</div><h2>Services intro</h2><div class="form-grid">'
            .self::input('Title', 'svc_title', $services['title'] ?? '')
            .self::input('Statement', 'svc_statement', $services['statement'] ?? '')
            .self::textarea('Supporting', 'svc_supporting', $services['supporting'] ?? '', 'full')
            .'</div><h2>About</h2><div class="form-grid">'
            .self::input('Title', 'about_title', $about['title'] ?? '')
            .self::input('Main statement', 'about_main', $about['main_statement'] ?? '')
            .self::textarea('Description', 'about_description', $about['description'] ?? '', 'full')
            .self::textarea('Mission', 'about_mission', $about['mission'] ?? '', 'full')
            .self::textarea('Vision', 'about_vision', $about['vision'] ?? '', 'full')
            .self::textarea('How we work', 'about_how', $about['how_we_work'] ?? '', 'full')
            .'</div><h2>Call to action</h2><div class="form-grid">'
            .self::input('Headline', 'cta_headline', $cta['headline'] ?? '')
            .self::input('Button', 'cta_label', $cta['cta_label'] ?? '')
            .self::input('Supporting', 'cta_supporting', $cta['supporting'] ?? '', 'full')
            .self::input('Destination', 'cta_url', $cta['cta_url'] ?? '')
            .'</div>';
        $groups = [
            ['Featured projects', 'featured_project_slugs', $data['projects'] ?? [], 'title'],
            ['Featured case studies', 'featured_case_study_slugs', $data['case_studies'] ?? [], 'title'],
            ['Clients on homepage', 'featured_client_slugs', $data['clients'] ?? [], 'name'],
        ];
        foreach ($groups as [$heading, $field, $items, $label]) {
            $selected = self::oldArray($field, $home[$field] ?? []);
            $body .= '<h2>'.self::e($heading).'</h2><div class="checks">';
            if (! $items) $body .= '<p class="note">None yet.</p>';
            foreach ($items as $item) {
                $suffix = isset($item['status']) ? ' ('.self::e($item['status']).')' : '';
                $body .= self::check($field.'[]', $item['slug'] ?? '', ($item[$label] ?? '').$suffix, in_array($item['slug'] ?? '', $selected, true));
            }
            $body .= '</div>';
        }
        $body .= '<button class="btn" style="margin-top:24px" type="submit">Save homepage</button></form>';

        return self::layout('Homepage', $body, 'homepage');
    }

    public static function projectsIndex(array $projects): string
    {
        self::sort($projects);
        $rows = '';
        foreach ($projects as $project) {
            $rows .= '<tr><td>'.self::e($project['title'] ?? '').'</td><td>'.self::e($project['client'] ?? '—').'</td><td>'.self::badge($project['status'] ?? 'draft').'</td><td>'.(! empty($project['featured']) ? 'Yes' : '—').'</td><td><a class="btn ghost" href="'.self::url('studio.projects.edit', $project['slug'] ?? '').'">Edit</a></td></tr>';
        }
        if ($rows === '') $rows = '<tr><td colspan="5">No projects yet.</td></tr>';
        $body = '<h1>Projects</h1><p class="lede">Create, draft, publish, feature, and archive portfolio work.</p><p class="row-actions"><a class="btn" href="'.self::url('studio.projects.new').'">Create project</a></p><table class="table"><tr><th>Title</th><th>Client</th><th>Status</th><th>Featured</th><th></th></tr>'.$rows.'</table>';

        return self::layout('Projects', $body, 'projects');
    }

    public static function projectForm(array $data, array $project): string
    {
        $new = empty($project['slug']);
        $action = $new ? self::url('studio.projects.create') : self::url('studio.projects.update', $project['slug']);
        $body = '<h1>'.($new ? 'New project' : self::e($project['title'] ?? '')).'</h1><p class="note">Cover 1600×1200; hero 1920×1080. Draft before publishing, and never invent metrics or results.</p>
        <form method="post" action="'.$action.'" enctype="multipart/form-data">'.self::csrf().'<div class="form-grid">'
            .self::input('Title', 'title', $project['title'] ?? '', '', true)
            .self::input('Slug', 'slug', $project['slug'] ?? '', '', false, 'auto from title')
            .self::input('Client', 'client', $project['client'] ?? '')
            .self::input('Year', 'year', $project['year'] ?? '')
            .self::select('Industry', 'industry', self::options($data['industries'] ?? [], 'slug', 'name', true), $project['industry'] ?? '')
            .self::select('Status', 'status', self::simpleOptions(['draft', 'published', 'archived']), $project['status'] ?? 'draft')
            .self::textarea('Short description', 'short_description', $project['short_description'] ?? '', 'full')
            .self::textarea('Full description', 'full_description', $project['full_description'] ?? '', 'full');
        $chosenServices = self::oldArray('services', $project['services'] ?? []);
        $body .= '<label class="full">Services<div class="checks">';
        foreach ($data['services'] ?? [] as $service) $body .= self::check('services[]', $service['slug'] ?? '', $service['name'] ?? '', in_array($service['slug'] ?? '', $chosenServices, true));
        $body .= '</div></label>'.self::input('External website URL', 'external_url', $project['external_url'] ?? '', '', false, 'https://');
        $body .= '<label>Featured<div class="checks">'.self::check('featured', '1', 'Feature on homepage', self::oldBool('featured', ! empty($project['featured']))).'</div></label>';
        foreach ([['cover', 'Cover image · 1600×1200'], ['hero', 'Hero image · 1920×1080']] as [$field, $label]) {
            $current = $project[$field.'_image'] ?? '';
            $body .= '<label class="full">'.self::e($label);
            if ($current) $body .= '<div class="upload-preview"><img src="'.self::e($current).'" alt="">'.self::check($field.'_clear', '1', 'Remove current', false).'</div>';
            $body .= '<input type="hidden" name="'.$field.'_image" value="'.self::e($current).'"><input type="file" name="'.$field.'_file" accept="image/jpeg,image/png,image/webp"></label>';
        }
        $body .= self::input('SEO title', 'seo_title', $project['seo_title'] ?? '')
            .self::textarea('SEO description', 'seo_description', $project['seo_description'] ?? '', 'full')
            .self::textarea('Challenge', 'challenge', $project['challenge'] ?? '', 'full')
            .self::textarea('Approach', 'approach', $project['approach'] ?? '', 'full')
            .self::textarea('Solution', 'solution', $project['solution'] ?? '', 'full')
            .self::textarea('Results (leave empty if unknown)', 'results', $project['results'] ?? '', 'full');
        $gallery = array_map(fn ($item) => is_array($item) ? ($item['url'] ?? '') : $item, $project['gallery'] ?? []);
        $body .= self::textarea('Gallery URLs (one per line)', 'gallery', implode("\n", $gallery), 'full')
            .self::select('Page theme', 'anim_theme', self::simpleOptions(['default', 'cinematic', 'editorial', 'minimal']), $project['animation']['theme'] ?? 'default')
            .self::select('Motion intensity', 'anim_intensity', self::simpleOptions(['low', 'medium', 'high']), $project['animation']['intensity'] ?? 'medium')
            .'</div><h2>Project sections</h2><p class="note">Build structured sections with approved motion presets. No custom JavaScript is stored.</p><div id="section-builder"></div><button type="button" class="btn ghost" id="add-section">Add section</button>';
        $sections = self::oldValue('sections', json_encode($project['sections'] ?? [], JSON_UNESCAPED_SLASHES));
        $body .= '<textarea name="sections" id="sections-json" hidden>'.self::e($sections).'</textarea><div class="row-actions" style="margin-top:20px"><button class="btn" type="submit">Save project</button>';
        if (! $new && ($project['status'] ?? '') === 'published') $body .= '<a class="btn ghost" href="/project/'.rawurlencode($project['slug']).'" target="_blank">View</a>';
        $body .= '</div><script src="/assets/js/studio-builder.js?v=1"></script></form>';
        if (! $new) $body .= '<form method="post" action="'.self::url('studio.projects.delete', $project['slug']).'" style="margin-top:28px" onsubmit="return confirm(\'Delete this project?\')">'.self::csrf().'<button class="btn danger" type="submit">Delete project</button></form>';

        return self::layout($new ? 'New project' : ($project['title'] ?? 'Project'), $body, 'projects');
    }

    public static function servicesIndex(array $services): string
    {
        self::sort($services);
        $rows = '';
        foreach ($services as $service) {
            $slug = $service['slug'] ?? '';
            $rows .= '<tr><td><input type="number" min="0" name="sort_'.self::e($slug).'" value="'.(int) ($service['sort_order'] ?? 0).'" style="width:80px"></td><td>'.self::e($service['name'] ?? '').'</td><td>'.self::badge($service['status'] ?? 'draft').'</td><td><a class="btn ghost" href="'.self::url('studio.services.edit', $slug).'">Edit</a></td></tr>';
        }
        $body = '<h1>Services</h1><p class="lede">Edit service pages and control their homepage display order.</p><p><a class="btn" href="'.self::url('studio.services.new').'">Create service</a></p><form method="post" action="'.self::url('studio.services.reorder').'">'.self::csrf().'<table class="table"><tr><th>Order</th><th>Name</th><th>Status</th><th></th></tr>'.$rows.'</table><button class="btn" type="submit" style="margin-top:12px">Save order</button></form>';

        return self::layout('Services', $body, 'services');
    }

    public static function serviceForm(array $data, array $service): string
    {
        $new = empty($service['slug']);
        $action = $new ? self::url('studio.services.create') : self::url('studio.services.update', $service['slug']);
        $body = '<h1>'.($new ? 'New service' : self::e($service['name'] ?? '')).'</h1><p class="note">Recommended service image: 1600×1200 (4:3).</p><form method="post" action="'.$action.'" enctype="multipart/form-data">'.self::csrf().'<div class="form-grid">'
            .self::input('Name', 'name', $service['name'] ?? '', '', true)
            .self::input('Slug', 'slug', $service['slug'] ?? '')
            .self::input('Statement', 'statement', $service['statement'] ?? '')
            .self::select('Status', 'status', self::simpleOptions(['draft', 'published', 'archived']), $service['status'] ?? 'draft')
            .self::textarea('Short description', 'short_description', $service['short_description'] ?? '', 'full')
            .self::textarea('Full description', 'description', $service['description'] ?? '', 'full')
            .self::textarea('Capabilities (one per line)', 'capabilities', implode("\n", $service['capabilities'] ?? []), 'full')
            .self::textarea('Homepage tags (one per line)', 'horizon_tags', implode("\n", $service['horizon_tags'] ?? []), 'full');
        $cover = $service['cover_image'] ?? '';
        $body .= '<label class="full">Cover image';
        if ($cover) $body .= '<div class="upload-preview"><img src="'.self::e($cover).'" alt="">'.self::check('cover_clear', '1', 'Remove current', false).'</div>';
        $body .= '<input type="hidden" name="cover_image" value="'.self::e($cover).'"><input type="file" name="cover_file" accept="image/jpeg,image/png,image/webp"></label>'
            .self::input('SEO title', 'seo_title', $service['seo_title'] ?? '')
            .self::textarea('SEO description', 'seo_description', $service['seo_description'] ?? '', 'full');
        $selected = self::oldArray('featured_project_slugs', $service['featured_project_slugs'] ?? []);
        $body .= '<label class="full">Featured projects<div class="checks">';
        foreach ($data['projects'] ?? [] as $project) $body .= self::check('featured_project_slugs[]', $project['slug'] ?? '', $project['title'] ?? '', in_array($project['slug'] ?? '', $selected, true));
        $body .= '</div></label><label>Featured<div class="checks">'.self::check('featured', '1', 'Feature this service', self::oldBool('featured', ! empty($service['featured']))).'</div></label></div><button class="btn" style="margin-top:20px" type="submit">Save service</button></form>';

        return self::layout($new ? 'New service' : ($service['name'] ?? 'Service'), $body, 'services');
    }

    public static function clientsIndex(array $clients): string
    {
        self::sort($clients);
        $rows = '';
        foreach ($clients as $client) {
            $logo = empty($client['logo']) ? '—' : '<img class="thumb" src="'.self::e($client['logo']).'" alt="">';
            $rows .= '<tr><td>'.self::e($client['name'] ?? '').'</td><td>'.$logo.'</td><td>'.self::badge($client['status'] ?? 'draft').'</td><td><a class="btn ghost" href="'.self::url('studio.clients.edit', $client['slug'] ?? '').'">Edit</a></td></tr>';
        }
        if ($rows === '') $rows = '<tr><td colspan="4">No clients yet.</td></tr>';
        $body = '<h1>Clients / Kites</h1><p class="lede">Manage names, logos, links, and homepage availability.</p><p><a class="btn" href="'.self::url('studio.clients.new').'">Add client</a></p><table class="table"><tr><th>Name</th><th>Logo</th><th>Status</th><th></th></tr>'.$rows.'</table>';

        return self::layout('Clients / Kites', $body, 'clients');
    }

    public static function clientForm(array $data, array $client): string
    {
        $new = empty($client['slug']);
        $action = $new ? self::url('studio.clients.create') : self::url('studio.clients.update', $client['slug']);
        $body = '<h1>'.($new ? 'New client' : self::e($client['name'] ?? '')).'</h1><p class="note">Use a transparent PNG logo where possible.</p><form method="post" action="'.$action.'" enctype="multipart/form-data">'.self::csrf().'<div class="form-grid">'
            .self::input('Name', 'name', $client['name'] ?? '', '', true)
            .self::input('Slug', 'slug', $client['slug'] ?? '');
        $logo = $client['logo'] ?? '';
        $body .= '<label class="full">Logo';
        if ($logo) $body .= '<div class="upload-preview"><img src="'.self::e($logo).'" alt="">'.self::check('logo_clear', '1', 'Remove current', false).'</div>';
        $body .= '<input type="hidden" name="logo" value="'.self::e($logo).'"><input type="file" name="logo_file" accept="image/jpeg,image/png,image/webp"></label>'
            .self::input('Website URL', 'website_url', $client['website_url'] ?? '')
            .self::select('Industry', 'industry', self::options($data['industries'] ?? [], 'slug', 'name', true), $client['industry'] ?? '')
            .self::select('Status', 'status', self::simpleOptions(['draft', 'published', 'archived']), $client['status'] ?? 'draft')
            .self::input('Display order', 'sort_order', $client['sort_order'] ?? 0, '', false, '', 'number')
            .'</div><button class="btn" style="margin-top:20px" type="submit">Save client</button></form>';
        if (! $new) $body .= '<form method="post" action="'.self::url('studio.clients.delete', $client['slug']).'" style="margin-top:24px" onsubmit="return confirm(\'Remove this client?\')">'.self::csrf().'<button class="btn danger" type="submit">Remove client</button></form>';

        return self::layout($new ? 'New client' : ($client['name'] ?? 'Client'), $body, 'clients');
    }

    public static function media(array $data): string
    {
        $body = '<h1>Media library</h1><p class="lede">Upload artwork, then copy its URL into a project field. JPG, PNG, or WebP; maximum 8 MB.</p>';
        foreach ($data['image_specs'] ?? [] as $key => $spec) {
            $body .= '<div class="spec"><strong>'.self::e(str_replace('_', ' ', $key)).'</strong> — '.self::e($spec['ratio'] ?? '').' · '.self::e($spec['suggested'] ?? '').'. '.self::e($spec['notes'] ?? '').'</div>';
        }
        $body .= '<form method="post" action="'.self::url('studio.media.upload').'" enctype="multipart/form-data" style="margin:18px 0">'.self::csrf().'<label>Image file<input type="file" name="image" accept="image/jpeg,image/png,image/webp" required></label><button class="btn" type="submit" style="margin-top:12px">Upload</button></form><table class="table"><tr><th></th><th>File</th><th>URL</th><th></th></tr>';
        $rows = '';
        foreach ($data['media'] ?? [] as $media) {
            $rows .= '<tr><td><img class="thumb" src="'.self::e($media['url'] ?? '').'" alt=""></td><td>'.self::e($media['filename'] ?? '').'</td><td><code>'.self::e($media['url'] ?? '').'</code></td><td><form method="post" action="'.self::url('studio.media.delete', $media['id'] ?? '').'" onsubmit="return confirm(\'Remove this file?\')">'.self::csrf().'<button class="btn danger" type="submit">Remove</button></form></td></tr>';
        }
        $body .= $rows ?: '<tr><td colspan="4">No uploads yet.</td></tr>';
        $body .= '</table>';

        return self::layout('Media', $body, 'media');
    }

    public static function contact(array $data): string
    {
        $settings = $data['settings'] ?? [];
        $company = $data['company'] ?? [];
        $body = '<h1>Contact, footer &amp; company</h1><p class="lede">These details are used across contact, metadata, and the public footer.</p><form method="post" action="'.self::url('studio.contact.save').'">'.self::csrf().'<div class="form-grid">';
        foreach (['company_name' => 'Company name', 'tagline' => 'Tagline', 'phone' => 'Phone', 'website' => 'Website', 'email' => 'Email', 'address' => 'Address'] as $field => $label) {
            $placeholder = in_array($field, ['email', 'address'], true) ? 'CONTENT_REQUIRED if empty' : '';
            $body .= self::input($label, $field, $settings[$field] ?? '', '', false, $placeholder);
        }
        foreach (['behance' => 'Behance', 'instagram' => 'Instagram', 'facebook' => 'Facebook', 'linkedin' => 'LinkedIn', 'whatsapp' => 'WhatsApp'] as $field => $label) {
            $body .= self::input($label, $field, $settings['socials'][$field] ?? '');
        }
        foreach (['story' => 'Company story', 'mission' => 'Mission', 'vision' => 'Vision'] as $field => $label) {
            $body .= self::textarea($label, $field, $company[$field] ?? '', 'full');
        }
        $body .= '</div><button class="btn" style="margin-top:20px" type="submit">Save details</button></form>';

        return self::layout('Contact & SEO', $body, 'contact');
    }

    private static function layout(string $title, string $body, string $active): string
    {
        self::ensureDirectories();
        $links = [
            ['studio.dashboard', 'Dashboard', 'dashboard'], ['studio.homepage', 'Homepage', 'homepage'],
            ['studio.projects', 'Projects', 'projects'], ['studio.services', 'Services', 'services'],
            ['studio.clients', 'Clients / Kites', 'clients'], ['studio.media', 'Media', 'media'],
            ['studio.contact', 'Contact &amp; SEO', 'contact'],
        ];
        $nav = '';
        foreach ($links as [$route, $label, $key]) $nav .= '<a href="'.self::url($route).'" class="'.($active === $key ? 'is-on' : '').'">'.$label.'</a>';
        $nav .= '<a href="/home" target="_blank" rel="noopener">View public site</a><form method="post" action="'.self::url('studio.logout').'">'.self::csrf().'<button class="linkish" type="submit">Sign out</button></form>';

        return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>'.self::e($title).' · KITE Studio</title><link rel="icon" href="/assets/kite/preloader/logo-icon.svg"><link rel="stylesheet" href="/assets/css/studio.css?v=3"></head><body><div class="studio-shell"><aside class="studio-side"><div class="mark">kite</div><div class="sub">Website content · PHP Studio</div><nav>'.$nav.'</nav></aside><main class="studio-main">'.self::messages().$body.'</main></div></body></html>';
    }

    private static function ensureDirectories(): void
    {
        foreach ([
            storage_path('framework/views'), storage_path('framework/sessions'),
            storage_path('framework/cache/data'), storage_path('logs'),
            public_path('uploads/website'),
        ] as $directory) {
            if (! is_dir($directory)) @mkdir($directory, 0755, true);
        }
    }

    private static function messages(): string
    {
        $html = '';
        $status = session('status');
        if ($status) $html .= '<div class="flash">'.self::e($status).'</div>';
        $errors = session('errors');
        $messages = $errors && method_exists($errors, 'getBag') ? $errors->getBag('default')->all() : [];
        if ($messages) {
            $html .= '<div class="error"><strong>Please fix the following:</strong><ul>';
            foreach ($messages as $error) $html .= '<li>'.self::e($error).'</li>';
            $html .= '</ul></div>';
        }
        return $html;
    }

    private static function stat(int $number, string $label): string
    { return '<div class="stat"><strong>'.$number.'</strong><span>'.self::e($label).'</span></div>'; }

    private static function badge(string $status): string
    {
        $class = $status === 'published' ? 'pub' : ($status === 'archived' ? 'arch' : 'draft');
        return '<span class="badge '.$class.'">'.self::e($status).'</span>';
    }

    private static function input(string $label, string $name, mixed $value, string $class = '', bool $required = false, string $placeholder = '', string $type = 'text'): string
    {
        $value = self::oldValue($name, $value);
        return '<label class="'.self::e($class).'">'.self::e($label).'<input type="'.self::e($type).'" name="'.self::e($name).'" value="'.self::e($value).'"'.($required ? ' required' : '').($placeholder !== '' ? ' placeholder="'.self::e($placeholder).'"' : '').'></label>';
    }

    private static function textarea(string $label, string $name, mixed $value, string $class = ''): string
    {
        return '<label class="'.self::e($class).'">'.self::e($label).'<textarea name="'.self::e($name).'">'.self::e(self::oldValue($name, $value)).'</textarea></label>';
    }

    private static function select(string $label, string $name, array $options, mixed $selected): string
    {
        $selected = (string) self::oldValue($name, $selected);
        $html = '<label>'.self::e($label).'<select name="'.self::e($name).'">';
        foreach ($options as $value => $text) $html .= '<option value="'.self::e($value).'"'.((string) $value === $selected ? ' selected' : '').'>'.self::e($text).'</option>';
        return $html.'</select></label>';
    }

    private static function check(string $name, string $value, string $label, bool $checked): string
    { return '<label><input type="checkbox" name="'.self::e($name).'" value="'.self::e($value).'"'.($checked ? ' checked' : '').'> '.self::e($label).'</label>'; }

    private static function options(array $items, string $value, string $label, bool $blank = false): array
    {
        $out = $blank ? ['' => '—'] : [];
        foreach ($items as $item) $out[(string) ($item[$value] ?? '')] = (string) ($item[$label] ?? '');
        return $out;
    }

    private static function simpleOptions(array $values): array
    { return array_combine($values, $values); }

    private static function oldValue(string $key, mixed $default): mixed
    { return function_exists('old') ? old($key, $default) : $default; }

    private static function oldArray(string $key, array $default): array
    {
        $value = self::oldValue($key, $default);
        return is_array($value) ? $value : [$value];
    }

    private static function oldBool(string $key, bool $default): bool
    {
        $old = session()->getOldInput();
        return array_key_exists($key, $old) ? (bool) $old[$key] : $default;
    }

    private static function csrf(): string
    { return '<input type="hidden" name="_token" value="'.self::e(csrf_token()).'">'; }

    private static function url(string $name, mixed $parameter = null): string
    { return self::e($parameter === null ? route($name) : route($name, $parameter)); }

    private static function sort(array &$items): void
    { usort($items, fn ($a, $b) => ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0)); }

    private static function e(mixed $value): string
    { return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
}
