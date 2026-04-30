import { Head } from '@inertiajs/react';
import { isValidElement, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AssetQueryBuilder } from '@/components/asset-query-builder';
import type { AssetFilterOption, AssetFiltersQuery, AssetQueryValue, AssetSavedFilter, AssetSortDraft } from '@/components/asset-query-builder';
import { ResourceIndexTable } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { KitPageProps } from '@/layouts/kit-layout';
import {
    DEFAULT_ASSET_COLUMN_PREFERENCES,
    cloneColumnPreferences,
    createAssetTableColumns,
} from '@/pages/assets/column-config';
import type { AssetColumnKey, AssetColumnPreference, AssetRecord, AssetTableColumn } from '@/pages/assets/column-config';
import { addAssets, assets } from '@/routes/kits';
import type { PaginatedData } from '@/types/pagination';

interface AddAssetsPageProps extends KitPageProps {
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

export default function AddAssets({ kit, assets: availableAssets, categories, columnPreferences, locations, savedFilters, filters, sorts }: AddAssetsPageProps) {
    const persistedColumns = useMemo(
        () => cloneColumnPreferences(columnPreferences.length > 0 ? columnPreferences : DEFAULT_ASSET_COLUMN_PREFERENCES),
        [columnPreferences],
    );
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const selectedAssets = useMemo(
        () => availableAssets.data.filter((asset) => selectedIds.includes(asset.id)),
        [availableAssets.data, selectedIds],
    );

    const toggleAssetSelection = (assetId: string) => {
        setSelectedIds((previous) => (
            previous.includes(assetId)
                ? previous.filter((selectedId) => selectedId !== assetId)
                : [...previous, assetId]
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
            setSelectedIds(availableAssets.data.map((asset) => asset.id));

            return;
        }

        setSelectedIds([]);
    };

    const baseColumns = useMemo(
        () => createAssetTableColumns({
            onDelete: () => { },
        }).filter((column) => column.key !== 'actions').map((column) => (
            column.key === 'name'
                ? {
                    ...column,
                    render: (asset: AssetRecord) => (
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted/10">
                                {asset.image_url ? (
                                    <img src={asset.image_url} alt={asset.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="text-sm font-semibold text-muted-foreground">A</div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="block line-clamp-2">{asset.name}</div>
                            </div>
                        </div>
                    ),
                }
                : column
        )),
        [],
    );

    const fixedLeadingColumns = useMemo(
        () => baseColumns.filter((column) => column.key === 'name'),
        [baseColumns],
    );
    const optionalColumnMap = useMemo(() => new Map(
        baseColumns
            .filter((column) => column.isOptional)
            .map((column) => [column.key as AssetColumnKey, column]),
    ), [baseColumns]);
    const activeColumns = useMemo(() => ([
        ...fixedLeadingColumns,
        ...persistedColumns
            .filter((column) => column.visible)
            .map((column) => optionalColumnMap.get(column.key))
            .filter((column): column is AssetTableColumn => Boolean(column)),
    ]), [fixedLeadingColumns, optionalColumnMap, persistedColumns]);

    const visibleColumnCount = activeColumns.length;
    const tableClassName = visibleColumnCount > 8
        ? 'min-w-[1200px]'
        : visibleColumnCount > 5
            ? 'min-w-[960px]'
            : 'min-w-[720px]';

    return (
        <>
            <Head title={`${kit?.name ?? 'Kit'} - Add Assets`} />

            <ResourceIndexTable
                resourcePath={addAssets(kit.id).url}
                searchPlaceholder="Search assets to add..."
                pagination={availableAssets}
                filters={filters}
                searchQuery={sanitizeQuery({
                    ...filters,
                    page: undefined,
                })}
                columns={activeColumns}
                selection={{
                    selectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (asset, checked) => toggleOne(asset.id, checked),
                    getLabel: (asset) => `Select ${asset.name}`,
                }}
                tableClassName={tableClassName}
                toolbarStart={(
                    <div className="shrink-0">
                        <AssetQueryBuilder
                            categories={categories}
                            locations={locations}
                            savedFilters={savedFilters}
                            filters={filters}
                            sorts={sorts}
                            resourcePath={addAssets(kit.id).url}
                            showFilterButton={false}
                            showSavedFiltersButton={false}
                        />
                    </div>
                )}
                toolbarEnd={(
                    <>
                        <div className="text-sm text-muted-foreground">
                            {selectedAssets.length} selected
                        </div>
                        <Button type="button" variant="outline" onClick={() => setSelectedIds([])}>
                            Cancel
                        </Button>
                        <Button type="button">
                            Confirm
                        </Button>
                    </>
                )}
                onRowClick={(asset) => toggleAssetSelection(asset.id)}
                emptyState={{
                    title: 'No assets available',
                    description: 'No assets match the current search or filter criteria.',
                }}
            />
        </>
    );
}

AddAssets.layout = (page: ReactNode) => {
    const kit = isValidElement<KitPageProps>(page) ? page.props.kit : null;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Kits', href: '/kits' },
                { title: String(kit?.name ?? 'Kit'), href: kit ? assets(kit.id).url : '/kits' },
                { title: 'Add Assets', href: kit ? addAssets(kit.id).url : '/kits' },
            ]}
            children={page}
        />
    );
};
