import { useAppearance } from '@/hooks/use-appearance';
import type { LocationResource } from '@/layouts/location-layout';

export default function LocationMap({ location }: { location: LocationResource }) {
    const { resolvedAppearance } = useAppearance();

    if (!location?.latitude || !location?.longitude) {
        return null;
    }

    const lat = Number(location.latitude);
    const lon = Number(location.longitude);
    const apiKey = import.meta.env.VITE_STADIA_MAPS_API_KEY;

    // Use Stadia Maps if API key is present, otherwise fallback to OSM iframe
    const mapTheme = resolvedAppearance === 'dark' ? 'alidade_smooth_dark' : 'alidade_smooth';

    // Stadia Maps static v1 API supports markers and more options
    // Marker color: using a shade of primary/blue for light, and a lighter blue for dark
    const markerColor = resolvedAppearance === 'dark' ? '3b82f6' : '2563eb'; // blue-500 and blue-600

    const stadiaUrl = apiKey
        ? `https://api.stadiamaps.com/static/v1?style=${mapTheme}&center=${lat},${lon}&zoom=15&width=600&height=300&scale=2&markers=color:${markerColor}|${lat},${lon}&api_key=${apiKey}`
        : null;

    return (
        <div className="overflow-hidden rounded border bg-background">
            {/* Header - Kept original styles */}
            <div className="border-b bg-muted/50 px-4 py-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Map Preview
                </h3>
            </div>

            <div className="relative h-75 w-full">
                {stadiaUrl ? (
                    <img
                        src={stadiaUrl}
                        alt="Location Map"
                        className="h-full w-full object-cover grayscale-[0.1] contrast-[0.95]"
                        onError={(e) => {
                            // If Stadia fails (e.g. invalid API key), we hide the image
                            // In a real app, we might fallback to OSM here too
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <iframe
                        title="Location Map"
                        width="100%"
                        height="300"
                        style={{ border: 0, overflow: 'hidden' }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.005},${lat - 0.005},${lon + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lon}`}
                        className="grayscale-[0.2] contrast-[0.9]"
                    />
                )}
            </div>

            {/* Footer - Background color updated to match header */}
            <div className="border-t bg-muted/50 px-4 py-2 text-right">
                <a
                    href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                >
                    View on OpenStreetMap
                </a>
            </div>
        </div>
    );
}
