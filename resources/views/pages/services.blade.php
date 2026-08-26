@extends('layouts.app')

@section('content')
<x-page-hero title="Our Services"
  intro="A 360 agency built around production, design, digital, BTL and technology."
  :trail="[['label' => 'Home', 'href' => '/home'], ['label' => 'Services']]" />

<section class="section">
  <div class="container">
    <div class="services-grid">
      @foreach ($services as $i => $service)
        <a class="service-tile" href="/services/{{ $service['slug'] }}" data-reveal>
          <span class="service-tile__num">{{ str_pad($i + 1, 2, '0', STR_PAD_LEFT) }}</span>
          <span>
            <h3>{{ $service['title'] }}</h3>
            <span class="service-tile__more">See More <x-icon name="arrow" width="16" height="16" /></span>
          </span>
        </a>
      @endforeach
    </div>
  </div>
</section>
@endsection
