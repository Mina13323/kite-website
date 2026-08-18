@extends('studio.layout', ['active' => 'services'])
@section('title','Services')
@section('content')
<h1>Services</h1><p class="lede">Edit service pages and control their homepage display order.</p><p><a class="btn" href="{{ route('studio.services.new') }}">Create service</a></p>
<form method="post" action="{{ route('studio.services.reorder') }}">@csrf<table class="table"><tr><th>Order</th><th>Name</th><th>Status</th><th></th></tr>
@foreach(collect($services)->sortBy('sort_order') as $service)<tr><td><input type="number" min="0" name="sort_{{ $service['slug'] }}" value="{{ $service['sort_order'] ?? 0 }}" style="width:80px"></td><td>{{ $service['name'] }}</td><td><span class="badge {{ ($service['status'] ?? '') === 'published' ? 'pub' : (($service['status'] ?? '') === 'archived' ? 'arch' : 'draft') }}">{{ $service['status'] ?? 'draft' }}</span></td><td><a class="btn ghost" href="{{ route('studio.services.edit',$service['slug']) }}">Edit</a></td></tr>@endforeach</table><button class="btn" type="submit" style="margin-top:12px">Save order</button></form>@endsection
