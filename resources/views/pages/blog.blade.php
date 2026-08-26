@extends('layouts.app')

@section('content')
<x-page-hero :title="$blog['heading']" :intro="$blog['subheading']"
  :trail="[['label' => 'Home', 'href' => '/home'], ['label' => 'Blog']]" />

<section class="section">
  <div class="container">
    <div class="blog-grid" id="blog-grid">
      @foreach ($blog['posts'] as $i => $post)
        <a @class(['post-card', 'js-more' => $i >= 12]) href="/post/{{ $post['slug'] }}">
          <span class="post-card__meta">BY MWG <span class="dot"></span> {{ $post['date'] }}</span>
          <h3>{{ $post['title'] }}</h3>
          <p>{{ $post['excerpt'] }}</p>
          <span class="post-card__cta">Read Article <x-icon name="arrow" width="16" height="16" /></span>
        </a>
      @endforeach
    </div>
    @if (count($blog['posts']) > 12)
      <div class="load-more">
        <button class="btn" type="button" data-load-more="blog-grid"><span>Load More Articles</span></button>
      </div>
    @endif
  </div>
</section>
<style>#blog-grid .js-more{display:none}</style>
@endsection
