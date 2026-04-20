import type { ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import AssetLayout, { type AssetPageProps } from '@/layouts/asset-layout';

export default function AssetOverview() {
    const { asset } = usePage<AssetPageProps>().props;

    return (
        <>
            <Head title={`${asset?.name || 'Asset'} - Overview`} />

            <div className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded border bg-background p-4">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span><Badge variant="outline" className="capitalize">{asset?.status || '-'}</Badge></span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category</span>
                                <span>{asset?.category?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Location</span>
                                <span>{asset?.location?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Value</span>
                                <span>{asset?.value ?? '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Updated</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded border bg-background p-4">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Details</h3>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div>
                                <div className="text-xs text-muted-foreground">Description</div>
                                <div className="mt-1 text-foreground">{asset?.description || '-'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Tags</div>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {asset?.tags && asset.tags.length > 0 ? (
                                        asset.tags.map((tag) => (
                                            <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

AssetOverview.layout = (page: ReactNode) => (
    <AssetLayout activeTab="overview" children={page} />
);
