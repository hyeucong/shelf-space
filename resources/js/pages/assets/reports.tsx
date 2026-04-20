import type { ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AssetLayout, { type AssetPageProps } from '@/layouts/asset-layout';

export default function AssetReports() {
    const { asset } = usePage<AssetPageProps>().props;

    return (
        <>
            <Head title={`${asset?.name || 'Asset'} - Reports`} />

            <div className="p-4">
                <h2 className="text-lg font-semibold">Reports (Temporary)</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Reporting placeholder for <strong>{asset?.name}</strong>.
                </p>
                <div className="mt-4 rounded border bg-background p-4 text-muted-foreground">
                    Export and report views will live here.
                </div>
            </div>
        </>
    );
}

AssetReports.layout = (page: ReactNode) => (
    <AssetLayout activeTab="reports" children={page} />
);
