<?php

namespace App\Services;

use Google\Client as GoogleClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    public static function sendPushNotification($fcmToken, $title, $body, $data = [])
    {
        try {
            $credentialsPath = storage_path('app/firebase.json');

            if (!file_exists($credentialsPath)) {
                Log::error('Firebase credentials file missing at: ' . $credentialsPath);
                return false;
            }

            $client = new GoogleClient();
            $client->setAuthConfig($credentialsPath);
            $client->addScope('https://www.googleapis.com/auth/firebase.messaging');
            $client->fetchAccessTokenWithAssertion();
            $accessToken = $client->getAccessToken()['access_token'];

            $credentials = json_decode(file_get_contents($credentialsPath), true);
            $projectId = $credentials['project_id'];

            $payload = [
                'message' => [
                    'token' => $fcmToken,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => array_map('strval', $data),
                    'android' => [
                        'notification' => [
                            'sound' => 'default',
                        ]
                    ]
                ]
            ];

            $response = Http::withToken($accessToken)
                ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", $payload);

            if ($response->successful()) {
                Log::info("Push notification sikeresen kiküldve: " . $fcmToken);
                return true;
            }

            Log::error("FCM API hiba: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("Hiba történt a Push Notification küldése közben: " . $e->getMessage());
            return false;
        }
    }
}
