import type { ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import LocationLayout, { type LocationPageProps } from '@/layouts/location-layout';

export default function LocationAssets() {
    const { location } = usePage<LocationPageProps>().props;

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Assets`} />

            <div className="p-4">
                <div className="max-w-3xl">
                    <div className="rounded border bg-background p-6">
                        <h2 className="text-lg font-semibold mb-2">Assets (temporary)</h2>
                        <p className="text-sm text-muted-foreground">This is a placeholder page for location assets.</p>

                        <div className="mt-4">
                            <Link href={`/locations/${location?.id}/assets`} className="text-primary">Open assets URL</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

LocationAssets.layout = (page: ReactNode) => (
    <LocationLayout activeTab="assets" children={page} />
);
