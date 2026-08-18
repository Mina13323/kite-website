<?php

namespace App\Support\Website;

/**
 * PHP port of resources/site/public-render.cjs + server.cjs layout.
 * Same CMS payload, same HTML chrome. KITE CMS only.
 */
class PublicRenderer
{
    public static function esc(?string $value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function layout(string $inner, array $meta = []): string
    {
        $data = CmsStore::read();
        $settings = $data['settings'] ?? [];
        $socials = '';
        foreach ($settings['socials'] ?? [] as $name => $url) {
            if (! $url) {
                continue;
            }
            $label = ucfirst((string) $name);
            $socials .= '<a href="'.self::esc($url).'">'.self::esc($label).'</a>';
        }
        $phone = ! empty($settings['phone'])
            ? '<a href="'.self::esc($settings['socials']['whatsapp'] ?? '#').'">'.self::esc($settings['phone']).'</a>'
            : '';
        $footerServices = '';
        foreach (CmsStore::published($data['services'] ?? []) as $service) {
            $footerServices .= '<li><a href="/services/'.self::esc($service['slug']).'">'.self::esc(strtoupper((string) $service['name'])).'</a></li>';
        }
        $origin = CmsStore::origin();
        $canonical = $meta['canonical'] ?? ($origin.($meta['path'] ?? '/'));
        $html = (string) file_get_contents(resource_path('site/layout.html'));

        return str_replace(
            [
                '{{title}}', '{{description}}', '{{canonical}}', '{{headerClass}}', '{{bodyClass}}',
                '{{extraHead}}', '{{extraScript}}', '{{footerTag}}', '{{footerWeb}}', '{{footerPhone}}',
                '{{footerSocials}}', '{{footerServices}}', '{{content}}',
            ],
            [
                $meta['title'] ?? 'KITE Design Studio',
                $meta['description'] ?? ($settings['tagline'] ?? ''),
                $canonical,
                $meta['headerClass'] ?? '',
                $meta['bodyClass'] ?? '',
                $meta['extraHead'] ?? '',
                $meta['extraScript'] ?? '',
                $settings['tagline'] ?? '',
                preg_replace('#^https?://#', '', (string) ($settings['website'] ?? '')),
                $phone,
                $socials,
                $footerServices,
                $inner,
            ],
            $html
        );
    }

    public static function emphasize(?string $headline): string
    {
        $text = (string) $headline;
        if (! str_contains(strtolower($text), 'forward')) {
            return self::esc($text);
        }

        return preg_replace('/forward\.?/i', '<em>forward.</em>', self::esc($text)) ?? self::esc($text);
    }

    public static function home(): string
    {
        $pub = CmsStore::publicPayload();
        $hero = $pub['homepage']['hero'] ?? [];
        $html = (string) file_get_contents(resource_path('site/pages/home.html'));
        $html = str_replace(
            [
                '{{heroHeadline}}', '{{heroSupporting}}', '{{heroCta}}',
                '{{heroSecondaryCta}}', '{{heroSecondaryUrl}}', '{{cmsHome}}',
            ],
            [
                self::emphasize($hero['headline'] ?? ''),
                self::esc($hero['supporting'] ?? ''),
                self::esc($hero['cta_label'] ?? 'View work'),
                self::esc($hero['secondary_cta_label'] ?? 'Start a project'),
                self::esc($hero['secondary_cta_url'] ?? '/contact-us'),
                self::homeSections($pub),
            ],
            $html
        );

        return self::layout($html, [
            'title' => ($pub['settings']['company_name'] ?? 'KITE Design Studio').' — Aim High. Fly Higher.',
            'description' => $hero['supporting'] ?? '',
            'bodyClass' => 'home-intro',
            'path' => '/',
            'extraHead' => '<link rel="stylesheet" href="/assets/css/kite-intro.css?v=kite-sky-7">',
            'extraScript' => '<script src="/assets/js/kite-intro.js?v=kite-sky-9"></script><script src="/assets/js/kite-services.js?v=kite-sky-9"></script>',
        ]);
    }

    public static function tile(array $project, string $label = ''): string
    {
        $href = '/project/'.self::esc($project['slug'] ?? '');
        $img = $project['cover_image'] ?? $project['hero_image'] ?? null;
        $cat = $label ?: (($project['service_labels'][0] ?? 'Project'));

        return '<a class="project-tile '.($img ? '' : 'has-empty').'" data-cat="'.self::esc(($project['services'][0] ?? 'other')).'" href="'.$href.'">'
            .($img ? '<img src="'.self::esc($img).'" alt="">' : '<div class="empty-visual"></div>')
            .'<div class="info"><div class="cat">'.self::esc($cat).'</div><h3>'.self::esc($project['title'] ?? '').'</h3></div></a>';
    }

    public static function workCard(array $project): string
    {
        $img = $project['cover_image'] ?? null;

        return '<a class="work-card '.($img ? '' : 'has-empty').'" href="/project/'.self::esc($project['slug'] ?? '').'">'
            .($img ? '<img src="'.self::esc($img).'" alt="">' : '<div class="empty-visual"></div>')
            .'<figcaption><span>'.self::esc($project['service_labels'][0] ?? '').'</span><strong>'.self::esc($project['title'] ?? '').'</strong></figcaption></a>';
    }

    public static function servicesHorizon(array $services, array $projects): string
    {
        $slides = '';
        $dots = '';
        foreach (array_values($services) as $i => $service) {
            $n = str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT);
            $selected = [];
            foreach ($service['featured_project_slugs'] ?? [] as $slug) {
                foreach ($projects as $project) {
                    if (($project['slug'] ?? '') === $slug) {
                        $selected[] = $project;
                    }
                }
            }
            $chips = '';
            if ($selected) {
                foreach ($selected as $project) {
                    $chips .= '<span>'.self::esc($project['title'] ?? '').'</span>';
                }
            } else {
                foreach (array_slice($service['capabilities'] ?? [], 0, 5) as $cap) {
                    $chips .= '<span>'.self::esc($cap).'</span>';
                }
            }
            $cover = $service['cover_image'] ?? null;
            $art = $cover
                ? '<figure class="svc-frame reveal-media"><img src="'.self::esc($cover).'" alt=""></figure>'
                : '<figure class="svc-frame"><div class="empty-visual"></div></figure>';
            $theme = ['is-branding', 'is-media', 'is-web', 'is-digital', 'is-marketing'][$i % 5];
            $slides .= '<article class="service-slide '.$theme.'" id="svc-'.self::esc($service['slug'] ?? '').'">'
                .'<div class="svc-art"><div class="svc-giant" aria-hidden="true">'.$n.'</div>'.$art.'</div>'
                .'<div class="service-copy"><div class="num">Service '.$n.'</div>'
                .'<h1>'.self::esc($service['name'] ?? '').'</h1>'
                .'<h2>'.self::esc($service['statement'] ?? '').'</h2>'
                .'<p>'.self::esc($service['description'] ?? $service['short_description'] ?? '').'</p>'
                .'<div class="svc-chips">'.$chips.'</div></div></article>';
            $dots .= '<button type="button" class="'.($i === 0 ? 'is-on' : '').'" data-svc-go="'.$i.'">'.$n.'</button>';
        }

        return '<section class="services-horizon" id="services"><div class="services-horizon-pin">'
            .'<div class="services-toolbar"><h2>Services</h2><div class="services-dots">'.$dots.'</div></div>'
            .'<div class="services-track">'.$slides.'</div></div></section>';
    }

