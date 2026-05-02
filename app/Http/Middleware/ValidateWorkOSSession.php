<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS as BaseMiddleware;

class ValidateWorkOSSession extends BaseMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Bypass WorkOS session validation for the demo user
        if (auth()->check() && auth()->user()->email === 'demo@shelfspace.com') {
            return $next($request);
        }

        return parent::handle($request, $next);
    }
}
