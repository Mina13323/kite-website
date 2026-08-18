@extends('studio.layout', ['active' => 'clients'])
@php($isNew=empty($client['slug']))
@section('title',$isNew?'New client':$client['name'])
@section('content')
<h1>{{ $isNew?'New client':$client['name'] }}</h1><p class="note">Use a transparent PNG logo where possible.</p>
<form method="post" action="{{ $isNew?route('studio.clients.create'):route('studio.clients.update',$client['slug']) }}" enctype="multipart/form-data">@csrf<div class="form-grid">
<label>Name<input name="name" required value="{{ old('name',$client['name'] ?? '') }}"></label><label>Slug<input name="slug" value="{{ old('slug',$client['slug'] ?? '') }}"></label>
<label class="full">Logo @if(!empty($client['logo']))<div class="upload-preview"><img src="{{ $client['logo'] }}" alt=""><label class="checks"><input type="checkbox" name="logo_clear" value="1"> Remove current</label></div>@endif<input type="hidden" name="logo" value="{{ $client['logo'] ?? '' }}"><input type="file" name="logo_file" accept="image/jpeg,image/png,image/webp"></label>
<label>Website URL<input type="url" name="website_url" value="{{ old('website_url',$client['website_url'] ?? '') }}"></label><label>Industry<select name="industry"><option value="">—</option>@foreach($data['industries'] ?? [] as $industry)<option value="{{ $industry['slug'] }}" @selected(old('industry',$client['industry'] ?? '')===$industry['slug'])>{{ $industry['name'] }}</option>@endforeach</select></label>
<label>Status<select name="status">@foreach(['draft','published','archived'] as $status)<option @selected(old('status',$client['status'] ?? 'draft')===$status)>{{ $status }}</option>@endforeach</select></label><label>Display order<input type="number" min="0" name="sort_order" value="{{ old('sort_order',$client['sort_order'] ?? 0) }}"></label>
</div><button class="btn" style="margin-top:20px" type="submit">Save client</button></form>
@if(!$isNew)<form method="post" action="{{ route('studio.clients.delete',$client['slug']) }}" style="margin-top:24px" onsubmit="return confirm('Remove this client?')">@csrf<button class="btn danger">Remove client</button></form>@endif
@endsection
