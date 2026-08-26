<li @class(['has-children' => !empty($item['children'])])>
  <a href="{{ $item['href'] }}">{{ $item['label'] }}</a>
  @if (!empty($item['children']))
    <ul class="submenu">
      @foreach ($item['children'] as $child)
        @include('partials.nav-item', ['item' => $child])
      @endforeach
    </ul>
  @endif
</li>
