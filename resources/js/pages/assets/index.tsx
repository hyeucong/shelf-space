import { Head, Link, router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    from: number;
    to: number;
    total: number;
}

interface PageProps {
    assets: PaginatedData<Asset>;
}

export default function Assets({ assets }: PageProps) {
    // Local state for optimistic updates
    const [localAssets, setLocalAssets] = useState<Asset[]>(assets?.data || []);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync local state when props change (after server refresh)
    useEffect(() => {
        setLocalAssets(assets?.data || []);
    }, [assets]);

    const handleDelete = () => {
        if (!assetToDelete) return;

        const id = assetToDelete.id;

        // 1. Optimistic Update: Remove from list immediately
        setLocalAssets(prev => prev.filter(a => a.id !== id));

        // 2. Clear state and close modal immediately
        setAssetToDelete(null);

        // 3. Send server request in background
        router.delete(`/assets/${id}`, {
            onBefore: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onError: () => {
                // If it fails, add it back (Rollback)
                setLocalAssets(assets?.data || []);
                alert("Failed to delete asset. It has been restored.");
            }
        });
    };

    return (
        <>
            <Head title="Assets" />

            <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
                {/* Scrollable Table Area */}
                <div className="flex-1 overflow-y-auto p-4">
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
                {assets.links && assets.links.length > 3 && (
                    <div className="shrink-0 border-t bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60">
                        <Pagination>
                            <PaginationContent>
                                {assets.links.map((link, i) => {
                                    if (i === 0) {
                                        return (
                                            <PaginationItem key={i}>
                                                {link.url ? (
                                                    <PaginationPrevious href={link.url} preserveScroll />
                                                ) : (
                                                    <span className="opacity-50 pointer-events-none">
                                                        <PaginationPrevious href="#" preserveScroll />
                                                    </span>
                                                )}
                                            </PaginationItem>
                                        );
                                    }

                                    if (i === assets.links.length - 1) {
                                        return (
                                            <PaginationItem key={i}>
                                                {link.url ? (
                                                    <PaginationNext href={link.url} preserveScroll />
                                                ) : (
                                                    <span className="opacity-50 pointer-events-none">
                                                        <PaginationNext href="#" preserveScroll />
                                                    </span>
                                                )}
                                            </PaginationItem>
                                        );
                                    }

                                    if (link.label === '...') {
                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }

                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                href={link.url || '#'}
                                                isActive={link.active}
                                                preserveScroll
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!assetToDelete} onOpenChange={(open) => !open && setAssetToDelete(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Delete Asset</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">{assetToDelete?.name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setAssetToDelete(null)} className="rounded">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded" disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Asset'}
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
