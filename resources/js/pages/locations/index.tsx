import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ResourceDeleteDialog, ResourceHeaderAction } from '@/components/resource-form-dialog';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ResourceIndexTable, type ResourceIndexColumn, type ResourceIndexSortOption } from '@/components/resource-index-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LOCATION_CREATE_EVENT, LocationFormDialog, dispatchLocationCreateEvent } from '@/pages/locations/create';
import type { PaginatedData } from '@/types/pagination';

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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [activeLocation, setActiveLocation] = useState<Location | null>(null);
    const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const handleOpen = () => {
            setDialogMode('create');
            setActiveLocation(null);
            setIsDialogOpen(true);
        };

        window.addEventListener(LOCATION_CREATE_EVENT, handleOpen);

        return () => window.removeEventListener(LOCATION_CREATE_EVENT, handleOpen);
    }, []);

    useEffect(() => {
        setLocalLocations(locations?.data || []);
    }, [locations]);

    const closeFormDialog = () => {
        setIsDialogOpen(false);
        setActiveLocation(null);
    };

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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setDialogMode('edit');
                            setActiveLocation(location);
                            setIsDialogOpen(true);
                        }}
                        disabled={isDeleting}
                    >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setLocationToDelete(location)}
                        disabled={isDeleting}
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
            <LocationFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                mode={dialogMode}
                locationId={activeLocation?.id ?? null}
                initialValues={activeLocation ? {
                    name: activeLocation.name,
                    description: activeLocation.description ?? '',
                } : undefined}
                onSuccess={closeFormDialog}
            />
            <ResourceDeleteDialog
                open={!!locationToDelete}
                onOpenChange={(open) => !open && closeDeleteDialog()}
                title="Delete Location"
                itemName={locationToDelete?.name}
                warning="Delete this location only if you are sure it should no longer exist and won't break any asset associations."
                processing={isDeleting}
                onConfirm={handleDelete}
                confirmLabel="Delete location"
            />
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
            <ResourceHeaderAction label="New location" onClick={dispatchLocationCreateEvent} />
        }
    />
);
