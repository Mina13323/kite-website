<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudioSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->get('kite_studio')) {
            return redirect()->route('studio.login');
        }

        return $next($request);
    }
}
