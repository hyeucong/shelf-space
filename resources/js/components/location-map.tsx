import { Map, Marker, ZoomControl } from 'pigeon-maps';
import { useAppearance } from '@/hooks/use-appearance';
import type { LocationResource } from '@/layouts/location-layout';

export default function LocationMap({ location }: { location: LocationResource }) {
    const { resolvedAppearance } = useAppearance();

    if (!location?.latitude || !location?.longitude) {
        return null;
    }

    const lat = Number(location.latitude);
    const lon = Number(location.longitude);

    // Pigeon Maps can use custom tile providers. 
    // For a premium look that matches the theme, we can use a provider that supports dark mode if available, 
    // but the default OSM tiles are a solid choice for Pigeon Maps.
    
    return (
        <div className="overflow-hidden rounded border bg-background">
            <div className="border-b bg-muted/50 px-4 py-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Map Preview
                </h3>
            </div>

            <div className="relative h-[300px] w-full grayscale-[0.2] contrast-[0.9] brightness-[0.95] dark:brightness-[0.8] dark:contrast-[1.1]">
                <Map 
                    height={300} 
                    center={[lat, lon]} 
                    defaultZoom={15}
                >
                    <ZoomControl />
                    <Marker 
                        width={40} 
                        anchor={[lat, lon]} 
                        color={resolvedAppearance === 'dark' ? '#3b82f6' : '#2563eb'}
                    />
                </Map>
            </div>

            <div className="border-t bg-muted/50 px-4 py-2 text-right">
                <a
                    href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-medium"
                >
                    View on OpenStreetMap
                </a>
            </div>
        </div>
    );
}
