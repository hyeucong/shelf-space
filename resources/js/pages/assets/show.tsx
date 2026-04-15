import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Badge } from '@/components/ui/badge';

interface AssetType {
    id: number;
    name: string;
    asset_id: string;
    status: string;
    value: number | null;
    description?: string | null;
    category?: { id: number; name: string } | null;
    location?: { id: number; name: string } | null;
    tags?: Array<{ id: number; name: string }>;
    created_at?: string | null;
    updated_at?: string | null;
}

function formatCurrency(value: number | null) {
    if (value === null || typeof value === 'undefined') return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
}

function formatDate(value?: string | null) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function AssetShow({ asset }: { asset: AssetType }) {
    return (
        <>
            <Head title={asset?.name || 'Asset'} />

            <div className="p-6">

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{asset?.name || 'Asset'}</h1>
                        <p className="text-sm text-muted-foreground">{asset?.asset_id || ''}</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded border p-4 bg-background">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Summary</h3>
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
                                <span>{formatCurrency(asset?.value ?? null)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{formatDate(asset?.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Updated</span>
                                <span>{formatDate(asset?.updated_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded border p-4 bg-background">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Details</h3>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div>
                                <div className="text-xs text-muted-foreground">Description</div>
                                <div className="mt-1 text-foreground">{asset?.description || '-'}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Tags</div>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {asset?.tags && asset.tags.length > 0 ? (
                                        asset.tags.map((t) => <Badge key={t.id} variant="outline">{t.name}</Badge>)
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

AssetShow.layout = (page: React.ReactNode & { props: { asset: AssetType } }) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Assets', href: '/assets' },
            { title: page.props.asset?.name || 'Asset', href: '#' }
        ]}
    />
);
