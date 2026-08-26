@extends('layouts.app')

@section('content')
<section class="page-hero">
  <div class="container">
    <div class="breadcrumbs">
      <a href="/home">Home</a> <span class="sep">/</span>
      <a href="/case-studies">Case Studies</a> <span class="sep">/</span>
      <span>{{ $study['title'] }}</span>
    </div>
    <x-share />
    <h1 data-reveal>{{ $study['title'] }}</h1>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="media-frame" data-reveal><img src="{{ $study['image'] }}" alt="{{ $study['title'] }}"></div>
    <div style="max-width:860px;margin:56px auto 0" data-reveal>
      <span class="section-kicker">{{ $study['category'] }}</span>
      <p style="font-size:17px;color:rgba(255,255,255,.76)">{{ $study['body'] }}</p>
    </div>
  </div>
</section>
@endsection
