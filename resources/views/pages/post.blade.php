@extends('layouts.app')

@section('content')
<section class="page-hero">
  <div class="container">
    <div class="breadcrumbs">
      <a href="/home">Home</a> <span class="sep">/</span>
      <a href="/blog">Blog</a> <span class="sep">/</span>
      <span>{{ \Illuminate\Support\Str::limit($post['title'], 42) }}</span>
    </div>
    <x-share />
    <h1 style="font-size:clamp(30px,4.4vw,58px)" data-reveal>{{ $post['title'] }}</h1>
    <p style="margin-top:14px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--grey)">
      BY MWG &nbsp;&middot;&nbsp; {{ $post['date'] }}
    </p>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <article class="article" data-reveal>
      @isset($post['image'])<img src="{{ $post['image'] }}" alt="{{ $post['title'] }}" loading="lazy">@endisset
      <p>{{ $post['excerpt'] ?: 'Insights from the MWG strategy, creative and media teams.' }}</p>
      <p>At MWG Advertising Agency we work at the intersection of strategy, storytelling and performance. This article breaks down what we're seeing across campaigns in Egypt, the GCC and the wider Middle East — and what it means for brands planning their next move.</p>
      <h2>Why it matters now</h2>
      <p>Audiences are fragmented across more platforms, formats and moments than ever before. The brands that win are the ones that combine a clear strategic position with craft, then measure relentlessly.</p>
      <ul>
        <li>Start with a business problem, not a channel.</li>
        <li>Build one idea strong enough to travel across every touchpoint.</li>
        <li>Produce with craft — attention is earned, not bought.</li>
        <li>Instrument everything so you can learn between flights.</li>
      </ul>
      <h2>How MWG approaches it</h2>
      <p>As a 360 advertising agency, we bring strategy, creative, media production, BTL and technology under one roof. That means fewer handoffs, faster turnarounds and work that holds together from the first frame to the final report.</p>
      <h3>The takeaway</h3>
      <p>Clarity beats volume. Define the outcome, build the idea, produce it properly, then optimise with real data. If you'd like to talk through how this applies to your brand, <a href="/contact-us">get in touch</a>.</p>
    </article>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <h2 class="section-title" style="font-size:30px;margin-bottom:28px" data-reveal>Related Articles</h2>
    <div class="blog-grid">
      @foreach ($related as $item)
        <a class="post-card" href="/post/{{ $item['slug'] }}">
          <span class="post-card__meta">BY MWG <span class="dot"></span> {{ $item['date'] }}</span>
          <h3>{{ $item['title'] }}</h3>
          <p>{{ $item['excerpt'] }}</p>
          <span class="post-card__cta">Read Article <x-icon name="arrow" width="16" height="16" /></span>
        </a>
      @endforeach
    </div>
  </div>
</section>
@endsection
