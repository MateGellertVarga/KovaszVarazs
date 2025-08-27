<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Http\Response;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'phone_number' => $request->phone_number,
            'password'     => Hash::make($request->password),
            'role'         => $request->role
        ]);

        return response()->json([
            'message' => 'Registration successful.',
        ], Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Helytelen email cím vagy jelszó'], 400);
        }

        $token = $user->createToken('token')->plainTextToken;

        $cookie = cookie(
            'auth_token',
            $token,
            60 * 24 * 30, // 30 nap
            '/',
            null,
            true,   // Secure (HTTPS kell)
            true,   // HttpOnly
            false,  // raw
            'none'  // SameSite
        );

        return response()
            ->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
                'token' => $token // mobil
            ], 200)
            ->cookie($cookie);
    }


    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->where('name', 'token')->delete();

        $cookie = cookie('auth_token', '', -1, '/', null, true, true, false, 'none');

        return response()
            ->json(['message' => 'Sikeres kijelentkezés'])
            ->cookie($cookie);
    }
}
