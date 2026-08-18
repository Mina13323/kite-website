@extends('studio.layout', ['active' => 'contact'])
@section('title','Contact & SEO')
@section('content')
@php($settings=$data['settings'] ?? [])
@php($company=$data['company'] ?? [])
<h1>Contact, footer & company</h1><p class="lede">These details are used across contact, metadata, and the public footer.</p>
<form method="post" action="{{ route('studio.contact.save') }}">@csrf<div class="form-grid">
@foreach(['company_name'=>'Company name','tagline'=>'Tagline','phone'=>'Phone','website'=>'Website','email'=>'Email','address'=>'Address'] as $field=>$label)<label>{{ $label }}<input name="{{ $field }}" value="{{ old($field,$settings[$field] ?? '') }}" @if(in_array($field,['email','address'])) placeholder="CONTENT_REQUIRED if empty" @endif></label>@endforeach
@foreach(['behance'=>'Behance','instagram'=>'Instagram','facebook'=>'Facebook','linkedin'=>'LinkedIn','whatsapp'=>'WhatsApp'] as $field=>$label)<label>{{ $label }}<input name="{{ $field }}" value="{{ old($field,$settings['socials'][$field] ?? '') }}"></label>@endforeach
@foreach(['story'=>'Company story','mission'=>'Mission','vision'=>'Vision'] as $field=>$label)<label class="full">{{ $label }}<textarea name="{{ $field }}">{{ old($field,$company[$field] ?? '') }}</textarea></label>@endforeach
</div><button class="btn" style="margin-top:20px" type="submit">Save details</button></form>@endsection
