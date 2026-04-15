import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ResourceIndexTable, type ResourceIndexColumn, type ResourceIndexSortOption } from '@/components/resource-index-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { PaginatedData } from '@/types/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Location {
    id: number;
    name: string;
    description: string | null;
}

interface PageProps {
    locations: PaginatedData<Location>;
    filters: {
        search?: string;
        per_page?: string | number;
        sort?: string;
        order?: 'asc' | 'desc';
    };
}

export default function Locations({ locations, filters }: PageProps) {
    const [localLocations, setLocalLocations] = useState<Location[]>(locations?.data || []);
    const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setLocalLocations(locations?.data || []);
    }, [locations]);

    const closeDeleteDialog = () => setLocationToDelete(null);

    const handleDelete = () => {
        if (!locationToDelete || isDeleting) return;

        const id = locationToDelete.id;

        router.delete(`/locations/${id}`, {
            preserveScroll: true,
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setLocalLocations((prev) => prev.filter((l) => l.id !== id));
                setLocationToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const sortOptions: ResourceIndexSortOption[] = [
        { value: 'created_at:desc', label: 'Newest' },
        { value: 'created_at:asc', label: 'Oldest' },
        { value: 'name:asc', label: 'Name (A-Z)' },
        { value: 'name:desc', label: 'Name (Z-A)' },
    ];

    const columns: ResourceIndexColumn<Location>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (location) => location.name,
        },
        {
            key: 'description',
            header: 'Description',
            cellClassName: 'max-w-120 whitespace-normal text-muted-foreground',
            render: (location) => location.description || '-',
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'w-31.25',
            render: (location) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/locations/${location.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setLocationToDelete(location)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Locations" />

            <ResourceIndexTable
                resourcePath="/locations"
                searchPlaceholder="Search locations..."
                pagination={{ ...locations, data: localLocations }}
                filters={filters}
                columns={columns}
                emptyState={{
                    title: 'No locations yet',
                    description: 'Locations help you track where your assets are physically stored.',
                }}
                sort={{
                    value: `${filters?.sort || 'created_at'}:${filters?.order || 'desc'}`,
                    options: sortOptions,
                }}
            />
            {/* Delete Confirmation Dialog */}
            <Dialog open={!!locationToDelete} onOpenChange={(open) => !open && closeDeleteDialog()}>
                <DialogContent className="sm:max-w-106.25 rounded-lg" onPointerDownOutside={closeDeleteDialog}>
                    <DialogHeader>
                        <DialogTitle>Delete Location</DialogTitle>
                        <DialogDescription>
                            This will permanently remove <span className="font-semibold text-foreground">{locationToDelete?.name}</span>. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-muted-foreground">
                        Delete this location only if you are sure it should no longer exist and won't break any asset associations.
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={closeDeleteDialog} className="rounded">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded" disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete location'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Locations.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Locations', href: '/locations' }
        ]}
        headerAction={
            <Button className="rounded border-none" asChild>
                <Link href="/locations/create">
                    New location
                </Link>
            </Button>
        }
    />
);
