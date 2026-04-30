import type { ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import AssetLayout, { type AssetPageProps } from '@/layouts/asset-layout';

export default function AssetOverview() {
    const { asset } = usePage<AssetPageProps>().props;

    return (
        <>
            <Head title={`${asset?.name || 'Asset'} - Overview`} />
            <div className="p-4 flex-1">
                <div>
                    <div className="rounded border bg-background">
                        <dl className="divide-y">


                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Asset ID</dt>
                                <dd className="text-sm text-foreground ml-4">{asset?.asset_id ?? '-'}</dd>
                            </div>

                            {(asset?.shelf_qr_id || asset?.qr_id || asset?.shelf_qr) && (
                                <div className="flex items-center justify-between px-6 py-4">
                                    <dt className="text-sm text-muted-foreground">Shelf QR ID</dt>
                                    <dd className="text-sm text-foreground ml-4">{asset?.shelf_qr_id ?? asset?.qr_id ?? asset?.shelf_qr}</dd>
                                </div>
                            )}

                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Created</dt>
                                <dd className="text-sm text-foreground ml-4">{asset?.created_at ? new Date(asset.created_at).toLocaleString() : '-'}</dd>
                            </div>

                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Category</dt>
                                <dd className="text-sm ml-4">
                                    {asset?.category?.name ? (
                                        <Badge variant="outline">{asset.category.name}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </>
    );
}

AssetOverview.layout = (page: ReactNode) => (
    <AssetLayout activeTab="overview" children={page} />
);
