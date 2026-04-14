import { Head, Link, router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    PaginationFirst,
    PaginationLast,
    PaginationPageIndicator,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Pencil, Trash2, Filter, ArrowUpDown, List as ListIcon, Calendar, Bookmark, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SearchInput } from '@/components/search-input';
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
    asset_id: string;
    name: string;
    status: string;
    value: number | null;
}

interface PaginationLinkType {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLinkType[];
    current_page: number;
    last_page: number;
    per_page: number;
    first_page_url: string;
    last_page_url: string;
    from: number;
    to: number;
    total: number;
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

    // Sync local state when props change (after server refresh)
    useEffect(() => {
        setLocalAssets(assets?.data || []);
    }, [assets]);

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

    return (
        <>
            <Head title="Assets" />

            <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
                {/* Scrollable Table Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Filter Options Toolbar */}
                    <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded border bg-background p-2 shadow-sm min-h-12">
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
                            <Button variant="outline" size="icon" className="h-9 w-9 shadow-none text-muted-foreground shrink-0">
                                <LayoutGrid size={16} />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded border shadow-none bg-background">
                        <div className="flex items-center justify-between p-4 border-b border-border/50">
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

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Asset ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {localAssets && localAssets.length > 0 ? (
                                    localAssets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            <TableCell className="font-semibold">{asset.name}</TableCell>
                                            <TableCell className="font-medium text-muted-foreground">{asset.asset_id}</TableCell>
                                            <TableCell>
                                                <span className="capitalize">{asset.status}</span>
                                            </TableCell>
                                            <TableCell>
                                                {asset.value ? `$${Number(asset.value).toFixed(2)}` : '-'}
                                            </TableCell>
                                            {/* Row Actions */}
                                            <TableCell>
                                                <div className='flex gap-2'>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 border" asChild>
                                                        <Link href={`/assets/${asset.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 border"
                                                        onClick={() => setAssetToDelete(asset)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No assets found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Fixed Pagination Bar at Bottom */}
                {assets.links && assets.links.length > 0 && (
                    <div className="shrink-0 border-t bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60">
                        <Pagination className="justify-start">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationFirst
                                        href={assets.first_page_url}
                                        className={assets.current_page === 1 ? "opacity-30 pointer-events-none" : ""}
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationPrevious
                                        href={assets.links[0].url || "#"}
                                        className={!assets.links[0].url ? "opacity-30 pointer-events-none" : ""}
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationPageIndicator
                                        currentPage={assets.current_page}
                                        lastPage={assets.last_page}
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationNext
                                        href={assets.links[assets.links.length - 1].url || "#"}
                                        className={!assets.links[assets.links.length - 1].url ? "opacity-30 pointer-events-none" : ""}
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationLast
                                        href={assets.last_page_url}
                                        className={assets.current_page === assets.last_page ? "opacity-30 pointer-events-none" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>

                            <div className="flex items-center gap-2 ml-2">
                                <Select
                                    value={String(assets.per_page)}
                                    onValueChange={handlePerPageChange}
                                >
                                    <SelectTrigger size="sm" className="h-9 w-17.5 rounded-md shadow-none">
                                        <SelectValue placeholder={assets.per_page} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-muted-foreground whitespace-nowrap">Assets per page</span>
                            </div>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!assetToDelete} onOpenChange={(open) => !open && closeDeleteDialog()}>
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
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-muted-foreground">
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
            </Dialog>
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
