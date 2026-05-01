import { Head, router } from '@inertiajs/react';
import { Package2 } from 'lucide-react';
import { isValidElement, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { ResourceIndexColumn } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { LocationPageProps } from '@/layouts/location-layout';
import { addKits, kits as locationKits } from '@/routes/locations';
import type { PaginatedData } from '@/types/pagination';

interface KitRecord {
    id: string;
    name: string;
    created_at?: string | null;
    location?: {
        name: string;
    } | null;
}

interface AddKitsPageProps extends LocationPageProps {
    kits: PaginatedData<KitRecord>;
    existingKitIds: string[];
    filters: {
        search?: string;
        per_page?: number | string;
        sort?: string;
        order?: 'asc' | 'desc';
        page?: number | string;
    };
}

const sanitizeQuery = (query: Record<string, string | number | undefined>) => (
    Object.fromEntries(
        Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
    ) as Record<string, string | number>
);

export default function AddKits({ location, kits: availableKits, existingKitIds, filters }: AddKitsPageProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>(() => existingKitIds ?? []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedKits = useMemo(
        () => availableKits.data.filter((kit) => selectedIds.includes(kit.id)),
        [availableKits.data, selectedIds],
    );

    const toggleKitSelection = (kitId: string) => {
        setSelectedIds((previous) => (
            previous.includes(kitId)
                ? previous.filter((selectedId) => selectedId !== kitId)
                : [...previous, kitId]
        ));
    };

    const toggleOne = (id: string, checked: boolean) => {
        setSelectedIds((previous) => {
            if (checked) {
                return Array.from(new Set([...previous, id]));
            }

            return previous.filter((selectedId) => selectedId !== id);
        });
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds((previous) => Array.from(new Set([
                ...previous,
                ...availableKits.data.map((kit) => kit.id),
            ])));

            return;
        }

        const currentPageIds = new Set(availableKits.data.map((kit) => kit.id));
        setSelectedIds((previous) => previous.filter((id) => !currentPageIds.has(id)));
    };

    const handleConfirm = () => {
        setIsSubmitting(true);
        router.post(addKits(location.id).url, {
            kit_ids: selectedIds,
        }, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleCancel = () => {
        router.visit(locationKits(location.id).url);
    };

    const columns = useMemo<ResourceIndexColumn<KitRecord>[]>(() => [
        {
            key: 'name',
            header: 'Kit',
            headerClassName: 'w-full ',
            cellClassName: 'w-full  font-medium text-foreground',
            render: (kit) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted/10">
                        <Package2 className="text-muted-foreground" size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="block truncate">{kit.name}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'location',
            header: 'Location',
            headerClassName: 'w-56 whitespace-nowrap',
            cellClassName: 'w-56 whitespace-nowrap text-muted-foreground',
            render: (kit) => kit.location?.name ?? 'Unassigned',
        },
    ],
        [],
    );

    return (
        <>
            <Head title={`${location?.name ?? 'Location'} - Add Kits`} />

            <ResourceIndexTable
                resourcePath={addKits(location.id).url}
                searchPlaceholder="Search kits to add..."
                pagination={availableKits}
                filters={filters}
                searchQuery={sanitizeQuery({
                    ...filters,
                    page: undefined,
                })}
                columns={columns}
                selection={{
                    selectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (kit, checked) => toggleOne(kit.id, checked),
                    getLabel: (kit) => `Select ${kit.name}`,
                }}
                tableClassName="w-full table-fixed"
                toolbarEnd={(
                    <>
                        <div className="text-sm text-muted-foreground">
                            {selectedKits.length} selected
                        </div>
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleConfirm} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Confirm'}
                        </Button>
                    </>
                )}
                onRowClick={(kit) => toggleKitSelection(kit.id)}
                emptyState={{
                    title: 'No kits available',
                    description: 'No kits match the current search criteria.',
                }}
            />
        </>
    );
}

AddKits.layout = (page: ReactNode) => {
    const location = isValidElement<LocationPageProps>(page) ? page.props.location : null;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Locations', href: '/locations' },
                { title: String(location?.name ?? 'Location'), href: location ? locationKits(location.id).url : '/locations' },
                { title: 'Add Kits', href: location ? addKits(location.id).url : '/locations' },
            ]}
            children={page}
        />
    );
};
