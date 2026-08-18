@extends('studio.layout', ['active' => 'media'])
@section('title','Media')
@section('content')
<h1>Media library</h1><p class="lede">Upload artwork, then copy its URL into a project field. JPG, PNG, or WebP; maximum 8 MB.</p>
@foreach($data['image_specs'] ?? [] as $key=>$spec)<div class="spec"><strong>{{ str_replace('_',' ',$key) }}</strong> — {{ $spec['ratio'] ?? '' }} · {{ $spec['suggested'] ?? '' }}. {{ $spec['notes'] ?? '' }}</div>@endforeach
<form method="post" action="{{ route('studio.media.upload') }}" enctype="multipart/form-data" style="margin:18px 0">@csrf<label>Image file<input type="file" name="image" accept="image/jpeg,image/png,image/webp" required></label><button class="btn" type="submit" style="margin-top:12px">Upload</button></form>
<table class="table"><tr><th></th><th>File</th><th>URL</th><th></th></tr>@forelse($data['media'] ?? [] as $media)<tr><td><img class="thumb" src="{{ $media['url'] }}" alt=""></td><td>{{ $media['filename'] }}</td><td><code>{{ $media['url'] }}</code></td><td><form method="post" action="{{ route('studio.media.delete',$media['id']) }}" onsubmit="return confirm('Remove this file?')">@csrf<button class="btn danger">Remove</button></form></td></tr>@empty<tr><td colspan="4">No uploads yet.</td></tr>@endforelse</table>@endsection
