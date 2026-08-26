@extends('layouts.app')

@section('content')
<section style="padding-top:var(--header-h)">
  <iframe class="map-embed" title="MWG offices" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps?q=Nasr+City+Cairo+Egypt&output=embed"></iframe>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="section-kicker">{{ $contact['explore'] }}</span>
      <h2 class="section-title">Our Offices</h2>
    </div>
    <div class="offices" style="margin-top:0">
      @foreach ($site->get('offices') as $office)
        <div class="office" data-reveal>
          <h4>{{ $office['country'] }}</h4>
          <p>{{ $office['address'] }}</p>
          @foreach ($office['lines'] as $line)<p>{{ $line }}</p>@endforeach
        </div>
      @endforeach
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="contact-split">
      <div class="contact-split__media" data-reveal>
        <img src="{{ $contact['image'] }}" alt="MWG Contact" loading="lazy">
      </div>
      <div data-reveal>
        <h1 style="font-size:clamp(36px,5vw,68px)">{{ $contact['heading'] }}</h1>
        <p style="color:rgba(255,255,255,.7);margin-bottom:34px">{{ $contact['subheading'] }}</p>
        <x-lead-form id="contact" />
      </div>
    </div>
  </div>
</section>
@endsection
