import { AssetFilterOption, AssetFiltersQuery, AssetQueryBuilder, AssetQueryValue, AssetSavedFilter, AssetSortDraft } from '@/components/asset-query-builder';
import { Head, Link, router } from '@inertiajs/react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { ResourceDeleteDialog } from '@/components/resource-form-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Pencil, Trash2, List as ListIcon, Rows3, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchInput } from '@/components/search-input';
import type { PaginatedData } from '@/types/pagination';

interface Asset {
    id: number;
    category_id: number | null;
    location_id: number | null;
    asset_id: string;
    name: string;
    description: string | null;
    status: string;
    value: number | null;
    created_at: string | null;
    updated_at: string | null;
    category?: {
        id: number;
        name: string;
    } | null;
    location?: {
        id: number;
        name: string;
    } | null;
    tags?: Array<{
        id: number;
        name: string;
    }>;
}

interface PageProps {
    assets: PaginatedData<Asset>;
    categories: AssetFilterOption[];
    locations: AssetFilterOption[];
    savedFilters: AssetSavedFilter[];
    filters: AssetFiltersQuery;
    sorts: AssetSortDraft[];
}

const sanitizeQuery = (query: Record<string, AssetQueryValue>) => (
    Object.fromEntries(
        Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
    ) as Record<string, string | number>
);
export default function Assets({ assets, categories, locations, savedFilters, filters, sorts }: PageProps) {
    const [localAssets, setLocalAssets] = useState<Asset[]>(assets?.data || []);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [tableMode, setTableMode] = useState<'simple' | 'all'>('simple');

    useEffect(() => {
        setLocalAssets(assets?.data || []);
    }, [assets]);

    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => localAssets.some((a) => a.id === id)));
    }, [localAssets]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleOne = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) return Array.from(new Set([...prev, id]));
            return prev.filter((i) => i !== id);
        });
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(localAssets.map((a) => a.id));
        } else {
            setSelectedIds([]);
        }
    };

    const allSelected = localAssets.length > 0 && selectedIds.length === localAssets.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < localAssets.length;

    const closeDeleteDialog = () => {
        setAssetToDelete(null);
    };

    const handleDelete = () => {
        if (!assetToDelete || isDeleting) {
            return;
        }

        const assetId = assetToDelete.id;

        router.delete(`/assets/${assetId}`, {
            preserveScroll: true,
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setLocalAssets((previousAssets) => previousAssets.filter((asset) => asset.id !== assetId));
                setAssetToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handlePerPageChange = (value: string) => {
        router.get('/assets', sanitizeQuery({
            ...filters,
            per_page: value,
            page: 1,
        }), {
            preserveState: true,
            replace: true,
        });
    };

    const formatCurrency = (value: number | null) => {
        if (value === null) {
            return '-';
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(value));
    };

    const formatDate = (value: string | null) => {
        if (!value) {
            return '-';
        }

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(value));
    };

    const renderActionButtons = (asset: Asset) => (
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 border" asChild>
                <Link href={`/assets/${asset.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                </Link>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 border text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setAssetToDelete(asset)}
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </div>
    );

    const isAllTable = tableMode === 'all';
    const hasAssets = localAssets.length > 0;
    const baseTableClassName = isAllTable ? 'min-w-[1100px]' : undefined;
    const selectionColumnClassName = 'w-11 px-3 md:px-4';

    return (
        <>
            <Head title="Assets" />

            <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
                <div className="shrink-0 mt-4">
                    <div className="mb-4 mx-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded border bg-background p-2 shadow-sm min-h-12">
                        <div className="flex flex-1 flex-row flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
                            <div className="flex items-center rounded border bg-background p-1 gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={tableMode === 'simple' ? 'h-7 px-2 shadow-none bg-muted text-foreground' : 'h-7 px-2 shadow-none text-muted-foreground'}
                                    onClick={() => setTableMode('simple')}
                                    title="Simple view"
                                >
                                    <ListIcon size={15} />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={tableMode === 'all' ? 'h-7 px-2 shadow-none bg-muted text-foreground' : 'h-7 px-2 shadow-none text-muted-foreground'}
                                    onClick={() => setTableMode('all')}
                                    title="All data view"
                                >
                                    <Rows3 size={15} />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="shrink-0">
                                    <AssetQueryBuilder
                                        categories={categories}
                                        locations={locations}
                                        savedFilters={savedFilters}
                                        filters={filters}
                                        sorts={sorts}
                                    />
                                </div>
                                <div className="flex flex-1">
                                    <SearchInput
                                        url="/assets"
                                        placeholder="Search assets..."
                                        initialValue={filters?.search}
                                        query={sanitizeQuery({
                                            ...filters,
                                            page: undefined,
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
                            <Button type="button" variant="outline" className="h-9 rounded shadow-none shrink-0">
                                Export selection
                            </Button>
                            <Button type="button" variant="outline" className="h-9 rounded shadow-none shrink-0">
                                Actions
                            </Button>
                        </div>
                    </div>
                </div>

                {hasAssets ? (
                    <div className="mx-4 mb-4 flex flex-1 min-h-0 flex-col overflow-y-auto rounded border bg-background shadow-none">
                        <Table className={baseTableClassName}>
                            <TableHeader>
                                <TableRow className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--color-border)] hover:bg-background">
                                    <TableHead className={selectionColumnClassName}>
                                        <Checkbox
                                            aria-label="Select all"
                                            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                            onCheckedChange={(val) => toggleAll(!!val)}
                                        />
                                    </TableHead>
                                    {isAllTable ? (
                                        <>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Asset ID</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Tags</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                            <TableHead className="hidden xl:table-cell">Created</TableHead>
                                            <TableHead className="hidden xl:table-cell">Updated</TableHead>
                                        </>
                                    ) : (
                                        <>
                                            <TableHead className="w-full">Name</TableHead>
                                            <TableHead className="hidden sm:table-cell sm:w-40">Asset ID</TableHead>
                                            <TableHead className="hidden md:table-cell md:w-32">Status</TableHead>
                                            <TableHead className="w-28 text-right">Value</TableHead>
                                        </>
                                    )}
                                    <TableHead className="w-24 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {localAssets.map((asset) => (
                                    isAllTable ? (
                                        <TableRow key={asset.id}>
                                            <TableCell className={selectionColumnClassName}>
                                                <Checkbox
                                                    aria-label={`Select ${asset.name}`}
                                                    checked={selectedIds.includes(asset.id)}
                                                    onCheckedChange={(val) => toggleOne(asset.id, !!val)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium text-muted-foreground">{asset.id}</TableCell>
                                            <TableCell className="min-w-48 whitespace-normal font-semibold text-foreground">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded border bg-muted/10 flex items-center justify-center overflow-hidden">
                                                        {
                                                            // If you add an image URL to assets in future, set `asset.image_url`.
                                                            (asset as any).image_url ? (
                                                                <img src={(asset as any).image_url} alt={asset.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Camera className="text-muted-foreground" size={18} />
                                                            )
                                                        }
                                                    </div>
                                                    <Link href={`/assets/${asset.id}/overview`} className="line-clamp-2 hover:underline">{asset.name}</Link>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-muted-foreground">{asset.asset_id}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{asset.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="min-w-32 whitespace-normal">
                                                    <div>{asset.category?.name || '-'}</div>
                                                    {asset.category_id ? (
                                                        <div className="text-xs text-muted-foreground">{`ID ${asset.category_id}`}</div>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="min-w-32 whitespace-normal">
                                                    <div>{asset.location?.name || '-'}</div>
                                                    {asset.location_id ? (
                                                        <div className="text-xs text-muted-foreground">{`ID ${asset.location_id}`}</div>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-40 whitespace-normal">
                                                {asset.tags && asset.tags.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {asset.tags.map((tag) => (
                                                            <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="min-w-56 max-w-80 whitespace-normal text-muted-foreground">
                                                {asset.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium whitespace-nowrap">{formatCurrency(asset.value)}</TableCell>
                                            <TableCell className="hidden xl:table-cell whitespace-nowrap">{formatDate(asset.created_at)}</TableCell>
                                            <TableCell className="hidden xl:table-cell whitespace-nowrap">{formatDate(asset.updated_at)}</TableCell>
                                            <TableCell className="text-right">{renderActionButtons(asset)}</TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow key={asset.id}>
                                            <TableCell className={selectionColumnClassName}>
                                                <Checkbox
                                                    aria-label={`Select ${asset.name}`}
                                                    checked={selectedIds.includes(asset.id)}
                                                    onCheckedChange={(val) => toggleOne(asset.id, !!val)}
                                                />
                                            </TableCell>
                                            <TableCell className="w-full min-w-0 font-semibold">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded border bg-muted/10 flex items-center justify-center overflow-hidden">
                                                        {
                                                            (asset as any).image_url ? (
                                                                <img src={(asset as any).image_url} alt={asset.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Camera className="text-muted-foreground" size={18} />
                                                            )
                                                        }
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link href={`/assets/${asset.id}/overview`} className="block truncate hover:underline sm:whitespace-normal sm:truncate-none">{asset.name}</Link>
                                                        <div className="mt-1 text-xs text-muted-foreground sm:hidden">{asset.asset_id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell sm:w-40 font-medium text-muted-foreground whitespace-nowrap">{asset.asset_id}</TableCell>
                                            <TableCell className="hidden md:table-cell md:w-32 whitespace-nowrap">
                                                <span className="capitalize">{asset.status}</span>
                                            </TableCell>
                                            <TableCell className="w-28 text-right font-medium whitespace-nowrap">{formatCurrency(asset.value)}</TableCell>
                                            <TableCell className="w-24 text-right">{renderActionButtons(asset)}</TableCell>
                                        </TableRow>
                                    )
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="mx-4 mb-4 flex flex-1 items-center justify-center rounded border border-dashed bg-background p-6 text-center shadow-sm">
                        <div className="mx-auto max-w-lg space-y-1">
                            <h3 className="text-2xl font-bold tracking-tight">No assets yet</h3>
                            <p className="text-sm text-muted-foreground">You don't have any assets yet. Create your first asset to get started.</p>
                        </div>
                    </div>
                )}

                {hasAssets && (
                    <DataTablePagination
                        pagination={assets}
                        onPerPageChange={handlePerPageChange}
                    />
                )}
            </div>

            <ResourceDeleteDialog
                open={!!assetToDelete}
                onOpenChange={(open) => !open && closeDeleteDialog()}
                title="Delete Asset"
                itemName={assetToDelete?.name}
                itemMeta={assetToDelete?.asset_id}
                warning="Delete this asset only if you are sure it should no longer exist in your inventory records."
                processing={isDeleting}
                onConfirm={handleDelete}
                confirmLabel="Delete asset"
                confirmPendingLabel="Deleting asset..."
                contentClassName="sm:max-w-106.25 rounded-lg"
            />
        </>
    );
}

Assets.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Assets', href: '/assets' }
        ]}
        headerAction={
            <Button className="rounded border-none" asChild>
                <Link href="/assets/create">
                    New asset
                </Link>
            </Button>
        }
    />
);
