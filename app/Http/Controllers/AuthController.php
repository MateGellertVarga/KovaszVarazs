<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Http\Response;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Models\RegistrationRequest;
use App\Services\FcmService;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $registrationRequest = RegistrationRequest::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'phone_number' => $request->phone_number,
            'password'     => Hash::make($request->password),
            'role'         => $request->role,
            'status'       => 'pending'
        ]);

        $admins = User::where('role', 'admin')->whereNotNull('fcm_token')->get();

        foreach ($admins as $admin) {
            try {
                FcmService::sendPushNotification(
                    $admin->fcm_token,
                    'Új csatlakozási kérelem! 🥖',
                    "{$registrationRequest->name} szeretne csatlakozni a vevőidhez.",
                    [
                        'registration_request_id' => $registrationRequest->id,
                        'type' => 'new_registration'
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Push értesítés hiba regisztrációnál: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'A csatlakozási kérelmedet rögzítettük! Az adminisztrátor jóváhagyása után tudsz majd belépni.',
        ], Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Helytelen email cím vagy jelszó'], 400);
        }
        if (!$user->is_active) {
            return response()->json(['message' => 'Ezt a fiókot az adminisztrátor letiltotta.'], 403);
        }


        $token = $user->createToken('token')->plainTextToken;

        return response()
            ->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
                'token' => $token
            ], 200)
            ->header('Set-Cookie', "auth_token={$token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=None; Partitioned");
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user?->tokens()->where('name', 'token')->delete();
        $user->update(['fcm_token' => null]);

        return response()
            ->json(['message' => 'Sikeres kijelentkezés'])
            ->header('Set-Cookie', "auth_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned");
    }

    public function updateFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        $request->user()->update([
            'fcm_token' => $request->fcm_token
        ]);

        return response()->json([
            'message' => 'FCM token sikeresen frissítve.'
        ], 200);
    }


    // public function login(LoginRequest $request)
    // {
    //     $user = User::where('email', $request->email)->first();

    //     if (!$user || !Hash::check($request->password, $user->password)) {
    //         return response()->json(['message' => 'Helytelen email cím vagy jelszó'], 400);
    //     }

    //     $token = $user->createToken('token')->plainTextToken;

    //     $cookie = cookie(
    //         'auth_token',
    //         $token,
    //         60 * 24 * 30, // 30 nap
    //         '/',
    //         null,
    //         true,   // Secure (HTTPS kell)
    //         true,   // HttpOnly
    //         false,  // raw
    //         'none'  // SameSite
    //     );

    //     return response()
    //         ->json([
    //             'id' => $user->id,
    //             'name' => $user->name,
    //             'email' => $user->email,
    //             'phone_number' => $user->phone_number,
    //             'role' => $user->role,
    //             'token' => $token // mobil
    //         ], 200)
    //         ->cookie($cookie);
    // }


    // public function logout(Request $request)
    // {
    //     $user = $request->user();
    //     $user->tokens()->where('name', 'token')->delete();

    //     $cookie = cookie('auth_token', '', -1, '/', null, true, true, false, 'none');

    //     return response()
    //         ->json(['message' => 'Sikeres kijelentkezés'])
    //         ->cookie($cookie);
    // }
}
