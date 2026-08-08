<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRequest;
use App\Models\RegistrationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
