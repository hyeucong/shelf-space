import { Head, Link, router } from '@inertiajs/react';
import { DataTablePagination } from '@/components/data-table-pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Pencil, Trash2, Filter, ArrowUpDown, List as ListIcon, Bookmark, Rows3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchInput } from '@/components/search-input';
import type { PaginatedData } from '@/types/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    filters: {
        search?: string;
        per_page?: string | number;
        sort?: string;
        order?: 'asc' | 'desc';
        status?: string;
    };
}

export default function Assets({ assets, filters }: PageProps) {
    // Local state for optimistic updates
    const [localAssets, setLocalAssets] = useState<Asset[]>(assets?.data || []);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [tableMode, setTableMode] = useState<'simple' | 'all'>('simple');

    // Sync local state when props change (after server refresh)
    useEffect(() => {
        setLocalAssets(assets?.data || []);
    }, [assets]);

    // Ensure selection stays in-sync when the assets list changes
    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => localAssets.some((a) => a.id === id)));
    }, [localAssets]);

    // Selection state for rows
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
        router.get('/assets', {
            ...filters,
            per_page: value,
            page: 1 // Reset to first page when changing per page
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSortChange = (value: string) => {
        const [sort, order] = value.split(':');
        router.get('/assets', {
            ...filters,
            sort,
            order,
            page: 1
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleFilterChange = (value: string) => {
        router.get('/assets', {
            ...filters,
            status: value === 'all' ? undefined : value,
            page: 1
        }, {
            preserveState: true,
            replace: true
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

    return (
        <>
            <Head title="Assets" />

            <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
                {/* Filter Options Toolbar */}
                <div className="shrink-0 mb-4 mx-4 mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded border bg-background p-2 shadow-sm min-h-12">
                    <div className="flex flex-1 flex-row flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0">
                                    <Filter size={16} /> Filter
                                    {filters?.status && (
                                        <span className="ml-1 rounded-full bg-primary w-1.5 h-1.5" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={filters?.status || 'all'}
                                    onValueChange={handleFilterChange}
                                >
                                    <DropdownMenuRadioItem value="all">All Assets</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="available">Available</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="assigned">Assigned</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="maintenance">In Maintenance</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="retired">Retired</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0">
                                    <ArrowUpDown size={16} /> Sort
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={`${filters?.sort || 'created_at'}:${filters?.order || 'desc'}`}
                                    onValueChange={handleSortChange}
                                >
                                    <DropdownMenuRadioItem value="created_at:desc">Newest</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="created_at:asc">Oldest</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="name:asc">Name (A-Z)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="name:desc">Name (Z-A)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="value:desc">Value (Highest)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="value:asc">Value (Lowest)</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                        <div className="flex">
                            <SearchInput
                                url="/assets"
                                placeholder="Search assets..."
                                initialValue={filters?.search}
                            />
                        </div>

                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
                        <Button variant="outline" className="h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0">
                            <Bookmark size={16} /> Saved Filters
                        </Button>
                    </div>
                </div>

                {/* Scrollable Table Area */}
                <div className="flex-1 overflow-y-auto mx-4 mb-4 rounded border shadow-none bg-background flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Assets</h2>
                            <p className="text-sm text-muted-foreground">
                                {localAssets?.length || 0} asset{localAssets?.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="rounded shadow-none">
                                Export selection
                            </Button>
                            <Button variant="outline" className="rounded shadow-none">
                                Actions
                            </Button>
                        </div>
                    </div>

                    <Table className={isAllTable ? 'min-w-330' : undefined}>
                        <TableHeader className="bg-background">
                            <TableRow className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--color-border)] hover:bg-background">
                                <TableHead className="w-12.5">
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
                                        <TableHead>Value</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                    </>
                                ) : (
                                    <>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Asset ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Value</TableHead>
                                    </>
                                )}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localAssets && localAssets.length > 0 ? (
                                localAssets.map((asset) => (
                                    isAllTable ? (
                                        <TableRow key={asset.id}>
                                            <TableCell>
                                                <Checkbox
                                                    aria-label={`Select ${asset.name}`}
                                                    checked={selectedIds.includes(asset.id)}
                                                    onCheckedChange={(val) => toggleOne(asset.id, !!val)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium text-muted-foreground">{asset.id}</TableCell>
                                            <TableCell className="min-w-55 max-w-80 whitespace-normal font-semibold">
                                                <Link href={`/assets/${asset.id}`} className="hover:underline">{asset.name}</Link>
                                            </TableCell>
                                            <TableCell className="font-medium text-muted-foreground">{asset.asset_id}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{asset.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="min-w-35 whitespace-normal">
                                                    <div>{asset.category?.name || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {asset.category_id ? `ID ${asset.category_id}` : 'No category'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="min-w-35 whitespace-normal">
                                                    <div>{asset.location?.name || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {asset.location_id ? `ID ${asset.location_id}` : 'No location'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-45 whitespace-normal">
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
                                            <TableCell className="min-w-60 max-w-80 whitespace-normal text-muted-foreground">
                                                {asset.description || '-'}
                                            </TableCell>
                                            <TableCell>{formatCurrency(asset.value)}</TableCell>
                                            <TableCell>{formatDate(asset.created_at)}</TableCell>
                                            <TableCell>{formatDate(asset.updated_at)}</TableCell>
                                            <TableCell>{renderActionButtons(asset)}</TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow key={asset.id}>
                                            <TableCell>
                                                <Checkbox
                                                    aria-label={`Select ${asset.name}`}
                                                    checked={selectedIds.includes(asset.id)}
                                                    onCheckedChange={(val) => toggleOne(asset.id, !!val)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                <Link href={`/assets/${asset.id}`} className="hover:underline">{asset.name}</Link>
                                            </TableCell>
                                            <TableCell className="font-medium text-muted-foreground">{asset.asset_id}</TableCell>
                                            <TableCell>
                                                <span className="capitalize">{asset.status}</span>
                                            </TableCell>
                                            <TableCell>{formatCurrency(asset.value)}</TableCell>
                                            <TableCell>{renderActionButtons(asset)}</TableCell>
                                        </TableRow>
                                    )
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={isAllTable ? 13 : 6} className="h-24 text-center text-muted-foreground">
                                        No assets found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DataTablePagination
                    pagination={assets}
                    itemLabel="Assets"
                    onPerPageChange={handlePerPageChange}
                />
            </div >

            {/* Delete Confirmation Dialog */}
            < Dialog open={!!assetToDelete
            } onOpenChange={(open) => !open && closeDeleteDialog()}>
                <DialogContent className="sm:max-w-106.25 rounded-lg" onPointerDownOutside={closeDeleteDialog}>
                    <DialogHeader>
                        <DialogTitle>Delete Asset</DialogTitle>
                        <DialogDescription>
                            This will permanently remove <span className="font-semibold text-foreground">{assetToDelete?.name}</span>
                            {assetToDelete?.asset_id ? (
                                <span className="text-muted-foreground"> ({assetToDelete.asset_id})</span>
                            ) : null}.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-muted-foreground">
                        Delete this asset only if you are sure it should no longer exist in your inventory records.
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={closeDeleteDialog} className="rounded">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded" disabled={isDeleting}>
                            {isDeleting ? 'Deleting asset...' : 'Delete asset'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
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
