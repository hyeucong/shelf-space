import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { destroy, store } from '@/actions/App/Http/Controllers/Locations/LocationActivityController';
import LocationLayout, { type LocationPageProps } from '@/layouts/location-layout';
import { ActivityLog } from '@/components/activity-log';

export default function LocationActivity() {
    const { location, activity = [] } = usePage<LocationPageProps>().props as any;

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Activity`} />
            <ActivityLog
                activity={activity}
                resourceId={location.id}
                storeUrl={store.url(location.id)}
                destroyUrl={(activityId) => destroy.url({ location: location.id, activity: activityId })}
                emptyMessage="No recent activity for this location."
            />
        </>
    );
}

LocationActivity.layout = (page: ReactNode) => (
    <LocationLayout activeTab="activity" children={page} />
);
