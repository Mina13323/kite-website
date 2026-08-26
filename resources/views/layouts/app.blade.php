<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ $meta['title'] ?? $site->get('brand.fullName') }}</title>
<meta name="description" content="{{ $meta['description'] ?? '' }}">
<meta property="og:title" content="{{ $meta['title'] ?? '' }}">
<meta property="og:description" content="{{ $meta['description'] ?? '' }}">
<meta property="og:type" content="website">
<meta property="og:image" content="{{ $site->get('brand.logo') }}">
<link rel="icon" href="{{ $site->get('brand.logo') }}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{{ asset('assets/css/site.css') }}">
@stack('head')
</head>
<body>
<div class="preloader"><div class="preloader__mark">mwg</div></div>
@include('partials.header')
@yield('content')
@include('partials.touch')
@include('partials.footer')
<button class="to-top" type="button" aria-label="Back to top">
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="m12 6.8 6.6 6.6-1.4 1.4-4.2-4.2V19h-2v-8.4l-4.2 4.2-1.4-1.4Z"/></svg>
</button>
<script src="{{ asset('assets/js/site.js') }}" defer></script>
</body>
</html>