    public static function homeSections(array $pub): string
    {
        $home = $pub['homepage'] ?? [];
        $projects = $pub['projects'] ?? [];
        $featured = $pub['featured_projects'] ?? [];
        $latest = array_slice($featured ?: $projects, 0, 8);
        $latestCards = $latest
            ? implode('', array_map([self::class, 'workCard'], array_merge($latest, $latest)))
            : '<p class="container" style="color:var(--muted)">Published projects will appear here.</p>';

        $caseCards = '';
        $wanted = $home['featured_case_study_slugs'] ?? [];
        $cases = [];
        foreach ($wanted as $slug) {
            foreach ($pub['case_studies'] ?? [] as $case) {
                if (($case['slug'] ?? '') === $slug) {
                    $cases[] = $case;
                }
            }
        }
        $cases = $cases ?: ($pub['case_studies'] ?? []);
        foreach (array_slice($cases, 0, 4) as $case) {
            $img = ($case['gallery'] ?? [])[0] ?? null;
            $caseCards .= '<a class="case-card '.($img ? '' : 'has-empty').'" href="/case-study/'.self::esc($case['slug'] ?? '').'">'
                .($img ? '<img src="'.self::esc($img).'" alt="">' : '<div class="empty-visual"></div>')
                .'<div class="meta"><div class="tag">'.self::esc($case['industry'] ?? 'Case Study').'</div><h3>'.self::esc($case['title'] ?? '').'</h3></div></a>';
        }
        if ($caseCards === '') {
            $caseCards = '<p style="color:var(--muted)">Case studies appear here when published.</p>';
        }

        $groups = [];
        foreach ($pub['services'] ?? [] as $service) {
            $groups[$service['slug']] = ['name' => $service['name'], 'items' => []];
        }
        $groups['other'] = ['name' => 'Other', 'items' => []];
        foreach ($projects as $project) {
            $key = $project['services'][0] ?? 'other';
            if (! isset($groups[$key])) {
                $key = 'other';
            }
            $groups[$key]['items'][] = $project;
        }
        $portfolio = '';
        foreach ($groups as $group) {
            if (! $group['items']) {
                continue;
            }
            $portfolio .= '<div class="work-group"><h3>'.self::esc($group['name']).'</h3><div class="project-grid">'
                .implode('', array_map(fn ($p) => self::tile($p, $group['name']), $group['items']))
                .'</div></div>';
        }
        if ($portfolio === '') {
            $portfolio = '<p style="color:var(--muted)">No published projects yet.</p>';
        }

        $clientSlugs = $home['featured_client_slugs'] ?? [];
        $shown = [];
        if ($clientSlugs) {
            foreach ($clientSlugs as $slug) {
                foreach ($pub['clients'] ?? [] as $client) {
                    if (($client['slug'] ?? '') === $slug) {
                        $shown[] = $client;
                    }
                }
            }
        } else {
            $shown = $pub['clients'] ?? [];
        }
        $logos = '';
        foreach ($shown as $client) {
            $mark = ! empty($client['logo'])
                ? '<img src="'.self::esc($client['logo']).'" alt="'.self::esc($client['name'] ?? '').'">'
                : self::esc($client['name'] ?? '');
            $logos .= ! empty($client['website_url'])
                ? '<a class="client-logo" href="'.self::esc($client['website_url']).'" rel="noopener">'.$mark.'</a>'
                : '<span class="client-logo">'.$mark.'</span>';
        }

        $about = $home['about'] ?? [];
        $cta = $home['cta'] ?? [];
        $company = $pub['company'] ?? [];

        return '
<section class="section" id="latest">
  <div class="container section-head"><h2>Our Latest Work</h2><a class="ghost-link" href="/portfolio">Our Portfolio</a></div>
  <div class="work-wrap"><div class="work-track">'.$latestCards.'</div></div>
</section>
<section class="section" id="about" style="padding-top:20px">
  <div class="container">
    <div class="section-head"><h2>'.self::esc($about['title'] ?? 'About Us').'</h2></div>
    <div class="about-grid">
      <div class="about-tabs from-left">
        <button class="is-on" type="button" data-panel="about-kite">About KITE</button>
        <button type="button" data-panel="about-mission">Mission</button>
        <button type="button" data-panel="about-vision">Vision</button>
      </div>
      <div class="about-copy">
        <div class="about-panel" id="about-kite">
          <h3>'.self::esc($about['main_statement'] ?? '').'</h3>
          <p>'.self::esc($about['description'] ?? '').'</p>'
          .(! empty($about['how_we_work']) ? '<div class="value"><h5>How we make it fly</h5><p>'.self::esc($about['how_we_work']).'</p></div>' : '').
        '</div>
        <div class="about-panel" id="about-mission" hidden>
          <h3>Our Mission</h3>
          <p>'.self::esc($about['mission'] ?? $company['mission'] ?? '').'</p>
        </div>
        <div class="about-panel" id="about-vision" hidden>
          <h3>Our Vision</h3>
          <p>'.self::esc($about['vision'] ?? $company['vision'] ?? '').'</p>
        </div>
      </div>
      <div class="about-visual from-right">
        <div class="empty-visual"></div>
        <img class="about-mark" src="/assets/kite/preloader/logo-icon.svg" alt="KITE">
      </div>
    </div>
  </div>
</section>
'.self::servicesHorizon($pub['services'] ?? [], $projects).'
<section class="section" id="case-studies" style="padding-top:20px">
  <div class="container section-head"><h2>Case Studies</h2></div>
  <div class="container cases">'.$caseCards.'</div>
</section>
<section class="section" id="portfolio">
  <div class="container">
    <div class="section-head"><h2>Portfolio / Our Work</h2></div>
    '.$portfolio.'
  </div>
</section>
<section class="clients" id="kites">
  <h2>Clients / Kites</h2>
  <div class="logo-track">'.$logos.$logos.'</div>
</section>
<section class="cta-band" id="cta">
  <div class="container">
    <h2>'.self::esc($cta['headline'] ?? '').'</h2>
    <p style="color:var(--muted);margin:10px 0 22px">'.self::esc($cta['supporting'] ?? '').'</p>
    <a class="btn" href="'.self::esc($cta['cta_url'] ?? '/contact-us').'">'.self::esc($cta['cta_label'] ?? 'Start a project').'</a>
  </div>
</section>';
    }

