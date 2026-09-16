<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function create(): View
    {
        return view('studio.login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, true)) {
            return back()->withErrors(['email' => 'These credentials do not match website content access.']);
        }

        $request->session()->regenerate();

        $user = $request->user();
        if (! in_array($user?->role, ['content_manager', 'admin'], true)) {
            Auth::logout();

            return back()->withErrors(['email' => 'Website content managers only.']);
        }

        return redirect()->intended(route('studio.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('studio.login');
    }
}
