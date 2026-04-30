import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { destroy, store } from '@/actions/App/Http/Controllers/Assets/AssetActivityController';
import AssetLayout from '@/layouts/asset-layout';
import type { AssetPageProps } from '@/layouts/asset-layout';
import { ActivityLog } from '@/components/activity-log';

export default function AssetActivity() {
    const { asset, activity = [] } = usePage<AssetPageProps & { activity?: any[] }>().props;

    return (
        <>
            <Head title={`${asset?.name || 'Asset'} - Activity`} />
            <ActivityLog
                activity={activity}
                resourceId={asset.id}
                storeUrl={store.url(asset.id)}
                destroyUrl={(activityId) => destroy.url({ asset: asset.id, activity: activityId })}
                emptyMessage="No recent activity for this asset."
            />
        </>
    );
}

AssetActivity.layout = (page: ReactNode) => (
    <AssetLayout activeTab="activity" children={page} />
);
