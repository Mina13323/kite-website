@extends('layouts.app')

@section('content')
@php $half = (int) ceil(count($home['latestWork']) / 2); @endphp

<section class="hero">
  <div class="hero__media">
    <video autoplay muted loop playsinline poster="{{ $home['aboutTabs'][0]['image'] }}">
      <source src="{{ $site->get('brand.origin') }}/assets/videos/showreel.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  </div>
  <div class="container hero__inner">
    <h1 data-reveal>{{ $home['heroPrefix'] }} <span class="accent">{{ $home['heroBrand'] }}</span><br>{{ $home['heroSuffix'] }}</h1>
    <p class="hero__intro" data-reveal>{{ $home['intro'] }}</p>
    <div class="pillars" data-reveal>
      @foreach ($home['pillars'] as $pillar)
        <div class="pillar"><h6>{{ $pillar['title'] }}</h6><p>{{ $pillar['text'] }}</p></div>
      @endforeach
    </div>
  </div>
  <div class="hero__scroll"><span>Scroll</span><i></i></div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">Selected campaigns</span>
      <h2 class="section-title">Our Latest Work</h2>
    </div>
  </div>
  @foreach ([array_slice($home['latestWork'], 0, $half), array_slice($home['latestWork'], $half)] as $row => $items)
    <div @class(['marquee', 'marquee--reverse' => $row === 1]) @style(['margin-top:22px' => $row === 1])>
      <div class="marquee__track">
        @foreach ($items as $item)
          <a class="work-card" href="/project/{{ $item['slug'] }}">
            <img class="work-card__bg" src="{{ $item['image'] }}" alt="{{ $item['title'] }}" loading="lazy">
            <span class="work-card__veil"></span>
            <span class="work-card__body">
              <span class="work-card__title">{{ $item['title'] }}</span>
              @isset($item['logo'])<img class="work-card__logo" src="{{ $item['logo'] }}" alt="" loading="lazy">@endisset
            </span>
          </a>
        @endforeach
      </div>
    </div>
  @endforeach
  <div class="container" style="margin-top:56px;text-align:center" data-reveal>
    <a class="btn" href="/portfolio"><span>Our Portfolio</span></a>
  </div>
</section>

<section class="section" id="about">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">Who we are</span>
      <h2 class="section-title">About Us</h2>
    </div>
    <div class="about-grid" data-tabs>
      <div data-reveal>
        <div class="tabs">
          <div class="tabs__list">
            @foreach ($home['aboutTabs'] as $i => $tab)
              <button @class(['tabs__btn', 'is-active' => $i === 0]) type="button">{{ $tab['label'] }}</button>
            @endforeach
          </div>
        </div>
        @foreach ($home['aboutTabs'] as $i => $tab)
          <div @class(['tab-panel', 'is-active' => $i === 0])>
            <h2 style="font-size:clamp(28px,3.4vw,46px)">{{ $tab['heading'] }}</h2>
            <p style="color:rgba(255,255,255,.72)">{{ $tab['body'] }}</p>
            <div class="about-points">
              @foreach ($tab['points'] as $point)
                <div class="about-point"><h5>{{ $point['title'] }}</h5><p>{{ $point['text'] }}</p></div>
              @endforeach
            </div>
          </div>
        @endforeach
      </div>
      <div class="about-visual" data-reveal>
        <img src="{{ $home['aboutTabs'][0]['image'] }}" alt="A Revolutionary Spirit" loading="lazy">
      </div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">In depth</span>
      <h2 class="section-title">Case Studies</h2>
    </div>
    <div class="case-grid">
      @foreach ($caseStudies as $study)
        <a class="case-card" href="/case-study/{{ $study['slug'] }}" data-reveal>
          <img src="{{ $study['image'] }}" alt="{{ $study['title'] }}" loading="lazy">
          <span class="case-card__body">
            <span class="case-card__cat">{{ $study['category'] }}</span>
            <span class="case-card__title">{{ $study['title'] }}</span>
          </span>
        </a>
      @endforeach
    </div>
    <div style="margin-top:44px" data-reveal>
      <a class="link-more" href="/case-studies">View All Case Studies <x-icon name="arrow" width="16" height="16" /></a>
    </div>
  </div>
</section>

<x-clients />
@endsection
