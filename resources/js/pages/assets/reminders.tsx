import type { ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AssetLayout, { type AssetPageProps } from '@/layouts/asset-layout';

export default function AssetReminders() {
    const { asset } = usePage<AssetPageProps>().props;

    return (
        <>
            <Head title={`${asset?.name || 'Asset'} - Reminders`} />

            <div className="p-4">
                <h2 className="text-lg font-semibold">Reminders (Temporary)</h2>
                <p className="text-sm text-muted-foreground mt-2">Reminders placeholder for <strong>{asset?.name}</strong>.</p>
                <div className="mt-4 rounded border p-4 bg-background text-muted-foreground">Create and view reminders related to this asset.</div>
            </div>
        </>
    );
}

AssetReminders.layout = (page: ReactNode) => (
    <AssetLayout activeTab="reminders" children={page} />
);
