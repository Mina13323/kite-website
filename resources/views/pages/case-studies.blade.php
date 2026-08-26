@extends('layouts.app')

@section('content')
@php $feature = $caseStudies[0]; @endphp

<section class="page-hero" style="padding-bottom:34px">
  <div class="container">
    <div class="breadcrumbs"><a href="/home">Home</a> <span class="sep">/</span> <span>Case Studies</span></div>
    <div class="filters" style="margin-bottom:0">
      @foreach ($site->get('portfolioFilters') as $i => $filter)
        <button @class(['filter-btn', 'is-active' => $i === 0]) type="button">{{ $filter }}</button>
      @endforeach
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="cs-feature" data-reveal>
      <img src="{{ $feature['image'] }}" alt="{{ $feature['title'] }}">
      <div class="cs-feature__body">
        <span class="case-card__cat">{{ $feature['category'] }}</span>
        <h2>{{ $feature['title'] }}</h2>
        <a class="btn" href="/case-study/{{ $feature['slug'] }}"><span>Explore Case Study</span></a>
      </div>
    </div>

    <div class="case-grid" style="margin-top:40px">
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
  </div>
</section>
@endsection
