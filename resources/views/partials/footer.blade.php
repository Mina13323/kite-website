<footer class="site-footer">
  <div class="container footer-inner">
    <div>&copy; {{ date('Y') }} {{ $site->get('brand.fullName') }}. All rights reserved.</div>
    <nav class="footer-links">
      @foreach (collect($site->get('nav'))->whereNull('children') as $n)
        <a href="{{ $n['href'] }}">{{ $n['label'] }}</a>
      @endforeach
    </nav>
    <div class="footer-links">
      @foreach ($site->get('social') as $s)
        <a href="{{ $s['url'] }}" target="_blank" rel="noopener">{{ $s['name'] }}</a>
      @endforeach
    </div>
  </div>
</footer>
