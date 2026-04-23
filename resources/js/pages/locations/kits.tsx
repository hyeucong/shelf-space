import type { ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import LocationLayout, { type LocationPageProps } from '@/layouts/location-layout';

export default function LocationKits() {
    const { location } = usePage<LocationPageProps>().props;

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Kits`} />

            <div className="p-4">
                <div className="max-w-3xl">
                    <div className="rounded border bg-background p-6">
                        <h2 className="text-lg font-semibold mb-2">Kits (temporary)</h2>
                        <p className="text-sm text-muted-foreground">This is a placeholder page for location kits.</p>

                        <div className="mt-4">
                            <Link href={`/locations/${location?.id}/kits`} className="text-primary">Open kits URL</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

LocationKits.layout = (page: ReactNode) => (
    <LocationLayout activeTab="kits" children={page} />
);
