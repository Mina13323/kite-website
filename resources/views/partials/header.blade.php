<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/home" aria-label="{{ $site->get('brand.fullName') }}">
      <img src="{{ $site->get('brand.logo') }}" alt="MWG Logo"
           onerror="this.outerHTML='<span class=&quot;brand__fallback&quot;>MWG</span>'">
    </a>
    <nav class="main-nav" aria-label="Main">
      <ul>
        @foreach ($site->get('nav') as $item)
          @include('partials.nav-item', ['item' => $item])
        @endforeach
      </ul>
    </nav>
    <div class="header-social">
      @foreach ($site->get('social') as $s)
        <a href="{{ $s['url'] }}" target="_blank" rel="noopener" aria-label="{{ $s['name'] }}">
          <x-icon :name="$s['name']" />
        </a>
      @endforeach
      <button class="burger" type="button" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-nav">
  <ul>
    @foreach ($site->get('nav') as $item)
      @include('partials.mobile-nav-item', ['item' => $item])
    @endforeach
  </ul>
</div>