    public static function servicesPage(): string
    {
        $pub = CmsStore::publicPayload();

        return self::layout(
            '<section class="page-hero"><div class="container"><h1>'.self::esc($pub['homepage']['services_intro']['title'] ?? 'Services').'</h1><p>'.self::esc($pub['homepage']['services_intro']['supporting'] ?? '').'</p></div></section>'
            .self::servicesHorizon($pub['services'] ?? [], $pub['projects'] ?? []),
            [
                'title' => 'Services · '.($pub['settings']['company_name'] ?? 'KITE Design Studio'),
                'description' => $pub['homepage']['services_intro']['supporting'] ?? '',
                'headerClass' => 'is-solid',
                'path' => '/services',
                'extraScript' => '<script src="/assets/js/kite-services.js?v=kite-sky-7"></script>',
            ]
        );
    }

    public static function servicePage(string $slug): ?string
    {
        $service = CmsStore::serviceBySlug($slug);
        if (! $service) {
            return null;
        }
        $related = CmsStore::projectsForService($service['slug']);
        $tiles = $related
            ? implode('', array_map(fn ($p) => self::tile($p, $service['name'] ?? ''), $related))
            : '<p>No published projects for this service yet.</p>';

        return self::layout(
            '<section class="page-hero"><div class="container"><h1>'.self::esc($service['name'] ?? '').'</h1><p>'.self::esc($service['statement'] ?? '').'</p></div></section>
             <section class="section"><div class="container"><p>'.self::esc($service['description'] ?? '').'</p>
             <div class="project-grid" style="margin-top:28px">'.$tiles.'</div></div></section>',
            [
                'title' => ($service['seo_title'] ?? $service['name'] ?? 'Service').' · KITE',
                'description' => $service['seo_description'] ?? $service['description'] ?? '',
                'headerClass' => 'is-solid',
                'path' => '/services/'.($service['slug'] ?? $slug),
            ]
        );
    }

