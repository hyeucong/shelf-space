import type { ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AssetLayout, { type AssetPageProps } from '@/layouts/asset-layout';

export default function AssetAnalytics() {
    const { asset } = usePage<AssetPageProps>().props;

    return (
        <>
            <Head title={`${asset?.name || 'Asset'} - Analytics`} />

            <div className="p-4">
                <h2 className="text-lg font-semibold">Analytics (Temporary)</h2>
                <p className="text-sm text-muted-foreground mt-2">Basic analytics placeholder for <strong>{asset?.name}</strong>.</p>
                <div className="mt-4 rounded border p-4 bg-background text-muted-foreground">Analytics scaffolding and charts will go here.</div>
            </div>
        </>
    );
}

AssetAnalytics.layout = (page: ReactNode) => (
    <AssetLayout activeTab="analytics" children={page} />
);
