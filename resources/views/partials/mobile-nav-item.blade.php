<li>
  <a href="{{ $item['href'] }}">{{ $item['label'] }}</a>
  @if (!empty($item['children']))
    <ul>
      @foreach ($item['children'] as $child)
        @include('partials.mobile-nav-item', ['item' => $child])
      @endforeach
    </ul>
  @endif
</li>
