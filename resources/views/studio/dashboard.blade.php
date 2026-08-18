@extends('studio.layout', ['active' => 'dashboard'])
@section('title','Dashboard')
@section('content')
<h1>Website content</h1><p class="lede">The complete PHP editor for Hostinger. Every save writes the same CMS store used by the public website; draft and archived items stay private.</p>
<div class="stat-grid">
  <div class="stat"><strong>{{ $stats['published_projects'] }}</strong><span>Published projects</span></div><div class="stat"><strong>{{ $stats['draft_projects'] }}</strong><span>Draft projects</span></div>
  <div class="stat"><strong>{{ $stats['published_services'] }}</strong><span>Live services</span></div><div class="stat"><strong>{{ $stats['published_clients'] }}</strong><span>Live clients</span></div>
  <div class="stat"><strong>{{ $stats['media'] }}</strong><span>Media files</span></div><div class="stat"><strong>{{ $stats['published_case_studies'] }}</strong><span>Case studies</span></div>
</div>
@if($stats['missing_email'] || $stats['missing_address'])<p class="note">{{ $stats['missing_email'] ? 'Email is CONTENT_REQUIRED. ' : '' }}{{ $stats['missing_address'] ? 'Street address is CONTENT_REQUIRED.' : '' }}</p>@endif
<div class="row-actions"><a class="btn" href="{{ route('studio.projects.new') }}">New project</a><a class="btn ghost" href="{{ route('studio.homepage') }}">Edit homepage</a><a class="btn ghost" href="{{ route('studio.media') }}">Upload media</a></div>
@endsection
