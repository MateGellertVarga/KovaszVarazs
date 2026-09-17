<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRequest;
use App\Models\RegistrationRequest;
use App\Models\User;
use Carbon\Carbon;
use Google\Service\Directory\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetEmail;

class UserController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        if ($user->id !== $request->user()->id) {
            return response()->json(['message' => 'Más adatát nincs jogod elérni'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
        ]);
    }


    public function update(UpdateUserRequest $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $validated = $request->validated();

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
        ]);
    }

    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }

        $users = User::where('role', '!=', 'admin')->get();
        return response()->json($users);
    }

    public function deactivate(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }

        $targetUser = User::findOrFail($id);

        DB::transaction(function () use ($targetUser) {
            $targetUser->update(['is_active' => false]);
            $targetUser->tokens()->delete();

            $regRequest = RegistrationRequest::where('email', $targetUser->email)->first();
            if ($regRequest) {
                $regRequest->update(['status' => 'rejected']);
            }
        });

        return response()->json(['message' => 'A felhasználót sikeresen letiltottuk.']);
    }

    public function sendPasswordResetEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'A felhasználó nem található.'], 404);
        }

        $token = String::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $token,
                'created_at' => Carbon::now()
            ]
        );

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:8100');
        $resetUrl = $frontendUrl . '/uj-jelszo?token=' . $token . '&email=' . urlencode($user->email);

        Mail::to($user->email)->send(new PasswordResetEmail($user->name, $resetUrl));

        return response()->json([
            'message' => 'Jelszó visszaállítási e-mail elküldve!',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'newPassword' => 'required|string|min:6',
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$resetRecord) {
            return response()->json(['message' => 'Érvénytelen vagy lejárt token!'], 400);
        }

        $createdAt = Carbon::parse($resetRecord->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'A visszaállítási link lejárt, kérj újat!'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->newPassword);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Jelszó sikeresen visszaállítva!',
        ]);
    }

    public function toggleReminder(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }

        $targetUser = User::findOrFail($id);
        $targetUser->wants_reminder = !$targetUser->wants_reminder;
        $targetUser->save();

        return response()->json([
            'message' => 'Emlékeztető státusz frissítve.',
            'wants_reminder' => $targetUser->wants_reminder
        ], 200);
    }
}
