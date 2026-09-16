<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use App\Support\Website\CmsStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Hostinger/PHP studio entry. Full Creative Project Builder lives on Node (`server.cjs`)
 * and writes the same cms.json this public site reads.
 */
class StudioGatewayController extends Controller
{
    public function login(Request $request): Response|RedirectResponse
    {
        if ($request->session()->get('kite_studio')) {
            return redirect('/studio');
        }

        return response($this->loginHtml($request->query('error')));
    }

    public function authenticate(Request $request): RedirectResponse
    {
        $email = (string) $request->input('email');
        $password = (string) $request->input('password');
        $expectedEmail = 'studio@kiteagency-eg.com';
        $expectedPassword = (string) env('STUDIO_PASSWORD', 'kite-studio');

        if ($email === $expectedEmail && hash_equals($expectedPassword, $password)) {
            $request->session()->put('kite_studio', true);
            $request->session()->regenerate();

            return redirect('/studio');
        }

        return redirect('/studio/login?error=Wrong+email+or+password');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget('kite_studio');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/studio/login');
    }

    public function dashboard(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->get('kite_studio')) {
            return redirect('/studio/login');
        }

        $stats = CmsStore::stats();

        return response($this->dashboardHtml($stats));
    }

    public function unavailable(Request $request): RedirectResponse|Response
    {
        if (! $request->session()->get('kite_studio')) {
            return redirect('/studio/login');
        }

        $stats = CmsStore::stats();

        return response($this->dashboardHtml($stats, true));
    }

    private function loginHtml(?string $error): string
    {
        $err = $error ? '<div class="error">'.e($error).'</div>' : '';
        $token = csrf_token();

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in · KITE Studio</title>
  <link rel="stylesheet" href="/assets/css/studio.css?v=1">
</head>
<body class="login-wrap">
  <form class="login-card" method="post" action="/studio/login">
    <input type="hidden" name="_token" value="{$token}">
    <div class="sub">Website content</div>
    <h1>KITE</h1>
    <p class="lede">Manage the public website. This is not AgencyOS.</p>
    {$err}
    <div class="form-grid" style="grid-template-columns:1fr">
      <label>Email<input type="email" name="email" required value="studio@kiteagency-eg.com"></label>
      <label>Password<input type="password" name="password" required></label>
    </div>
    <button class="btn" type="submit" style="margin-top:18px">Enter</button>
  </form>
</body>
</html>
HTML;
    }

    private function dashboardHtml(array $stats, bool $builderNote = false): string
    {
        $note = $builderNote
            ? '<p class="note">The full Creative Project Builder (section presets, media upload, publish workflow) runs on the Node website process (<code>node server.cjs</code>) and writes the same <code>cms.json</code> this public site reads.</p>'
            : '<p class="note">'.($stats['missing_email'] ? 'Email is CONTENT_REQUIRED. ' : '').($stats['missing_address'] ? 'Street address is CONTENT_REQUIRED.' : '').'</p>';

        return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dashboard · KITE Studio</title><link rel="stylesheet" href="/assets/css/studio.css?v=1"></head><body><div class="studio-shell"><aside class="studio-side"><div class="mark">kite</div><div class="sub">Website content · not AgencyOS</div><nav><a href="/studio" class="is-on">Dashboard</a><a href="/home" target="_blank">View public site</a><form method="post" action="/studio/logout"><input type="hidden" name="_token" value="'.e(csrf_token()).'"><button class="linkish" type="submit">Sign out</button></form></nav></aside><main class="studio-main"><h1>Website content</h1><p class="lede">This PHP gateway reads the same CMS store as the public site. Draft and archived items stay off the public site.</p>'.$note.'<div class="stat-grid"><div class="stat"><strong>'.(int) $stats['published_projects'].'</strong><span>Published projects</span></div><div class="stat"><strong>'.(int) $stats['draft_projects'].'</strong><span>Draft projects</span></div><div class="stat"><strong>'.(int) $stats['published_services'].'</strong><span>Live services</span></div><div class="stat"><strong>'.(int) $stats['published_case_studies'].'</strong><span>Case studies live</span></div><div class="stat"><strong>'.(int) $stats['published_clients'].'</strong><span>Clients live</span></div><div class="stat"><strong>'.(int) $stats['media'].'</strong><span>Media files</span></div></div></main></div></body></html>';
    }
}
