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

        return preg_replace('/forward\.?/i', '<em>Forward</em>', self::esc($text)) ?? self::esc($text);
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
                self::esc($hero['secondary_cta_label'] ?? 'Kite Login'),
                self::esc($hero['secondary_cta_url'] ?? 'https://our-kites.kiteagency-eg.com/'),
                self::homeSections($pub),
            ],
            $html
        );

        return self::layout($html, [
            'title' => ($pub['settings']['company_name'] ?? 'KITE Design Studio').' — Aim High. Fly Higher.',
            'description' => $hero['supporting'] ?? '',
            'bodyClass' => 'home-intro',
            'path' => '/',
            'extraHead' => '<link rel="preload" as="image" href="/assets/kite/preloader/HP.webp" type="image/webp"><link rel="stylesheet" href="/assets/css/kite-intro.css?v=kite-sky-34">',
            'extraScript' => '<script src="/assets/js/kite-intro.js?v=kite-sky-34"></script><script src="/assets/js/kite-services.js?v=kite-sky-16"></script>',
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

    public static function servicesHorizon(array $services = [], array $projects = []): string
    {
        $tabs = [
            [
                'id' => 'branding',
                'nav' => 'Branding',
                'title' => "Branding &<br>Visual<br>Identity",
                'tagline' => 'Give your brand a shape of its own',
                'desc' => 'From strategy and naming to identity and guidelines, we build brands people can recognize, remember, and grow with.',
                'btn' => 'Explore Branding',
                'link' => '/services/branding',
                'image' => '/assets/kite/services/branding.jpg',
            ],
            [
                'id' => 'btl',
                'nav' => 'BTL',
                'title' => "BTL & BRAND<br>EXPERIENCES",
                'tagline' => 'Take the brand beyond the screen',
                'desc' => 'We create activations and real-world experiences that put brands directly in front of the people they want to reach.',
                'btn' => 'Explore BTL',
                'link' => '/services/marketing-materials',
                'image' => '/assets/kite/services/marketing.jpg',
            ],
            [
                'id' => 'digital-marketing',
                'nav' => 'Digital marketing',
                'title' => "Digital<br>Marketing &<br>Content",
                'tagline' => 'Turn ideas into campaigns that move',
                'desc' => 'We turn ideas into campaigns and digital content that get attention, engage audiences, and drive action across modern platforms.',
                'btn' => 'Explore Digital marketing',
                'link' => '/services/digital-content',
                'image' => '/assets/kite/services/digital.jpg',
            ],
            [
                'id' => 'media-production',
                'nav' => 'Media production',
                'title' => "Media<br>Production &<br>Storytelling",
                'tagline' => 'Stories with a camera and purpose',
                'desc' => 'We turn concepts into visual stories through photo, video, and creative production designed around the character of each brand.',
                'btn' => 'Explore Media production',
                'link' => '/services/media-production',
                'image' => '/assets/kite/services/media.jpg',
            ],
            [
                'id' => 'web-development',
                'nav' => 'Web Development',
                'title' => "Web<br>Development &<br>Digital Design",
                'tagline' => 'Your brand identity, alive online',
                'desc' => 'We build websites and mobile applications that look sharp, work smoothly, and translate your brand into functional digital experiences.',
                'btn' => 'Explore Web Development',
                'link' => '/services/web-development',
                'image' => '/assets/kite/services/web.jpg',
            ],
        ];

        $navHtml = '';
        $panesHtml = '';
        $vectorPath = 'M3384.17 2321.93L1881.77 2263.67C1769.98 2259.35 1658.02 2259.35 1546.23 2263.67L43.8264 2321.93C18.9573 2322.9 -1.35528 2303.12 0.0707804 2279.35L53.4262 1387.67C62.4695 1236.67 62.4695 1085.26 53.4262 934.26L0.105562 42.6122C-1.32049 18.8429 18.9921 -0.9315 43.8612 0.0339186L1546.26 58.292C1658.05 62.6197 1770.02 62.6197 1881.81 58.292L3384.17 0.0339186C3409.04 -0.9315 3429.36 18.8429 3427.93 42.6122L3374.57 934.293C3365.53 1085.3 3365.53 1236.7 3374.57 1387.71L3427.93 2279.39C3429.36 2303.16 3409.04 2322.93 3384.17 2321.97V2321.93Z';

        foreach ($tabs as $i => $tab) {
            $isActive = $i === 0;
            $navHtml .= '<button type="button" class="svc-tab-btn'.($isActive ? ' is-active' : '').'" data-tab="'.self::esc($tab['id']).'" role="tab" aria-selected="'.($isActive ? 'true' : 'false').'" aria-controls="svc-pane-'.self::esc($tab['id']).'">'.self::esc($tab['nav']).'</button>';

            $panesHtml .= '<div class="svc-pane'.($isActive ? ' is-active' : '').'" id="svc-pane-'.self::esc($tab['id']).'" data-pane="'.self::esc($tab['id']).'" role="tabpanel">'
                .'<div class="svc-pane-inner">'
                .'<div class="svc-copy-col">'
                .'<h3 class="svc-pane-title">'.$tab['title'].'</h3>'
                .'<h4 class="svc-pane-tagline">'.self::esc($tab['tagline']).'</h4>'
                .'<p class="svc-pane-desc">'.self::esc($tab['desc']).'</p>'
                .'<a href="'.self::esc($tab['link']).'" class="svc-explore-btn">'
                .'<span>'.self::esc($tab['btn']).'</span>'
                .'<svg class="svc-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>'
                .'</a></div>'
                .'<div class="svc-visual-col">'
                .'<div class="svc-visual-frame">'
                .'<svg class="svc-frame-shape" viewBox="0 0 3428 2322" preserveAspectRatio="none" fill="none"><path d="'.$vectorPath.'" fill="#ffffff"/></svg>'
                .'<div class="svc-visual-content"><img src="'.self::esc($tab['image']).'" alt="'.self::esc($tab['nav']).'" class="svc-visual-img"></div>'
                .'</div></div></div></div>';
        }

        return '<section class="services-showcase-section" id="services">'
            .'<div class="svc-showcase-container">'
            .'<div class="svc-header-block">'
            .'<h2 class="svc-section-title">What Your Brand Needs To Take Off</h2>'
            .'<p class="svc-section-subtitle">From the first idea to the final execution</p>'
            .'</div>'
            .'<div class="svc-tabs-nav" role="tablist" aria-label="Services Navigation">'.$navHtml.'</div>'
            .'<div class="svc-card-wrapper">'.$panesHtml.'</div>'
            .'</div></section>';
    }

    public static function homeSections(array $pub): string
    {
        $home = $pub['homepage'] ?? [];
        $projects = $pub['projects'] ?? [];
        $featured = $pub['featured_projects'] ?? [];
        $latest = array_slice($featured ?: $projects, 0, 3);
        $vectorItem = '<div class="latest-vector" aria-hidden="true"><img src="/assets/kite/Vector.svg" alt=""></div>';
        $gridCards = [];
        for ($i = 0; $i < 3; $i++) {
            $p = $latest[$i] ?? null;
            if ($p) {
                $img = $p['cover_image'] ?? $p['hero_image'] ?? null;
                $gridCards[] = '<a class="latest-card '.($img ? '' : 'has-empty').'" href="/project/'.self::esc($p['slug'] ?? '').'">'
                    .($img ? '<img src="'.self::esc($img).'" alt="'.self::esc($p['title'] ?? '').'">' : '<div class="empty-visual"></div>')
                    .'<figcaption><strong>'.self::esc($p['title'] ?? '').'</strong></figcaption></a>';
            } else {
                $gridCards[] = '<a class="latest-card has-empty" href="/portfolio"><div class="empty-visual"></div></a>';
            }
            $gridCards[] = $vectorItem;
        }
        $latestGridHtml = implode('', $gridCards);

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
<style>
  #latest { background-color: #10A9E2; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: clamp(40px, 8vw, 80px) 0; box-sizing: border-box; overflow: hidden; }
  #latest .section-head { justify-content: center; border: none; margin-bottom: 20px; padding: 0 16px; }
  #latest .section-head h2 { font-size: clamp(24px, 4.5vw, 42px); color: #fff; width: 100%; text-align: center; margin: 0; text-transform: uppercase; line-height: 1.15; }
  #latest .section-head h2 span { color: #fff; } /* all white per screenshot */
  #latest .ghost-link { display: none; }
  #latest .work-wrap { width: 100%; margin: clamp(20px, 4vw, 40px) 0; }
  #latest .work-card { width: min(700px, 50vw) !important; height: clamp(340px, 32vw, 440px) !important; border: none !important; border-radius: 0; }
  #latest .work-card img { border-radius: 0; }
  #latest .work-card figcaption { left: 0 !important; right: 0 !important; bottom: 0 !important; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 40px 20px 20px 20px !important; color: #fff !important; text-align: center; display: flex; justify-content: center; align-items: center; }
  #latest .work-card strong { font-size: clamp(15px, 1.4vw, 18px) !important; text-transform: uppercase; color: #fff; letter-spacing: 1px; }
  #latest .work-card strong::after { content: "\\2192"; margin-left: 8px; font-family: sans-serif; }
  #latest .work-card span { display: none; }
  .btn-portfolio { display: inline-flex; justify-content: center; align-items: center; background: #FAB944; color: #fff !important; padding: 12px 32px; border-radius: 30px; font-weight: bold; letter-spacing: 1px; text-decoration: none; transition: opacity 0.2s; font-size: 15px; margin: 0 auto; }
  .btn-portfolio:hover { opacity: 0.9; }
  @media (max-width: 1024px) {
    #latest .work-card { width: clamp(340px, 64vw, 560px) !important; height: clamp(250px, 42vw, 380px) !important; }
  }
  @media (max-width: 640px) {
    #latest { min-height: auto; padding: 50px 0; }
    #latest .work-card { width: 85vw !important; height: 56vw !important; min-height: 220px !important; }
    #latest .work-card figcaption { padding: 24px 12px 14px !important; }
    .btn-portfolio { padding: 10px 24px; font-size: 14px; }
  }
</style>
<section class="section" id="latest">
  <div class="container section-head">
    <h2 class="latest-title">Our Latest Flights</h2>
    <p class="latest-subtitle">Selected Branding, Design & Marketing Projects</p>
  </div>
  <div class="latest-marquee-wrap">
    <div class="latest-marquee-track">
      '.$latestGridHtml.$latestGridHtml.'
    </div>
  </div>
  <div style="width: 100%; text-align: center; margin-top: 36px;">
    <a class="btn-portfolio" href="/portfolio">View Portfolio</a>
  </div>
</section>
'.self::servicesHorizon($pub['services'] ?? [], $projects).'
<section class="section" id="about">
  <div class="container about-container">
    <div class="about-grid">
      <!-- Left Column: Content + Tab Switching -->
      <div class="about-left-col">
        <div class="about-header-group">
          <!-- Header 1: About Kite -->
          <div class="about-header-item is-active" data-header-panel="about">
            <span class="about-tag">ABOUT KITE</span>
            <h2 class="about-headline">A Creative<br>Design Studio<br>In Cairo</h2>
          </div>

          <!-- Header 2: Vision -->
          <div class="about-header-item" data-header-panel="vision" style="display:none;">
            <span class="about-tag">VISION</span>
            <h2 class="about-headline">A sky full of<br>remarkable kites</h2>
          </div>

          <!-- Header 3: Mission -->
          <div class="about-header-item" data-header-panel="mission" style="display:none;">
            <span class="about-tag">MISSION</span>
            <h2 class="about-headline">Give every kite<br>what it needs to<br>fly higher</h2>
          </div>
        </div>

        <div class="about-tabs" role="tablist">
          <button type="button" class="about-tab-btn is-active" data-tab-target="about" role="tab" aria-selected="true">About Kite</button>
          <button type="button" class="about-tab-btn" data-tab-target="vision" role="tab" aria-selected="false">Vision</button>
          <button type="button" class="about-tab-btn" data-tab-target="mission" role="tab" aria-selected="false">Mission</button>
        </div>
        <div class="about-body">
          <!-- Panel 1: About Kite -->
          <div class="about-panel is-active" data-panel="about">
            <p class="about-lead"><strong>We don\'t just make brands look good. We give them something worth flying for</strong></p>
            <p>KITE is a creative and marketing studio based in Cairo, Egypt, bringing together brand strategy, branding, digital marketing, content, media production, and web development under one roof.</p>
          </div>

          <!-- Panel 2: Vision -->
          <div class="about-panel" data-panel="vision" style="display:none;">
            <p class="about-lead"><strong>A sky full of remarkable kites with their own voice, identity, and purpose</strong></p>
            <p>We imagine a world where brands don\'t all look, sound, and behave the same. Our vision is to help build brands with their own distinct identity, voice, direction, and reason to exist.</p>
            <p class="about-quote"><em><strong>Different shapes. Different stories. One sky.</strong></em></p>
          </div>

          <!-- Panel 3: Mission -->
          <div class="about-panel" data-panel="mission" style="display:none;">
            <p class="about-lead"><strong>Give every kite what it needs to fly higher and conquer new horizons</strong></p>
            <p>Our mission is to turn business goals into clear strategies, strong brands, and creative ideas that work. We bring strategy, creativity, content, production, and digital together to keep every part of the brand moving in one direction.</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Visual Frame & Numbers -->
      <div class="about-right-col">
        <!-- Top: Large White Frame (image 762.svg) -->
        <div class="about-visual-frame" aria-label="Kite Studio Visual">
          <picture class="about-frame-picture">
            <source srcset="/assets/kite/image-762.svg" type="image/svg+xml">
            <img src="/assets/kite/image-762.png" class="about-frame-svg" alt="About Kite Studio Visual" loading="lazy">
          </picture>
        </div>

        <!-- Bottom: Numbers using Vector (1).svg -->
        <div class="about-numbers-wrap">
          <h3 class="about-numbers-title"><u><em>KITE by the Numbers</em></u></h3>
          <div class="about-badges-row">
            <!-- Card 1: Yellow -->
            <div class="about-badge badge-yellow">
              <svg class="about-badge-bg" viewBox="0 0 1334 966" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M37.8194 909.522L471.162 952.425C590.177 964.212 709.864 968.329 829.42 964.747L1264.69 951.722C1276.45 951.364 1286.18 942.889 1287.61 931.704L1313.46 731.277C1333.34 577.067 1338.47 421.381 1328.79 266.195L1317.04 77.9697C1316.34 66.7522 1307.23 57.6422 1295.55 56.4914L862.124 13.5727C743.109 1.78537 623.423 -2.33144 503.866 1.24989L68.5584 14.2736C56.8238 14.6189 47.1109 23.0815 45.6384 34.2241L20.9899 221.197C0.655711 375.365 -4.91617 531.022 4.32705 686.234L16.3408 887.963C17.016 899.207 26.1236 908.344 37.8335 909.509L37.8194 909.522Z" fill="#FBBA46"/>
              </svg>
              <div class="badge-content">
                <span class="badge-number"><span class="badge-plus">+</span><span class="count-value" data-target="133">0</span></span>
                <span class="badge-label">Kites Flown</span>
              </div>
            </div>

            <!-- Card 2: White -->
            <div class="about-badge badge-white">
              <svg class="about-badge-bg badge-bg-mirrored" viewBox="0 0 1334 966" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M37.8194 909.522L471.162 952.425C590.177 964.212 709.864 968.329 829.42 964.747L1264.69 951.722C1276.45 951.364 1286.18 942.889 1287.61 931.704L1313.46 731.277C1333.34 577.067 1338.47 421.381 1328.79 266.195L1317.04 77.9697C1316.34 66.7522 1307.23 57.6422 1295.55 56.4914L862.124 13.5727C743.109 1.78537 623.423 -2.33144 503.866 1.24989L68.5584 14.2736C56.8238 14.6189 47.1109 23.0815 45.6384 34.2241L20.9899 221.197C0.655711 375.365 -4.91617 531.022 4.32705 686.234L16.3408 887.963C17.016 899.207 26.1236 908.344 37.8335 909.509L37.8194 909.522Z" fill="#FFFFFF"/>
              </svg>
              <div class="badge-content">
                <span class="badge-number"><span class="badge-plus">+</span><span class="count-value" data-target="54">0</span></span>
                <span class="badge-label">Kites Build<br>From Scratch</span>
              </div>
            </div>

            <!-- Card 3: Red -->
            <div class="about-badge badge-red">
              <svg class="about-badge-bg" viewBox="0 0 1334 966" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M37.8194 909.522L471.162 952.425C590.177 964.212 709.864 968.329 829.42 964.747L1264.69 951.722C1276.45 951.364 1286.18 942.889 1287.61 931.704L1313.46 731.277C1333.34 577.067 1338.47 421.381 1328.79 266.195L1317.04 77.9697C1316.34 66.7522 1307.23 57.6422 1295.55 56.4914L862.124 13.5727C743.109 1.78537 623.423 -2.33144 503.866 1.24989L68.5584 14.2736C56.8238 14.6189 47.1109 23.0815 45.6384 34.2241L20.9899 221.197C0.655711 375.365 -4.91617 531.022 4.32705 686.234L16.3408 887.963C17.016 899.207 26.1236 908.344 37.8335 909.509L37.8194 909.522Z" fill="#D71A22"/>
              </svg>
              <div class="badge-content">
                <span class="badge-number"><span class="badge-plus">+</span><span class="count-value" data-target="32">0</span></span>
                <span class="badge-label">Industries &amp;<br>Stories Explored</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script>
    (function() {
      function setupAboutTabs() {
        var section = document.getElementById(\'about\');
        if (!section) return;
        var btns = section.querySelectorAll(\'.about-tab-btn\');
        var panels = section.querySelectorAll(\'.about-panel\');
        var headers = section.querySelectorAll(\'.about-header-item\');
        btns.forEach(function(btn) {
          btn.addEventListener(\'click\', function() {
            var target = this.getAttribute(\'data-tab-target\');
            if (!target) return;
            btns.forEach(function(b) {
              var match = b.getAttribute(\'data-tab-target\') === target;
              b.classList.toggle(\'is-active\', match);
              b.setAttribute(\'aria-selected\', match ? \'true\' : \'false\');
            });
            headers.forEach(function(h) {
              var match = h.getAttribute(\'data-header-panel\') === target;
              h.classList.toggle(\'is-active\', match);
              h.style.display = match ? \'block\' : \'none\';
            });
            panels.forEach(function(p) {
              var match = p.getAttribute(\'data-panel\') === target;
              p.classList.toggle(\'is-active\', match);
              p.style.display = match ? \'block\' : \'none\';
            });
          });
        });
      }

      function initCountUp() {
        var counters = document.querySelectorAll(\'.about-badge .count-value\');
        if (!counters.length) return;

        var animated = false;
        function startCounting() {
          if (animated) return;
          animated = true;

          var duration = 3000;
          var startTime = null;

          function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
          }

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = easeOutCubic(progress);

            counters.forEach(function(el) {
              var target = parseInt(el.getAttribute(\'data-target\'), 10) || 0;
              el.textContent = Math.round(eased * target);
            });

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              counters.forEach(function(el) {
                el.textContent = el.getAttribute(\'data-target\');
              });
            }
          }

          requestAnimationFrame(step);
        }

        var wrap = document.querySelector(\'.about-numbers-wrap\');
        if (wrap && \'IntersectionObserver\' in window) {
          var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (entry.isIntersecting) {
                startCounting();
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.25 });
          observer.observe(wrap);
        } else {
          startCounting();
        }
      }

      if (document.readyState === \'loading\') {
        document.addEventListener(\'DOMContentLoaded\', function() {
          setupAboutTabs();
          initCountUp();
        });
      } else {
        setupAboutTabs();
        initCountUp();
      }
    })();
  </script>
</section>

'.self::caseStudiesStack().'

<!-- Section 2 – CTA (Ready to fly?) -->
<style>
  #ready-to-fly-section {
    background-color: #FAB944;
    padding: clamp(70px, 10vw, 130px) 0;
    text-align: center;
    width: 100%;
  }
  .ready-headline {
    color: #DE1827;
    font-size: clamp(3.2rem, 7.5vw, 6.2rem);
    font-weight: 800;
    line-height: 1.05;
    margin: 0 0 20px 0;
    letter-spacing: -0.01em;
    font-family: "Sour Gummy", cursive, sans-serif;
  }
  .ready-subhead {
    color: #ffffff;
    font-size: clamp(1rem, 1.6vw, 1.25rem);
    font-weight: 400;
    max-width: 520px;
    margin: 0 auto 32px auto;
    line-height: 1.45;
  }
  .ready-btn {
    display: inline-block;
    background-color: #10A9E2;
    color: #ffffff !important;
    font-size: clamp(0.95rem, 1.2vw, 1.12rem);
    font-weight: 700;
    padding: 12px 32px;
    border-radius: 999px;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    box-shadow: 0 4px 16px rgba(16, 169, 226, 0.35);
  }
  .ready-btn:hover {
    transform: translateY(-2px);
    opacity: 0.95;
    box-shadow: 0 6px 20px rgba(16, 169, 226, 0.45);
  }
  @media (max-width: 640px) {
    #ready-to-fly-section {
      padding: 56px 0;
    }
    .ready-subhead {
      margin-bottom: 24px;
    }
    .ready-btn {
      padding: 10px 26px;
    }
  }
</style>
<section id="ready-to-fly-section">
  <div class="container">
    <h2 class="ready-headline">Ready to fly ?</h2>
    <p class="ready-subhead">Have an idea, a challenge, or a brand that needs to move forward</p>
    <a class="ready-btn" href="/contact-us">Let\'s work together</a>
  </div>
</section>';
    }

    /**
     * Skiper16-style stacked case-study cards.
     * Markup + copy live in one shared partial (resources/site/partials/case-studies-stack.html)
     * so the PHP site and the Node site render identical HTML.
     * Card links fall back to the case-studies index while that case is not published.
     */
    private static function caseStudiesStack(): string
    {
        $html = (string) file_get_contents(resource_path('site/partials/case-studies-stack.html'));

        $tokens = [];
        $values = [];
        foreach (['tanweer' => '{{cs1Url}}', 'paccinos' => '{{cs2Url}}', 'voyage' => '{{cs3Url}}'] as $slug => $token) {
            $tokens[] = $token;
            $values[] = CmsStore::caseBySlug($slug) ? '/case-study/'.$slug : '/case-studies';
        }

        return str_replace($tokens, $values, $html);
    }

    public static function servicesPage(): string
    {
        $pub = CmsStore::publicPayload();

        return self::layout(
            self::servicesHorizon($pub['services'] ?? [], $pub['projects'] ?? []),
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
      <div class="offices">
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
