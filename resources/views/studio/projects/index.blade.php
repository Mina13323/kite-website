@extends('studio.layout', ['active' => 'projects'])
@section('title','Projects')
@section('content')
<h1>Projects</h1><p class="lede">Create, draft, publish, feature, and archive portfolio work.</p><p class="row-actions"><a class="btn" href="{{ route('studio.projects.new') }}">Create project</a></p>
<table class="table"><tr><th>Title</th><th>Client</th><th>Status</th><th>Featured</th><th></th></tr>
@forelse(collect($projects)->sortBy('sort_order') as $project)<tr><td>{{ $project['title'] }}</td><td>{{ $project['client'] ?? '—' }}</td><td><span class="badge {{ ($project['status'] ?? '') === 'published' ? 'pub' : (($project['status'] ?? '') === 'archived' ? 'arch' : 'draft') }}">{{ $project['status'] ?? 'draft' }}</span></td><td>{{ !empty($project['featured']) ? 'Yes' : '—' }}</td><td><a class="btn ghost" href="{{ route('studio.projects.edit',$project['slug']) }}">Edit</a></td></tr>@empty<tr><td colspan="5">No projects yet.</td></tr>@endforelse
</table>@endsection
