import { Head, router } from '@inertiajs/react';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ResourceDeleteDialog, ResourceHeaderAction } from '@/components/resource-form-dialog';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { ResourceIndexColumn, ResourceIndexSortOption } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [activeLocation, setActiveLocation] = useState<Location | null>(null);
    const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deletedLocationIds, setDeletedLocationIds] = useState<number[]>([]);

    const localLocations = useMemo(
        () => (locations?.data || []).filter((location) => !deletedLocationIds.includes(location.id)),
        [deletedLocationIds, locations],
    );
    const activeSelectedIds = useMemo(
        () => selectedIds.filter((id) => localLocations.some((location) => location.id === id)),
        [localLocations, selectedIds],
    );

    useEffect(() => {
        const handleOpen = () => {
            setDialogMode('create');
            setActiveLocation(null);
            setIsDialogOpen(true);
        };

        window.addEventListener(LOCATION_CREATE_EVENT, handleOpen);

        return () => window.removeEventListener(LOCATION_CREATE_EVENT, handleOpen);
    }, []);

    const closeFormDialog = () => {
        setIsDialogOpen(false);
        setActiveLocation(null);
    };

    const closeDeleteDialog = () => setLocationToDelete(null);

    const handleDelete = () => {
        if (!locationToDelete || isDeleting) {
            return;
        }

        const id = locationToDelete.id;

        router.delete(`/locations/${id}`, {
            preserveScroll: true,
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setDeletedLocationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
                setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
                setLocationToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const toggleOne = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) {
                return Array.from(new Set([...prev, id]));
            }

            return prev.filter((currentId) => currentId !== id);
        });
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(localLocations.map((location) => location.id));

            return;
        }

        setSelectedIds([]);
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
            headerClassName: 'min-w-56',
            cellClassName: 'min-w-56 font-medium text-foreground',
            render: (location) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted/10">
                        <MapPin className="text-muted-foreground" size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="block line-clamp-2">{location.name}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden max-w-120 whitespace-normal text-muted-foreground lg:table-cell',
            render: (location) => location.description || '-',
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'w-24 text-right',
            cellClassName: 'w-24 text-right',
            render: (location) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border"
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
                        className="h-8 w-8 border text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                selection={{
                    selectedIds: activeSelectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (location, checked) => toggleOne(location.id, checked),
                    getLabel: (location) => `Select ${location.name}`,
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
