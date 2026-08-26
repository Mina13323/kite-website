<section class="touch">
  <div class="container touch__inner">
    <div data-reveal>
      <div class="touch__brand-mark">mwg</div>
      <ul class="touch__disciplines">
        @foreach ($site->get('disciplines') as $d)<li>{{ $d }}</li>@endforeach
      </ul>
      <div class="touch__sig">MWG ADVERTISING</div>
    </div>
    <div data-reveal>
      <h2>Get in touch</h2>
      <x-lead-form id="band" />
    </div>
  </div>
</section>
