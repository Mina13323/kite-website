@extends('layouts.app')

@section('content')
<x-page-hero title="Portfolio"
  intro="Campaigns, films, activations and platforms delivered for brands across Egypt, the GCC and beyond."
  :trail="[['label' => 'Home', 'href' => '/home'], ['label' => 'Portfolio']]" />

<section class="section">
  <div class="container"><x-portfolio-block /></div>
</section>
@endsection
