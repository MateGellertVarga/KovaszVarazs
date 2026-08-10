<?php

namespace App\Http\Controllers;

use App\Mail\RegistrationAcceptedEmail;
use App\Models\RegistrationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\Response;

class RegistrationRequestController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }

        $requests = RegistrationRequest::orderBy('created_at', 'desc')->get();
        return response()->json($requests);
    }

    public function approve(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }

        $registrationRequest = RegistrationRequest::findOrFail($id);

        try {
            DB::transaction(function () use ($registrationRequest) {
                $existingUser = User::where('email', $registrationRequest->email)->first();
                if ($existingUser) {
                    $existingUser->update(['is_active' => true]);
                } else {
                    User::create([
                        'name'         => $registrationRequest->name,
                        'email'        => $registrationRequest->email,
                        'phone_number' => $registrationRequest->phone_number,
                        'password'     => $registrationRequest->password,
                        'role'         => $registrationRequest->role,
                        'is_active'    => true,
                    ]);
                    Mail::to($registrationRequest->email)->send(new RegistrationAcceptedEmail($registrationRequest->name));
                }
                $registrationRequest->update(['status' => 'approved']);
            });

            return response()->json(['message' => 'A felhasználó sikeresen engedélyezve!']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Hiba történt a jóváhagyás során.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }

        $registrationRequest = RegistrationRequest::findOrFail($id);

        try {
            DB::transaction(function () use ($registrationRequest) {
                $registrationRequest->update(['status' => 'rejected']);
                $user = User::where('email', $registrationRequest->email)->first();
                if ($user) {
                    $user->update(['is_active' => false]);
                    $user->tokens()->delete();
                }
            });
            return response()->json(['message' => 'A felhasználót letiltottuk.']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Hiba történt a letiltás során.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
