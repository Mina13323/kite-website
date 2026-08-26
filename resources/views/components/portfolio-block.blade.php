@props(['limit' => 9])
@php
  $site = app(\App\Support\SiteData::class);
  $projects = collect($site->projects());
  $shown = $projects->take($limit);
  $rest = $projects->slice($limit);
@endphp
<div data-filterable>
  <div class="filters">
    @foreach ($site->get('portfolioFilters') as $i => $filter)
      <button @class(['filter-btn', 'is-active' => $i === 0]) type="button" data-filter="{{ $filter }}">{{ $filter }}</button>
    @endforeach
  </div>
  <div class="project-grid" id="project-grid">
    @foreach ($shown as $project)<x-project-card :project="$project" />@endforeach
    @foreach ($rest as $project)<x-project-card :project="$project" more />@endforeach
  </div>
  @if ($rest->count())
    <div class="load-more">
      <button class="btn" type="button" data-load-more="project-grid"><span>Load More Projects</span></button>
    </div>
  @endif
</div>
<style>#project-grid .js-more{display:none}</style>