    public static function portfolioPage(): string
    {
        $pub = CmsStore::publicPayload();
        $groups = [];
        foreach ($pub['services'] ?? [] as $service) {
            $groups[$service['slug']] = ['name' => $service['name'], 'items' => []];
        }
        $groups['other'] = ['name' => 'Other', 'items' => []];
        foreach ($pub['projects'] ?? [] as $project) {
            $key = $project['services'][0] ?? 'other';
            if (! isset($groups[$key])) {
                $key = 'other';
            }
            $groups[$key]['items'][] = $project;
        }
        $body = '';
        foreach ($groups as $group) {
            if (! $group['items']) {
                continue;
            }
            $body .= '<div class="work-group"><h3>'.self::esc($group['name']).'</h3><div class="project-grid">'
                .implode('', array_map(fn ($p) => self::tile($p, $group['name']), $group['items']))
                .'</div></div>';
        }

        return self::layout(
            '<section class="page-hero"><div class="container"><h1>Portfolio</h1><p>Published KITE work, grouped by service.</p></div></section>
            <section class="section"><div class="container">'.($body ?: '<p>No published projects yet.</p>').'</div></section>',
            [
                'title' => 'Portfolio · '.($pub['settings']['company_name'] ?? 'KITE Design Studio'),
                'headerClass' => 'is-solid',
                'path' => '/portfolio',
            ]
        );
    }

