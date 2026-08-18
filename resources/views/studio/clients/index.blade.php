@extends('studio.layout', ['active' => 'clients'])
@section('title','Clients / Kites')
@section('content')
<h1>Clients / Kites</h1><p class="lede">Manage names, logos, links, and homepage availability.</p><p><a class="btn" href="{{ route('studio.clients.new') }}">Add client</a></p>
<table class="table"><tr><th>Name</th><th>Logo</th><th>Status</th><th></th></tr>@foreach(collect($clients)->sortBy('sort_order') as $client)<tr><td>{{ $client['name'] }}</td><td>@if(!empty($client['logo']))<img class="thumb" src="{{ $client['logo'] }}" alt="">@else — @endif</td><td><span class="badge {{ ($client['status'] ?? '') === 'published' ? 'pub' : (($client['status'] ?? '') === 'archived' ? 'arch' : 'draft') }}">{{ $client['status'] ?? 'draft' }}</span></td><td><a class="btn ghost" href="{{ route('studio.clients.edit',$client['slug']) }}">Edit</a></td></tr>@endforeach</table>@endsection
