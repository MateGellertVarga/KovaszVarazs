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

        //$accessToken = $user->createToken('access_token', ['access'], now()->addHour())->plainTextToken;
        $refreshToken = $user->createToken('token')->plainTextToken;

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'role' => $user->role,
            //'access_token' => $accessToken,
            'token' => $refreshToken
        ], 200);
    }

    // public function refresh(Request $request)
    // {
    //     $refreshToken = $request->bearerToken();

    //     if (!$refreshToken) {
    //         return response()->json(['message' => 'Hiba! Hiáynzó token'], 401);
    //     }

    //     $token = PersonalAccessToken::findToken($refreshToken);
    //     if (!$token || !$token->can('refresh')) {
    //         return response()->json(['message' => 'Érvenytelen token'], 401);
    //     }

    //     $user = $token->tokenable;

    //     $newAccessToken = $user->createToken('access_token', ['access'], now()->addHour())->plainTextToken;

    //     return response()->json([
    //         'access_token' => $newAccessToken,
    //         'token_type'   => 'Bearer',
    //     ]);
    // }




    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->where('name', 'token')->delete();
        return response()->json(['message' => 'Sikeres kijelentkezés']);
    }
}