    public static function caseStudiesPage(): string
    {
        $pub = CmsStore::publicPayload();
        $cards = '';
        foreach ($pub['case_studies'] ?? [] as $case) {
            $cards .= '<a class="case-card has-empty" href="/case-study/'.self::esc($case['slug'] ?? '').'"><div class="empty-visual"></div><div class="meta"><div class="tag">Case Study</div><h3>'.self::esc($case['title'] ?? '').'</h3></div></a>';
        }

        return self::layout(
            '<section class="page-hero"><div class="container"><h1>Case Studies</h1><p>Deeper looks at selected work.</p></div></section><section class="section"><div class="container cases">'.($cards ?: '<p>No published case studies yet.</p>').'</div></section>',
            [
                'title' => 'Case Studies · '.($pub['settings']['company_name'] ?? 'KITE Design Studio'),
                'headerClass' => 'is-solid',
                'path' => '/case-studies',
            ]
        );
    }

    public static function casePage(array $case): string
    {
        $parts = '';
        foreach ([['Introduction', $case['introduction'] ?? null], ['Challenge', $case['challenge'] ?? null], ['Approach', $case['approach'] ?? null], ['Solution', $case['solution'] ?? null], ['Results', $case['results'] ?? null]] as [$h, $t]) {
            if (! $t) {
                continue;
            }
            $parts .= '<h3>'.self::esc($h).'</h3><p>'.self::esc($t).'</p>';
        }
        $preview = ! empty($case['website_url']) ? self::websitePreview($case['website_url']) : '';

        return '<section class="project-hero"><div class="inner"><div class="cat">Case Study</div><h1>'.self::esc($case['title'] ?? '').'</h1></div></section><div class="project-body">'.$parts.$preview.'</div>';
    }

    public static function caseStudyPage(string $slug): ?string
    {
        $case = CmsStore::caseBySlug($slug);
        if (! $case) {
            return null;
        }

        return self::layout(self::casePage($case), [
            'title' => ($case['title'] ?? 'Case Study').' · Case Study',
            'headerClass' => 'is-solid',
            'path' => '/case-study/'.$slug,
        ]);
    }

    public static function projectPageHtml(array $project, array $related = []): string
    {
        $theme = in_array($project['animation']['theme'] ?? '', ['default', 'cinematic', 'editorial', 'minimal'], true)
            ? $project['animation']['theme']
            : 'default';
        $sections = ! empty($project['sections']) && is_array($project['sections'])
            ? $project['sections']
            : self::fallbackSections($project);
        $nav = '';
        if ($related) {
            $links = '';
            foreach (array_slice($related, 0, 2) as $i => $item) {
                $links .= '<a class="ghost-link" href="/project/'.self::esc($item['slug'] ?? '').'">'.($i === 0 ? 'Previous' : 'Next').' · '.self::esc($item['title'] ?? '').'</a>';
            }
            $nav = '<nav class="kite-sec" style="padding-top:20px"><div class="wrap" style="display:flex;gap:18px;flex-wrap:wrap">'.$links.'</div></nav>';
        }

        $html = '';
        foreach ($sections as $section) {
            $html .= self::renderSection($section, $project, $related);
        }

        return '<article class="kite-project theme-'.self::esc($theme).'">'.$html.$nav.'</article>';
    }

    public static function projectPage(string $slug, bool $preview = false): ?string
    {
        $project = CmsStore::projectBySlug($slug, $preview);
        if (! $project) {
            return null;
        }
        $list = CmsStore::publicPayload()['projects'];
        $related = [];
        foreach ($list as $i => $item) {
            if (($item['slug'] ?? '') === $project['slug']) {
                if ($i > 0) {
                    $related[] = $list[$i - 1];
                }
                if (isset($list[$i + 1])) {
                    $related[] = $list[$i + 1];
                }
            }
        }

        return self::layout(self::projectPageHtml($project, $related), [
            'title' => $preview
                ? 'Preview · '.($project['title'] ?? '')
                : (($project['seo_title'] ?? null) ?: (($project['title'] ?? 'Project').' · KITE')),
            'description' => $project['seo_description'] ?? $project['short_description'] ?? '',
            'headerClass' => 'is-solid',
            'path' => '/project/'.($project['slug'] ?? $slug),
            'extraHead' => '<link rel="stylesheet" href="/assets/css/kite-project.css?v=1">',
            'extraScript' => '<script src="/assets/js/kite-presets.js?v=1"></script>',
        ]);
    }

