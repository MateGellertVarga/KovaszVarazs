<?php

namespace App\Http\Controllers;

use App\Models\RegistrationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        if ($registrationRequest->status === 'approved') {
            return response()->json(['message' => 'Ez a kérelem már jóvá lett hagyva.'], 400);
        }

        try {
            DB::transaction(function () use ($registrationRequest) {
                User::create([
                    'name'         => $registrationRequest->name,
                    'email'        => $registrationRequest->email,
                    'phone_number' => $registrationRequest->phone_number,
                    'password'     => $registrationRequest->password,
                    'role'         => $registrationRequest->role,
                ]);

                $registrationRequest->update(['status' => 'approved']);
            });

            return response()->json(['message' => 'A felhasználó sikeresen jóváhagyva és a fiók létrejött!']);
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

        if ($registrationRequest->status === 'approved' || $registrationRequest->status === 'rejected') {
            return response()->json(['message' => 'Ez a kérelem már el lett bírálva.'], 400);
        }

        $registrationRequest->update(['status' => 'rejected']);

        return response()->json(['message' => 'A csatlakozási kérelem elutasítva.']);
    }
}
