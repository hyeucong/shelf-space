import type { ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AssetLayout, { type AssetPageProps } from '@/layouts/asset-layout';

export default function AssetActivity() {
    const { asset } = usePage<AssetPageProps>().props;

    return (
        <>
            <Head title={`${asset?.name || 'Asset'} - Activity`} />

            <div className="p-4">
                <h2 className="text-lg font-semibold">Activity (Temporary)</h2>
                <p className="text-sm text-muted-foreground mt-2">Activity placeholder for <strong>{asset?.name}</strong>.</p>
                <div className="mt-4 rounded border p-4 bg-background text-muted-foreground">Recent activity and timeline will go here.</div>
            </div>
        </>
    );
}

AssetActivity.layout = (page: ReactNode) => (
    <AssetLayout activeTab="activity" children={page} />
);
