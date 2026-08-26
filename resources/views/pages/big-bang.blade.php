@extends('layouts.app')

@section('content')
<x-page-hero :title="$bigBang['heading']"
  intro="Breakthrough campaigns from a top advertising agency in Egypt."
  :trail="[['label' => 'Home', 'href' => '/home'], ['label' => 'Big Bang']]" />

<section class="section section--tight">
  <div class="container">
    @foreach ($bigBang['items'] as $item)
      <article class="bb-item" data-reveal>
        <div class="bb-item__media"><img src="{{ $item['image'] }}" alt="{{ $item['title'] }}" loading="lazy"></div>
        <div>
          <h2>{{ $item['title'] }}</h2>
          <p>{{ $item['body'] }}</p>
          <a class="link-more" href="/project/{{ $item['slug'] }}">See More <x-icon name="arrow" width="16" height="16" /></a>
        </div>
      </article>
    @endforeach
  </div>
</section>
@endsection
