@extends('layouts.app')

@section('content')
<section class="page-hero" style="padding-bottom:0">
  <div class="container">
    <div class="breadcrumbs">
      <a href="/home">Home</a> <span class="sep">/</span>
      <a href="/services">Services</a> <span class="sep">/</span>
      <span>{{ $service['title'] }}</span>
    </div>
  </div>
</section>

<section class="section section--tight" data-slider>
  <div class="container">
    <div class="svc-hero">
      <div data-reveal>
        <div class="slider-dots">
          @for ($i = 1; $i <= $service['slides']; $i++)
            <button type="button" @class(['is-active' => $i === 1])>{{ str_pad($i, 2, '0', STR_PAD_LEFT) }}</button>
          @endfor
        </div>
        <h1 style="font-size:clamp(38px,6vw,80px)">{{ $service['title'] }}</h1>
        <div class="svc-blocks">
          @foreach ($service['blocks'] as $block)
            <div class="svc-block"><h2>{{ $block['heading'] }}</h2><p>{{ $block['body'] }}</p></div>
          @endforeach
        </div>
        <div class="slider-nav">
          <button type="button" data-slide-prev aria-label="prev" style="transform:rotate(180deg)"><x-icon name="arrow" width="16" height="16" /></button>
          <button type="button" data-slide-next aria-label="next"><x-icon name="arrow" width="16" height="16" /></button>
        </div>
      </div>
      <div class="svc-hero__media" data-reveal>
        <img src="{{ $service['hero'] }}" alt="{{ $service['title'] }}" loading="lazy">
      </div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container"><x-portfolio-block /></div>
</section>
@endsection
