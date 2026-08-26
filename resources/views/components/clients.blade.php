@php
  $site = app(\App\Support\SiteData::class);
  $logos = collect($site->get('clientLogos'));
@endphp
<section class="section section--tight">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">Trusted by</span>
      <h2 class="section-title">Our Clients</h2>
    </div>
  </div>
  @foreach ([0, 1, 2] as $r)
    <div class="client-row">
      <div class="client-track">
        @foreach ($logos->filter(fn ($l, $i) => $i % 3 === $r) as $logo)
          <div class="client-cell"><img src="{{ $logo }}" alt="Client Logo" loading="lazy"></div>
        @endforeach
      </div>
    </div>
  @endforeach
</section>
