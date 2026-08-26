@props(['title', 'intro' => null, 'trail' => []])
<section class="page-hero">
  <div class="container">
    @if ($trail)
      <div class="breadcrumbs">
        @foreach ($trail as $i => $crumb)
          @if ($i) <span class="sep">/</span> @endif
          @if (!empty($crumb['href']))
            <a href="{{ $crumb['href'] }}">{{ $crumb['label'] }}</a>
          @else
            <span>{{ $crumb['label'] }}</span>
          @endif
        @endforeach
      </div>
    @endif
    <h1 data-reveal>{{ $title }}</h1>
    @if ($intro)<p data-reveal>{{ $intro }}</p>@endif
  </div>
</section>
