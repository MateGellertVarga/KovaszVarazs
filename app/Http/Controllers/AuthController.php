<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Http\Response;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Models\Order;
use App\Models\RegistrationRequest;
use App\Services\FcmService;
use Illuminate\Support\Facades\DB;
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
            'message' => 'A csatlakozási kérelmet rögzítettük! Az adminisztrátor jóváhagyása után tudsz majd belépni.',
        ], Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            $registrationRequest = RegistrationRequest::where('email', $request->email)
                ->orderBy('id', 'desc')
                ->first();

            if ($registrationRequest) {
                if ($registrationRequest->status === 'pending') {
                    return response()->json([
                        'message' => 'Az adott email címhez már tartozik regisztráció, várd meg az admin jóváhagyását, vagy keresd fel üzenetben!'
                    ], 403);
                } elseif ($registrationRequest->status === 'rejected') {
                    return response()->json([
                        'message' => 'Ezzel az email címmel már elutasították a regisztrációt'
                    ], 403);
                }
            }

            return response()->json(['message' => 'Helytelen email cím vagy jelszó'], 400);
        }

        if (!Hash::check($request->password, $user->password)) {
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
        $user?->update(['fcm_token' => null]);

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

    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }
        DB::transaction(function () {
            RegistrationRequest::where('id', 3)->delete();
            RegistrationRequest::where('id', 4)->delete();
        });
        $users = User::all()->makeHidden(['password']);
        return response()->json($users, 200);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'A felhasználó nem található.'], 404);
        }
        $hasOrders = false;
        if (method_exists($user, 'orders') && $user->orders()->exists()) {
            $hasOrders = true;
        } elseif (class_exists(Order::class) && Order::where('user_id', $id)->exists()) {
            $hasOrders = true;
        }

        if ($hasOrders) {
            return response()->json([
                'message' => 'A felhasználó nem törölhető, mert kapcsolódó rendelései vannak az adatbázisban!'
            ], 400);
        }

        try {
            DB::transaction(function () use ($user) {
                RegistrationRequest::where('email', $user->email)->delete();
                $user->delete();
            });

            return response()->json([
                'message' => 'A felhasználó és a hozzá tartozó regisztrációs kérelem sikeresen törölve lett.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Hiba történt a törlés során.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
