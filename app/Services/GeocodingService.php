<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GeocodingService
{
    /**
     * Geocode an address using OpenStreetMap Nominatim.
     * 
     * @param string $address
     * @return array{lat: string, lon: string}|null
     */
    public function geocode(string $address): ?array
    {
        if (empty(trim($address))) {
            return null;
        }

        $cacheKey = 'geocoding:' . md5(trim($address));

        return Cache::remember($cacheKey, now()->addDays(30), function () use ($address) {
            try {
                // Nominatim TOS requires a descriptive User-Agent and max 1 request per second.
                // Caching handles the rate limiting for repeated requests.
                $response = Http::withHeaders([
                    'User-Agent' => config('app.name') . ' (' . config('app.url') . ')',
                ])
                ->timeout(10)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $address,
                    'format' => 'json',
                    'limit' => 1,
                ]);

                if ($response->successful() && isset($response->json()[0])) {
                    $data = $response->json()[0];
                    
                    return [
                        'lat' => (string) $data['lat'],
                        'lon' => (string) $data['lon'],
                    ];
                }

                if ($response->status() === 429) {
                    Log::warning('Nominatim Rate Limit Hit');
                }

            } catch (\Exception $e) {
                Log::error('Geocoding error: ' . $e->getMessage());
                report($e);
            }

            return null;
        });
    }
}
