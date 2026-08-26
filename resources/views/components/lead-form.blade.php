@props(['id' => 'form'])
@php $site = app(\App\Support\SiteData::class); @endphp
<form class="lead-form" method="POST" action="{{ route('lead') }}" data-mock-form>
  @csrf
  <div class="form-grid">
    <div class="field">
      <label for="{{ $id }}-name">Name <span class="req">*</span></label>
      <input id="{{ $id }}-name" name="name" type="text" required placeholder="Your name" value="{{ old('name') }}">
    </div>
    <div class="field">
      <label for="{{ $id }}-email">Email <span class="req">*</span></label>
      <input id="{{ $id }}-email" name="email" type="email" required placeholder="you@company.com" value="{{ old('email') }}">
    </div>
    <div class="field">
      <label for="{{ $id }}-business">Type of business <span class="req">*</span></label>
      <input id="{{ $id }}-business" name="business" type="text" required placeholder="Industry" value="{{ old('business') }}">
    </div>
    <div class="field">
      <label for="{{ $id }}-mobile">Mobile no. <span class="req">*</span></label>
      <input id="{{ $id }}-mobile" name="mobile" type="tel" required placeholder="+20" value="{{ old('mobile') }}">
    </div>
    <div class="field field--full">
      <label>Services <span class="req">*</span></label>
      <div class="multiselect">
        <button type="button" class="multiselect__toggle"><span class="multiselect__label">Select Services</span></button>
        <div class="multiselect__panel">
          <label class="check check--all"><input type="checkbox"> Select All</label>
          @foreach ($site->get('serviceOptions') as $option)
            <label class="check"><input type="checkbox" name="services[]" value="{{ $option }}"> {{ $option }}</label>
          @endforeach
        </div>
      </div>
    </div>
    <div class="field field--full">
      <div class="captcha">
        <span class="captcha__box"><input type="checkbox" aria-label="I'm not a robot"><i></i></span>
        <span class="captcha__label">I'm not a robot</span>
        <span class="captcha__brand">reCAPTCHA<br>Privacy - Terms</span>
      </div>
    </div>
    <div class="field field--full">
      <button class="btn btn--solid" type="submit"><span>Submit</span></button>
    </div>
  </div>
  @error('email') <p class="form-note" style="color:#ff7a8a">{{ $message }}</p> @enderror
  <div @class(['form-success', 'is-visible' => session('lead_sent')])>
    Thanks — your message has been received. Our team will get back to you shortly.
  </div>
</form>