    public static function contactPage(bool $success = false, string $error = ''): string
    {
        $settings = CmsStore::read()['settings'] ?? [];
        $note = $success
            ? '<p class="form-note" style="display:block">Thank you. Our team will get in touch shortly.</p>'
            : ($error !== '' ? '<p class="form-note" style="display:block;color:#c0392b">'.self::esc($error).'</p>' : '');
        $socials = '';
        foreach ($settings['socials'] ?? [] as $name => $url) {
            if ($url) {
                $socials .= '<p><a href="'.self::esc($url).'">'.self::esc($name).'</a></p>';
            }
        }

        $inner = '<section class="page-hero"><div class="container"><h1>Let\'s work together</h1><p>Tell us about the brand and the brief.</p></div></section>
    <section class="section"><div class="container">
      <div class="offices" style="grid-template-columns:1fr 1fr">
        <article class="office">
          <h4>Talk to KITE</h4>'
          .(! empty($settings['phone']) ? '<p><a href="'.self::esc($settings['socials']['whatsapp'] ?? '#').'">'.self::esc($settings['phone']).'</a></p>' : '')
          .(! empty($settings['email']) ? '<p>'.self::esc($settings['email']).'</p>' : '')
          .(! empty($settings['address']) ? '<p>'.self::esc($settings['address']).'</p>' : '')
          .'<p>'.self::esc(preg_replace('#^https?://#', '', (string) ($settings['website'] ?? ''))).'</p>
        </article>
        <article class="office"><h4>Follow</h4>'.$socials.'</article>
      </div>
      <div class="contact-box" style="max-width:720px;margin-top:36px">
        <h2>Start a project</h2>
        <form class="form" data-lead method="post" action="/contact-us">
          <input name="name" placeholder="Name *" required>
          <input type="email" name="email" placeholder="Email *" required>
          <input name="business" placeholder="Type of business *">
          <input name="mobile" placeholder="Mobile no. *">
          <div class="full"><button class="btn" type="submit">Start a project</button></div>
          '.$note.'
        </form>
      </div>
    </div></section>';

        return self::layout($inner, [
            'title' => 'Contact · '.($settings['company_name'] ?? 'KITE Design Studio'),
            'headerClass' => 'is-solid',
            'path' => '/contact-us',
        ]);
    }

    public static function notFound(string $message = 'Page not found'): string
    {
        return self::layout(
            '<section class="page-hero"><div class="container"><h1>'.self::esc($message).'</h1><p><a class="ghost-link" href="/home">Back home</a></p></div></section>',
            ['title' => 'Not found', 'headerClass' => 'is-solid']
        );
    }

    public static function sitemap(): string
    {
        $origin = CmsStore::origin();
        $pub = CmsStore::publicPayload();
        $urls = ['/', '/home', '/services', '/portfolio', '/case-studies', '/contact-us'];
        foreach ($pub['services'] as $service) {
            $urls[] = '/services/'.$service['slug'];
        }
        foreach ($pub['projects'] as $project) {
            $urls[] = '/project/'.$project['slug'];
        }
        foreach ($pub['case_studies'] as $case) {
            $urls[] = '/case-study/'.$case['slug'];
        }
        $body = '';
        foreach ($urls as $url) {
            $body .= '  <url><loc>'.$origin.$url.'</loc></url>'."\n";
        }

        return '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
            .$body
            .'</urlset>'."\n";
    }

    public static function robots(): string
    {
        return "User-agent: *\nAllow: /\nDisallow: /studio\nDisallow: /studio/\nSitemap: https://www.kiteagency-eg.com/sitemap.xml\n";
    }

    private static function websitePreview(string $url): string
    {
        return '<div class="section" style="padding-top:12px"><h3>Website preview</h3>'
            .'<p style="margin:10px 0 16px"><a class="btn" href="'.self::esc($url).'" target="_blank" rel="noopener">Open website</a></p>'
            .'<iframe src="'.self::esc($url).'" title="Website preview" style="width:100%;height:520px;border:1px solid rgba(17,17,17,.12);background:#fff" sandbox="allow-scripts allow-same-origin"></iframe>'
            .'<p class="note" style="margin-top:8px;color:var(--muted);font-size:13px">If the site blocks embedding, use Open website.</p></div>';
    }

