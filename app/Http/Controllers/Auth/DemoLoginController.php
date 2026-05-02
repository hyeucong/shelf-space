<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DemoLoginController extends Controller
{
    public function store(Request $request)
    {
        // 1. Find the seeded demo user (Ensure this email actually exists in your DB)
        $demoUser = User::where('email', 'demo@shelfspace.com')->firstOrFail();

        // 2. Force log them in without a password
        Auth::login($demoUser);
        
        // 3. Secure the session
        $request->session()->regenerate();

        // 4. Send them into the app. Your WorkOS/Workspace middleware 
        // will naturally pick up their Auth state from here.
        return redirect()->intended(route('dashboard'));
    }
}
