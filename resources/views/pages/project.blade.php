@extends('layouts.app')

@section('content')
<section class="page-hero">
  <div class="container">
    <div class="breadcrumbs">
      <a href="/home">Home</a> <span class="sep">/</span>
      <a href="/portfolio">Portfolio</a> <span class="sep">/</span>
      <span>{{ $project['title'] }}</span>
    </div>
    <x-share />
    <h1 data-reveal>{{ $project['title'] }}</h1>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="media-frame" data-reveal>
      <img src="{{ $project['image'] }}" alt="{{ $project['title'] }}">
      <span class="media-frame__play"><span><x-icon name="play" width="24" height="24" /></span></span>
    </div>
    <div style="max-width:860px;margin:56px auto 0" data-reveal>
      <h3 style="font-size:15px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent-2)">About The Project</h3>
      <p style="font-size:17px;color:rgba(255,255,255,.76)">{{ $project['body'] }}</p>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <h2 class="section-title" style="font-size:32px;margin-bottom:28px" data-reveal>Other Videos</h2>
    <div class="gallery-grid" data-reveal>
      @for ($i = 0; $i < 4; $i++)
        <div class="media-frame" style="aspect-ratio:16/9">
          <img src="{{ $project['image'] }}" alt="{{ $project['title'] }}" loading="lazy">
          <span class="media-frame__play"><span><x-icon name="play" width="24" height="24" /></span></span>
        </div>
      @endfor
    </div>

    <h2 class="section-title" style="font-size:32px;margin:64px 0 28px" data-reveal>Making Of</h2>
    <div class="media-frame" data-reveal>
      <img src="{{ $project['image'] }}" alt="Making of {{ $project['title'] }}" loading="lazy">
      <span class="media-frame__play"><span><x-icon name="play" width="24" height="24" /></span></span>
    </div>

    <h2 class="section-title" style="font-size:32px;margin:64px 0 28px" data-reveal>Photoshoots</h2>
    <div class="gallery-grid" data-reveal>
      @for ($i = 0; $i < 8; $i++)
        <img src="{{ $project['image'] }}" alt="Photoshoot" loading="lazy">
      @endfor
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <h2 class="section-title" style="font-size:32px;margin-bottom:28px" data-reveal>More Projects</h2>
    <div class="project-grid">
      @foreach ($related as $item)<x-project-card :project="$item" />@endforeach
    </div>
  </div>
</section>
@endsection
