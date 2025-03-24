<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;
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
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.']
            ]);
        }

        $accessToken = $user->createToken('access_token', ['access'], now()->addHour())->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['refresh'])->plainTextToken;

        return response()->json([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type'   => 'Bearer',
        ]);
    }

    public function refresh(Request $request)
    {
        $refreshToken = $request->bearerToken();

        if (!$refreshToken) {
            return response()->json(['error' => 'Refresh token required'], 401);
        }

        $token = PersonalAccessToken::findToken($refreshToken);
        if (!$token || !$token->can('refresh')) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }

        $user = $token->tokenable;

        $newAccessToken = $user->createToken('access_token', ['access'], now()->addHour())->plainTextToken;

        return response()->json([
            'access_token' => $newAccessToken,
            'token_type'   => 'Bearer',
        ]);
    }




    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->where('name', 'refresh_token')->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
