@php $site = app(\App\Support\SiteData::class); @endphp
<div class="project-detail__share">
  <span>Share</span>
  @foreach (collect($site->get('social'))->take(3) as $s)
    <a href="{{ $s['url'] }}" target="_blank" rel="noopener" aria-label="{{ $s['name'] }}"><x-icon :name="$s['name']" /></a>
  @endforeach
</div>
