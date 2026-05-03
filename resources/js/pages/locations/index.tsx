import { Head, Link, router } from '@inertiajs/react';
import { Copy, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AssetSelectionActions } from '@/components/asset-selection-actions';
import { ResourceDeleteDialog, ResourceDuplicateDialog, ResourceSelectDeleteDialog } from '@/components/resource-form-dialog';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { ResourceIndexColumn, ResourceIndexSortOption } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { PaginatedData } from '@/types/pagination';

interface Location {
    id: string;
    name: string;
    description: string | null;
    parent_location_id?: string | null;
    parent?: {
        id: string;
        name: string;
    } | null;
    assets_count: number;
    children_count: number;
}

interface PageProps {
    locations: PaginatedData<Location>;
    parentOptions: Array<{
        id: string;
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
    const [locationToDuplicate, setLocationToDuplicate] = useState<Location | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [isSelectingDelete, setIsSelectingDelete] = useState(false);
    const [showSelectDelete, setShowSelectDelete] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deletedLocationIds, setDeletedLocationIds] = useState<string[]>([]);

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

    const handleSelectDelete = () => {
        if (activeSelectedIds.length === 0 || isSelectingDelete) {
            return;
        }

        router.delete('/locations/select-delete', {
            data: { ids: activeSelectedIds },
            preserveScroll: true,
            onBefore: () => setIsSelectingDelete(true),
            onSuccess: () => {
                setSelectedIds([]);
                setShowSelectDelete(false);
            },
            onFinish: () => setIsSelectingDelete(false),
        });
    };

    const handleDuplicate = (count: number) => {
        if (!locationToDuplicate || isDuplicating) {
            return;
        }

        router.post(`/locations/${locationToDuplicate.id}/duplicate`, { count }, {
            preserveScroll: true,
            onBefore: () => setIsDuplicating(true),
            onSuccess: () => {
                setLocationToDuplicate(null);
            },
            onFinish: () => setIsDuplicating(false),
        });
    };

    const toggleOne = (id: string, checked: boolean) => {
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
                    <div className="min-w-0 flex-1">
                        <Link href={`/locations/${location.id}/overview`} className="block truncate transition-colors hover:text-primary">
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
            cellClassName: 'hidden text-muted-foreground lg:table-cell',
            render: (location) => location.description || '-',
        },
        {
            key: 'assets',
            header: 'Assets',
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden font-medium text-muted-foreground md:table-cell',
            render: (location) => String(location.assets_count),
        },
        {
            key: 'parent',
            header: 'Parent location',
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden text-muted-foreground lg:table-cell',
            render: (location) => location.parent?.name || '-',
        },
        {
            key: 'children',
            header: 'Child locations',
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden font-medium text-muted-foreground md:table-cell',
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
                        className="h-8 w-8 border"
                        onClick={() => setLocationToDuplicate(location)}
                    >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Duplicate</span>
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
                                onClick: () => setShowSelectDelete(true),
                                disabled: activeSelectedIds.length === 0,
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

            <ResourceSelectDeleteDialog
                open={showSelectDelete}
                onOpenChange={setShowSelectDelete}
                title="Delete Locations"
                resourceName="Location"
                count={activeSelectedIds.length}
                processing={isSelectingDelete}
                onConfirm={handleSelectDelete}
                confirmLabel="Delete selected"
            />

            <ResourceDuplicateDialog
                open={!!locationToDuplicate}
                onOpenChange={(open) => !open && setLocationToDuplicate(null)}
                itemName={locationToDuplicate?.name}
                processing={isDuplicating}
                onConfirm={handleDuplicate}
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
            <Button className="rounded bg-white text-black hover:bg-zinc-200 border border-border" asChild>
                <Link href="/locations/create">New location</Link>
            </Button>
        }
    />
);
