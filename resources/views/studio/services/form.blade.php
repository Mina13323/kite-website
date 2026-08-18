@extends('studio.layout', ['active' => 'services'])
@php($isNew=empty($service['slug']))
@section('title',$isNew?'New service':$service['name'])
@section('content')
<h1>{{ $isNew?'New service':$service['name'] }}</h1><p class="note">Recommended service image: 1600×1200 (4:3).</p>
<form method="post" action="{{ $isNew?route('studio.services.create'):route('studio.services.update',$service['slug']) }}" enctype="multipart/form-data">@csrf<div class="form-grid">
<label>Name<input name="name" required value="{{ old('name',$service['name'] ?? '') }}"></label><label>Slug<input name="slug" value="{{ old('slug',$service['slug'] ?? '') }}"></label>
<label>Statement<input name="statement" value="{{ old('statement',$service['statement'] ?? '') }}"></label><label>Status<select name="status">@foreach(['draft','published','archived'] as $status)<option @selected(old('status',$service['status'] ?? 'draft')===$status)>{{ $status }}</option>@endforeach</select></label>
<label class="full">Short description<textarea name="short_description">{{ old('short_description',$service['short_description'] ?? '') }}</textarea></label><label class="full">Full description<textarea name="description">{{ old('description',$service['description'] ?? '') }}</textarea></label>
<label class="full">Capabilities (one per line)<textarea name="capabilities">{{ old('capabilities',implode("\n",$service['capabilities'] ?? [])) }}</textarea></label><label class="full">Homepage tags (one per line)<textarea name="horizon_tags">{{ old('horizon_tags',implode("\n",$service['horizon_tags'] ?? [])) }}</textarea></label>
<label class="full">Cover image @if(!empty($service['cover_image']))<div class="upload-preview"><img src="{{ $service['cover_image'] }}" alt=""><label class="checks"><input type="checkbox" name="cover_clear" value="1"> Remove current</label></div>@endif<input type="hidden" name="cover_image" value="{{ $service['cover_image'] ?? '' }}"><input type="file" name="cover_file" accept="image/jpeg,image/png,image/webp"></label>
<label>SEO title<input name="seo_title" value="{{ old('seo_title',$service['seo_title'] ?? '') }}"></label><label class="full">SEO description<textarea name="seo_description">{{ old('seo_description',$service['seo_description'] ?? '') }}</textarea></label>
<label class="full">Featured projects<div class="checks">@foreach($data['projects'] ?? [] as $project)<label><input type="checkbox" name="featured_project_slugs[]" value="{{ $project['slug'] }}" @checked(in_array($project['slug'],old('featured_project_slugs',$service['featured_project_slugs'] ?? [])))> {{ $project['title'] }}</label>@endforeach</div></label>
<label>Featured<div class="checks"><label><input type="checkbox" name="featured" value="1" @checked(old('featured',!empty($service['featured'])))> Feature this service</label></div></label>
</div><button class="btn" style="margin-top:20px" type="submit">Save service</button></form>@endsection