    private static function animAttrs(array $section): string
    {
        $cfg = self::sanitizeAnimation($section['animation'] ?? []);

        return 'data-kite-anim="'.self::esc($cfg['preset']).'" data-kite-config=\''.self::esc(json_encode($cfg)).'\'';
    }

    private static function sanitizeAnimation(array $raw): array
    {
        $presets = ['none', 'fade-up', 'fade-left', 'fade-right', 'scale-in', 'image-wipe', 'image-clip', 'image-parallax', 'text-stagger', 'text-highlight', 'horizontal-gallery', 'pin-scale'];
        $eases = ['none', 'power2.out', 'power3.out', 'expo.out', 'sine.out'];
        $starts = ['top 90%', 'top 80%', 'top 70%', 'top 50%', 'top bottom'];
        $ends = ['top 20%', 'center center', 'bottom top', 'bottom center'];
        $dirs = ['up', 'down', 'left', 'right'];

        return [
            'preset' => in_array($raw['preset'] ?? '', $presets, true) ? $raw['preset'] : 'fade-up',
            'start' => in_array($raw['start'] ?? '', $starts, true) ? $raw['start'] : 'top 80%',
            'end' => in_array($raw['end'] ?? '', $ends, true) ? $raw['end'] : 'bottom top',
            'scrub' => ! empty($raw['scrub']) && $raw['scrub'] !== '0',
            'intensity' => self::clamp($raw['intensity'] ?? 0.35, 0.1, 1, 0.35),
            'duration' => self::clamp($raw['duration'] ?? 1, 0.2, 2.5, 1),
            'delay' => self::clamp($raw['delay'] ?? 0, 0, 1.5, 0),
            'ease' => in_array($raw['ease'] ?? '', $eases, true) ? $raw['ease'] : 'power3.out',
            'direction' => in_array($raw['direction'] ?? '', $dirs, true) ? $raw['direction'] : 'up',
        ];
    }

    private static function clamp(mixed $n, float $min, float $max, float $fallback): float
    {
        if (! is_numeric($n)) {
            return $fallback;
        }
        $x = (float) $n;

        return min($max, max($min, $x));
    }

    private static function img(?string $src, string $cls = ''): string
    {
        return $src ? '<div class="kite-media '.$cls.'"><img src="'.self::esc($src).'" alt=""></div>' : '';
    }

