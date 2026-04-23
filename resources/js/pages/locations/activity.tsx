import type { ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import LocationLayout, { type LocationPageProps } from '@/layouts/location-layout';

export default function LocationActivity() {
    const { location } = usePage<LocationPageProps>().props;

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Activity`} />

            <div className="p-4">
                <div className="max-w-3xl">
                    <div className="rounded border bg-background p-6">
                        <h2 className="text-lg font-semibold mb-2">Activity (temporary)</h2>
                        <p className="text-sm text-muted-foreground">This is a placeholder page for location activity.</p>

                        <div className="mt-4">
                            <Link href={`/locations/${location?.id}/activity`} className="text-primary">Open activity URL</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

LocationActivity.layout = (page: ReactNode) => (
    <LocationLayout activeTab="activity" children={page} />
);
