import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Head, Link, router } from '@inertiajs/react';
import { Columns3 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ColumnVisibilityPanel } from '@/components/asset-column-visibility-panel';
import { AssetQueryBuilder } from '@/components/asset-query-builder';
import type { AssetFilterOption, AssetFiltersQuery, AssetQueryValue, AssetSavedFilter, AssetSortDraft } from '@/components/asset-query-builder';
import { ResourceDeleteDialog } from '@/components/resource-form-dialog';
import { ResourceIndexTable } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    DEFAULT_ASSET_COLUMN_PREFERENCES,
    cloneColumnPreferences,
    createAssetTableColumns,
} from '@/pages/assets/column-config';
import type { AssetColumnKey, AssetColumnPreference, AssetRecord, AssetTableColumn } from '@/pages/assets/column-config';
import type { PaginatedData } from '@/types/pagination';

interface PageProps {
    assets: PaginatedData<AssetRecord>;
    categories: AssetFilterOption[];
    columnPreferences: AssetColumnPreference[];
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

export default function Assets({ assets, categories, columnPreferences, locations, savedFilters, filters, sorts }: PageProps) {
    const persistedColumns = useMemo(
        () => cloneColumnPreferences(columnPreferences.length > 0 ? columnPreferences : DEFAULT_ASSET_COLUMN_PREFERENCES),
        [columnPreferences],
    );
    const [assetToDelete, setAssetToDelete] = useState<AssetRecord | null>(null);
    const [deletedAssetIds, setDeletedAssetIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [optimisticColumns, setOptimisticColumns] = useState<AssetColumnPreference[] | null>(null);
    const [draftColumns, setDraftColumns] = useState<AssetColumnPreference[]>(persistedColumns);
    const [isColumnsPanelOpen, setIsColumnsPanelOpen] = useState(false);
    const [isSavingColumns, setIsSavingColumns] = useState(false);
    const columnsPanelRef = useRef<HTMLDivElement | null>(null);

    const visibleColumns = optimisticColumns ?? persistedColumns;

    const localAssets = useMemo(
        () => (assets?.data || []).filter((asset) => !deletedAssetIds.includes(asset.id)),
        [assets, deletedAssetIds],
    );
    const activeSelectedIds = useMemo(
        () => selectedIds.filter((id) => localAssets.some((asset) => asset.id === id)),
        [localAssets, selectedIds],
    );

    useEffect(() => {
        if (!isColumnsPanelOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setDraftColumns(cloneColumnPreferences(visibleColumns));
                setIsColumnsPanelOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isColumnsPanelOpen, visibleColumns]);

    useEffect(() => {
        if (!isColumnsPanelOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | PointerEvent | TouchEvent) => {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (columnsPanelRef.current?.contains(target)) {
                return;
            }

            if (
                target instanceof Element
                && target.closest('[data-slot="select-content"], [data-slot="dropdown-menu-content"], [data-slot="dialog-content"]')
            ) {
                return;
            }

            setDraftColumns(cloneColumnPreferences(visibleColumns));
            setIsColumnsPanelOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [isColumnsPanelOpen, visibleColumns]);

    const toggleOne = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) {
                return Array.from(new Set([...prev, id]));
            }

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

    const handleOpenColumnsPanel = () => {
        setDraftColumns(cloneColumnPreferences(visibleColumns));
        setIsColumnsPanelOpen(true);
    };

    const handleCloseColumnsPanel = () => {
        setDraftColumns(cloneColumnPreferences(visibleColumns));
        setIsColumnsPanelOpen(false);
    };

    const handleApplyColumnsPanel = () => {
        const previousColumns = cloneColumnPreferences(visibleColumns);
        const nextColumns = cloneColumnPreferences(draftColumns);

        setOptimisticColumns(nextColumns);
        setIsSavingColumns(true);

        router.post('/assets/layout', {
            columns: nextColumns,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setOptimisticColumns(null);
                setIsColumnsPanelOpen(false);
            },
            onError: () => {
                setOptimisticColumns(previousColumns);
                setDraftColumns(previousColumns);
            },
            onFinish: () => setIsSavingColumns(false),
        });
    };

    const handleDraftColumnToggle = (columnKey: AssetColumnKey, checked: boolean) => {
        setDraftColumns((current) => current.map((column) => (
            column.key === columnKey
                ? { ...column, visible: checked }
                : column
        )));
    };

    const handleDraftColumnReorder = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) {
            return;
        }

        setDraftColumns((current) => {
            const activeIndex = current.findIndex((column) => column.key === active.id);
            const overIndex = current.findIndex((column) => column.key === over.id);

            if (activeIndex === -1 || overIndex === -1) {
                return current;
            }

            return arrayMove(current, activeIndex, overIndex);
        });
    };

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
                setDeletedAssetIds((previousIds) => previousIds.includes(assetId) ? previousIds : [...previousIds, assetId]);
                setAssetToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const tableColumns = createAssetTableColumns({
        onDelete: (asset) => setAssetToDelete(asset),
    });

    const fixedLeadingColumns = tableColumns.filter((column) => column.key === 'name');
    const fixedTrailingColumns = tableColumns.filter((column) => column.key === 'actions');
    const optionalColumnMap = useMemo(() => new Map(
        tableColumns
            .filter((column) => column.isOptional)
            .map((column) => [column.key as AssetColumnKey, column]),
    ), [tableColumns]);

    const activeColumns = useMemo(() => ([
        ...fixedLeadingColumns,
        ...visibleColumns
            .filter((column) => column.visible)
            .map((column) => optionalColumnMap.get(column.key))
            .filter((column): column is AssetTableColumn => Boolean(column)),
        ...fixedTrailingColumns,
    ]), [fixedLeadingColumns, fixedTrailingColumns, optionalColumnMap, visibleColumns]);

    const hasPendingColumnChanges = JSON.stringify(draftColumns) !== JSON.stringify(visibleColumns);
    const visibleColumnCount = activeColumns.length;
    const baseTableClassName = visibleColumnCount > 8
        ? 'min-w-[1200px]'
        : visibleColumnCount > 5
            ? 'min-w-[960px]'
            : 'min-w-[720px]';

    return (
        <>
            <Head title="Assets" />

            <ResourceIndexTable
                resourcePath="/assets"
                searchPlaceholder="Search assets..."
                pagination={{ ...assets, data: localAssets }}
                filters={filters}
                searchQuery={sanitizeQuery({
                    ...filters,
                    page: undefined,
                })}
                columns={activeColumns}
                selection={{
                    selectedIds: activeSelectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (asset, checked) => toggleOne(asset.id, checked),
                    getLabel: (asset) => `Select ${asset.name}`,
                }}
                tableClassName={baseTableClassName}
                toolbarStart={(
                    <>
                        <div className="shrink-0">
                            <AssetQueryBuilder
                                categories={categories}
                                locations={locations}
                                savedFilters={savedFilters}
                                filters={filters}
                                sorts={sorts}
                            />
                        </div>
                        <div ref={columnsPanelRef} className="relative shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className={isColumnsPanelOpen ? 'h-9 w-9 shrink-0 rounded bg-muted text-foreground shadow-none' : 'h-9 w-9 shrink-0 rounded shadow-none'}
                                title="Show or hide columns"
                                onClick={() => isColumnsPanelOpen ? handleCloseColumnsPanel() : handleOpenColumnsPanel()}
                                aria-expanded={isColumnsPanelOpen}
                            >
                                <Columns3 size={16} />
                                <span className="sr-only">Show or hide columns</span>
                            </Button>
                            <ColumnVisibilityPanel
                                open={isColumnsPanelOpen}
                                columns={draftColumns}
                                onToggle={handleDraftColumnToggle}
                                onReorder={handleDraftColumnReorder}
                                onCancel={handleCloseColumnsPanel}
                                onSave={handleApplyColumnsPanel}
                                isSaving={isSavingColumns}
                                hasPendingChanges={hasPendingColumnChanges}
                            />
                        </div>
                    </>
                )}
                toolbarEnd={(
                    <>
                        <Button type="button" variant="outline" className="h-9 shrink-0 rounded shadow-none">
                            Export selection
                        </Button>
                        <Button type="button" variant="outline" className="h-9 shrink-0 rounded shadow-none">
                            Actions
                        </Button>
                    </>
                )}
                emptyState={{
                    title: 'No assets yet',
                    description: 'You don\'t have any assets yet. Create your first asset to get started.',
                }}
            />

            <ResourceDeleteDialog
                open={!!assetToDelete}
                onOpenChange={(open) => !open && closeDeleteDialog()}
                title="Delete Asset"
                itemName={assetToDelete?.name}
                itemMeta={assetToDelete?.asset_id}
                processing={isDeleting}
                onConfirm={handleDelete}
                confirmLabel="Delete asset"
                confirmPendingLabel="Deleting asset..."
                contentClassName="sm:max-w-106.25 rounded"
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
