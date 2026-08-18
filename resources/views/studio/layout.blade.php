<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light">
  <title>@yield('title') · KITE Studio</title>
  <link rel="icon" href="/assets/kite/preloader/logo-icon.svg"><link rel="stylesheet" href="/assets/css/studio.css?v=3">
</head>
<body>
<div class="studio-shell">
  <aside class="studio-side">
    <div class="mark">kite</div><div class="sub">Website content · PHP Studio</div>
    <nav>
      @foreach([['studio.dashboard','Dashboard','dashboard'],['studio.homepage','Homepage','homepage'],['studio.projects','Projects','projects'],['studio.services','Services','services'],['studio.clients','Clients / Kites','clients'],['studio.media','Media','media'],['studio.contact','Contact & SEO','contact']] as [$route,$label,$key])
        <a href="{{ route($route) }}" class="{{ ($active ?? '') === $key ? 'is-on' : '' }}">{{ $label }}</a>
      @endforeach
      <a href="/home" target="_blank" rel="noopener">View public site</a>
      <form method="post" action="{{ route('studio.logout') }}">@csrf<button class="linkish" type="submit">Sign out</button></form>
    </nav>
  </aside>
  <main class="studio-main">
    @if(session('status'))<div class="flash">{{ session('status') }}</div>@endif
    @if($errors->any())<div class="error"><strong>Please fix the following:</strong><ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>@endif
    @yield('content')
  </main>
</div>
</body></html>
