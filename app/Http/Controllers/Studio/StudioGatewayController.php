<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Authentication entry point for the Hostinger/PHP Studio. */
class StudioGatewayController extends Controller
{
    public function login(Request $request): Response|RedirectResponse
    {
        if ($request->session()->get('kite_studio')) {
            return redirect()->route('studio.dashboard');
        }

        return response($this->loginHtml($request->query('error')));
    }

    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'max:500'],
        ]);
        $expectedEmail = (string) env('STUDIO_EMAIL', 'studio@kiteagency-eg.com');
        $expectedPassword = (string) env('STUDIO_PASSWORD', 'kite-studio');

        if (hash_equals($expectedEmail, $credentials['email']) && hash_equals($expectedPassword, $credentials['password'])) {
            $request->session()->regenerate();
            $request->session()->put('kite_studio', true);

            return redirect()->route('studio.dashboard');
        }

        return redirect()->route('studio.login', ['error' => 'Wrong email or password']);
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('studio.login');
    }

    private function loginHtml(?string $error): string
    {
        $message = $error ? '<div class="error">'.e($error).'</div>' : '';
        $token = csrf_token();
        $email = e((string) env('STUDIO_EMAIL', 'studio@kiteagency-eg.com'));

        return <<<HTML
<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in · KITE Studio</title><link rel="stylesheet" href="/assets/css/studio.css?v=3"></head>
<body class="login-wrap"><form class="login-card" method="post" action="/studio/login">
<input type="hidden" name="_token" value="{$token}"><div class="sub">Website content</div><h1>KITE</h1>
<p class="lede">Manage the public website from Hostinger.</p>{$message}
<div class="form-grid" style="grid-template-columns:1fr"><label>Email<input type="email" name="email" required value="{$email}"></label><label>Password<input type="password" name="password" required autocomplete="current-password"></label></div>
<button class="btn" type="submit" style="margin-top:18px">Enter Studio</button></form></body></html>
HTML;
    }
}
