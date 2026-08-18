@extends('studio.layout', ['active' => 'projects'])
@php($isNew=empty($project['slug']))
@section('title', $isNew ? 'New project' : $project['title'])
@section('content')
<h1>{{ $isNew ? 'New project' : $project['title'] }}</h1><p class="note">Cover 1600×1200; hero 1920×1080. Draft before publishing, and never invent metrics or results.</p>
<form method="post" action="{{ $isNew ? route('studio.projects.create') : route('studio.projects.update',$project['slug']) }}" enctype="multipart/form-data">@csrf
<div class="form-grid">
<label>Title<input name="title" required value="{{ old('title',$project['title'] ?? '') }}"></label><label>Slug<input name="slug" value="{{ old('slug',$project['slug'] ?? '') }}" placeholder="auto from title"></label>
<label>Client<input name="client" value="{{ old('client',$project['client'] ?? '') }}"></label><label>Year<input name="year" value="{{ old('year',$project['year'] ?? '') }}"></label>
<label>Industry<select name="industry"><option value="">—</option>@foreach($data['industries'] ?? [] as $industry)<option value="{{ $industry['slug'] }}" @selected(old('industry',$project['industry'] ?? '')===$industry['slug'])>{{ $industry['name'] }}</option>@endforeach</select></label>
<label>Status<select name="status">@foreach(['draft','published','archived'] as $status)<option @selected(old('status',$project['status'] ?? 'draft')===$status)>{{ $status }}</option>@endforeach</select></label>
<label class="full">Short description<textarea name="short_description">{{ old('short_description',$project['short_description'] ?? '') }}</textarea></label><label class="full">Full description<textarea name="full_description">{{ old('full_description',$project['full_description'] ?? '') }}</textarea></label>
<label class="full">Services<div class="checks">@foreach($data['services'] ?? [] as $service)<label><input type="checkbox" name="services[]" value="{{ $service['slug'] }}" @checked(in_array($service['slug'],old('services',$project['services'] ?? [])))> {{ $service['name'] }}</label>@endforeach</div></label>
<label>External website URL<input type="url" name="external_url" value="{{ old('external_url',$project['external_url'] ?? '') }}" placeholder="https://"></label>
<label>Featured<div class="checks"><label><input type="checkbox" name="featured" value="1" @checked(old('featured',!empty($project['featured'])))> Feature on homepage</label></div></label>
@foreach([['cover','Cover image · 1600×1200'],['hero','Hero image · 1920×1080']] as [$field,$label])<label class="full">{{ $label }}
@if(!empty($project[$field.'_image']))<div class="upload-preview"><img src="{{ $project[$field.'_image'] }}" alt=""><label class="checks"><input type="checkbox" name="{{ $field }}_clear" value="1"> Remove current</label></div>@endif
<input type="hidden" name="{{ $field }}_image" value="{{ $project[$field.'_image'] ?? '' }}"><input type="file" name="{{ $field }}_file" accept="image/jpeg,image/png,image/webp"></label>@endforeach
<label>SEO title<input name="seo_title" value="{{ old('seo_title',$project['seo_title'] ?? '') }}"></label><label class="full">SEO description<textarea name="seo_description">{{ old('seo_description',$project['seo_description'] ?? '') }}</textarea></label>
@foreach(['challenge'=>'Challenge','approach'=>'Approach','solution'=>'Solution','results'=>'Results (leave empty if unknown)'] as $field=>$label)<label class="full">{{ $label }}<textarea name="{{ $field }}">{{ old($field,$project[$field] ?? '') }}</textarea></label>@endforeach
<label class="full">Gallery URLs (one per line)<textarea name="gallery">{{ old('gallery',collect($project['gallery'] ?? [])->map(fn($g)=>is_array($g)?($g['url'] ?? ''):$g)->implode("\n")) }}</textarea></label>
<label>Page theme<select name="anim_theme">@foreach(['default','cinematic','editorial','minimal'] as $theme)<option @selected(old('anim_theme',$project['animation']['theme'] ?? 'default')===$theme)>{{ $theme }}</option>@endforeach</select></label>
<label>Motion intensity<select name="anim_intensity">@foreach(['low','medium','high'] as $intensity)<option @selected(old('anim_intensity',$project['animation']['intensity'] ?? 'medium')===$intensity)>{{ $intensity }}</option>@endforeach</select></label>
</div>
<h2>Project sections</h2><p class="note">Build structured sections with approved motion presets. No custom JavaScript is stored.</p><div id="section-builder"></div><button type="button" class="btn ghost" id="add-section">Add section</button>
<textarea name="sections" id="sections-json" hidden>{{ old('sections',json_encode($project['sections'] ?? [])) }}</textarea>
<div class="row-actions" style="margin-top:20px"><button class="btn" type="submit">Save project</button>@if(!$isNew && ($project['status'] ?? '')==='published')<a class="btn ghost" href="/project/{{ $project['slug'] }}" target="_blank">View</a>@endif</div><script src="/assets/js/studio-builder.js?v=1"></script></form>
@if(!$isNew)<form method="post" action="{{ route('studio.projects.delete',$project['slug']) }}" style="margin-top:28px" onsubmit="return confirm('Delete this project?')">@csrf<button class="btn danger" type="submit">Delete project</button></form>@endif
@endsection
