@props(['project', 'more' => false])
<a @class(['project-card', 'js-more' => $more]) href="/project/{{ $project['slug'] }}" data-cat="{{ $project['category'] }}">
  <img src="{{ $project['image'] }}" alt="{{ $project['title'] }}" loading="lazy">
  <span class="project-card__body">
    <span class="project-card__cat">{{ $project['category'] }}</span>
    <span class="project-card__title">{{ $project['title'] }}</span>
    <span class="project-card__excerpt">{{ $project['excerpt'] ?? '' }}</span>
  </span>
</a>
