import type { ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import LocationLayout, { type LocationPageProps } from '@/layouts/location-layout';
import { Badge } from '@/components/ui/badge';

export default function LocationActivity() {
    const { location } = usePage<LocationPageProps>().props;

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Activity`} />

            <div className="p-4">
                <div className="max-w-3xl">
                    <div className="rounded border bg-background p-2 flex items-center gap-2">
                        <Badge variant="outline">Activity</Badge>
                        <p className='text-sm'>John Doe removed Vlog Compact Sony ZV-E10 from 12321.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

LocationActivity.layout = (page: ReactNode) => (
    <LocationLayout activeTab="activity" children={page} />
);