    private static function renderSection(array $section, array $project, array $related): string
    {
        $media = array_values(array_filter($section['media'] ?? []));
        $type = $section['type'] ?? 'text';
        $heading = ! empty($section['heading']) ? '<h2 data-stagger>'.self::esc($section['heading']).'</h2>' : '';
        $text = ! empty($section['text']) ? '<p data-stagger>'.self::esc($section['text']).'</p>' : '';
        $inner = '';
        switch ($type) {
            case 'hero':
                $inner = '<div class="wrap"><div class="kicker">'.self::esc(implode(' · ', $project['service_labels'] ?? [])).'</div>'
                    .'<h1 data-stagger>'.self::esc($section['heading'] ?? $project['title'] ?? '').'</h1>'.$text.'</div>'
                    .self::img($media[0] ?? $project['hero_image'] ?? $project['cover_image'] ?? null);
                break;
            case 'full_image':
            case 'full_visual':
                $inner = self::img($media[0] ?? null);
                break;
            case 'image_text':
                $inner = '<div class="wrap kite-split">'.self::img($media[0] ?? null).'<div>'.$heading.$text.'</div></div>';
                break;
            case 'two_image':
            case 'before_after':
                $inner = '<div class="wrap kite-split">'.self::img($media[0] ?? null).self::img($media[1] ?? null).'</div>';
                break;
            case 'three_grid':
                $inner = '<div class="wrap kite-grid-3">'.self::img($media[0] ?? null).self::img($media[1] ?? null).self::img($media[2] ?? null).'</div>';
                break;
            case 'gallery':
                $imgs = '';
                foreach ($media as $src) {
                    $imgs .= '<img src="'.self::esc($src).'" alt="">';
                }
                $inner = '<div class="kite-h-gallery" data-h-track-wrap><div class="kite-h-track" data-h-track>'.$imgs.'</div></div>';
                break;
            case 'video':
                $inner = '<div class="wrap">'.$heading.(! empty($section['video_url']) ? '<p><a class="btn ghost" href="'.self::esc($section['video_url']).'">Watch video</a></p>' : '').$text.'</div>';
                break;
            case 'quote':
                $inner = '<div class="wrap"><blockquote class="kite-quote" data-stagger>'.self::esc($section['text'] ?? '').'</blockquote></div>';
                break;
            case 'info':
                $inner = '<div class="wrap">'.$heading.'<p>'.self::esc($project['short_description'] ?? $section['text'] ?? '').'</p>'
                    .(! empty($project['year']) ? '<p>Year: '.self::esc($project['year']).'</p>' : '')
                    .(! empty($project['client']) ? '<p>Client: '.self::esc($project['client']).'</p>' : '').'</div>';
                break;
            case 'website_preview':
                $inner = '<div class="wrap kite-preview" data-pin-frame><h2>Website</h2>'
                    .(! empty($project['external_url'])
                        ? '<p style="margin:12px 0 18px"><a class="btn" href="'.self::esc($project['external_url']).'" target="_blank" rel="noopener">Open website</a></p><iframe src="'.self::esc($project['external_url']).'" title="Website preview" sandbox="allow-scripts allow-same-origin"></iframe><p style="margin-top:8px;color:var(--muted);font-size:13px">If embedding is blocked, use Open website.</p>'
                        : '<p>No website URL yet.</p>').'</div>';
                break;
            case 'cta':
                $inner = '<div class="wrap"><h2 data-stagger>'.self::esc($section['heading'] ?? 'Let’s work together').'</h2>'.$text
                    .'<p style="margin-top:18px"><a class="btn" href="/contact-us">Start a project</a></p></div>';
                break;
            case 'related':
                $inner = '<div class="wrap"><h2>More work</h2><div class="project-grid">'
                    .implode('', array_map(fn ($p) => self::tile($p, $p['service_labels'][0] ?? ''), $related))
                    .'</div></div>';
                break;
            default:
                $inner = '<div class="wrap">'.$heading.$text.'</div>';
        }

        return '<section class="kite-sec '.self::esc($type).'" '.self::animAttrs($section).'>'.$inner.'</section>';
    }

    private static function fallbackSections(array $project): array
    {
        $secs = [[
            'type' => 'hero',
            'heading' => $project['title'] ?? '',
            'text' => implode(' · ', array_filter([CmsStore::industryName($project['industry'] ?? null), $project['year'] ?? null])),
            'media' => array_values(array_filter([$project['hero_image'] ?? $project['cover_image'] ?? null])),
            'animation' => ['preset' => 'scale-in'],
        ]];
        if (! empty($project['short_description']) || ! empty($project['full_description'])) {
            $secs[] = ['type' => 'story', 'heading' => 'The work', 'text' => $project['full_description'] ?? $project['short_description'], 'media' => [], 'animation' => ['preset' => 'text-stagger']];
        }
        foreach (['challenge' => 'Challenge', 'approach' => 'Approach', 'solution' => 'Solution', 'results' => 'Results'] as $key => $label) {
            if (! empty($project[$key])) {
                $secs[] = ['type' => 'text', 'heading' => $label, 'text' => $project[$key], 'media' => [], 'animation' => ['preset' => 'fade-up']];
            }
        }
        $gallery = [];
        foreach ($project['gallery'] ?? [] as $item) {
            $gallery[] = is_array($item) ? ($item['url'] ?? '') : $item;
        }
        $gallery = array_values(array_filter($gallery));
        if ($gallery) {
            $secs[] = ['type' => 'gallery', 'heading' => '', 'text' => '', 'media' => $gallery, 'animation' => ['preset' => 'horizontal-gallery']];
        }
        if (! empty($project['external_url'])) {
            $secs[] = ['type' => 'website_preview', 'heading' => 'Website', 'text' => '', 'media' => [], 'animation' => ['preset' => 'pin-scale']];
        }
        $secs[] = ['type' => 'cta', 'heading' => 'Let’s work together', 'text' => '', 'media' => [], 'animation' => ['preset' => 'fade-up']];

        return $secs;
    }
}
