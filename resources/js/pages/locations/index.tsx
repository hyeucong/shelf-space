import { Head, Link, router } from '@inertiajs/react';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AssetSelectionActions } from '@/components/asset-selection-actions';
import { ResourceDeleteDialog } from '@/components/resource-form-dialog';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { ResourceIndexColumn, ResourceIndexSortOption } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { PaginatedData } from '@/types/pagination';

interface Location {
    id: number;
    name: string;
    description: string | null;
    parent_location_id?: number | null;
    parent?: {
        id: number;
        name: string;
    } | null;
    assets_count: number;
    children_count: number;
}

interface PageProps {
    locations: PaginatedData<Location>;
    parentOptions: Array<{
        id: number;
        name: string;
    }>;
    filters: {
        search?: string;
        per_page?: string | number;
        sort?: string;
        order?: 'asc' | 'desc';
    };
}

export default function Locations({ locations, filters }: PageProps) {
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
    const selectedLocations = useMemo(
        () => localLocations.filter((location) => activeSelectedIds.includes(location.id)),
        [activeSelectedIds, localLocations],
    );
    const primarySelectedLocation = activeSelectedIds.length === 1
        ? selectedLocations[0] ?? null
        : null;

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
                        <Link href={`/locations/${location.id}/overview`} className="block line-clamp-2 transition-colors hover:text-primary">
                            {location.name}
                        </Link>
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
            key: 'assets',
            header: 'Assets',
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden whitespace-nowrap font-medium text-muted-foreground md:table-cell',
            render: (location) => String(location.assets_count),
        },
        {
            key: 'parent',
            header: 'Parent location',
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden whitespace-normal text-muted-foreground lg:table-cell',
            render: (location) => location.parent?.name || '-',
        },
        {
            key: 'children',
            header: 'Child locations',
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden whitespace-nowrap font-medium text-muted-foreground md:table-cell',
            render: (location) => String(location.children_count),
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
                        asChild
                    >
                        <Link href={`/locations/${location.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Link>
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
                toolbarEnd={(
                    <AssetSelectionActions
                        actions={[
                            {
                                key: 'edit',
                                label: 'Edit',
                                icon: <Pencil className="h-4 w-4" />,
                                href: primarySelectedLocation ? `/locations/${primarySelectedLocation.id}/edit` : undefined,
                                disabled: !primarySelectedLocation,
                            },
                            {
                                key: 'delete',
                                label: 'Delete',
                                icon: <Trash2 className="h-4 w-4" />,
                                onClick: () => {
                                    if (!primarySelectedLocation) {
                                        return;
                                    }

                                    setLocationToDelete(primarySelectedLocation);
                                },
                                disabled: !primarySelectedLocation,
                                destructive: true,
                            },
                        ]}
                    />
                )}
            />
            <ResourceDeleteDialog
                open={!!locationToDelete}
                onOpenChange={(open) => !open && closeDeleteDialog()}
                title="Delete Location"
                itemName={locationToDelete?.name}
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
            <Button className="rounded border-none" asChild>
                <Link href="/locations/create">New location</Link>
            </Button>
        }
    />
);
