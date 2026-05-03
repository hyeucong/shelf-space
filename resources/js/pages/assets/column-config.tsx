import { Link } from '@inertiajs/react';
import { Camera, Copy, Pencil, Trash2 } from 'lucide-react';
import type { ResourceIndexColumn } from '@/components/resource-index-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface AssetRecord {
    id: string;
    category_id: number | null;
    location_id: string | null;
    asset_id: string;
    name: string;
    description: string | null;
    status: string;
    value: number | null;
    image_url?: string | null;
    created_at: string | null;
    updated_at: string | null;
    category?: {
        id: number;
        name: string;
    } | null;
    location?: {
        id: string;
        name: string;
    } | null;
    tags?: Array<{
        id: number;
        name: string;
    }>;
}

export type AssetColumnKey = 'id' | 'asset_id' | 'status' | 'category' | 'location' | 'tags' | 'description' | 'value' | 'created_at' | 'updated_at' | 'actions';

export interface AssetColumnPreference {
    key: AssetColumnKey;
    visible: boolean;
}

export interface AssetTableColumn extends ResourceIndexColumn<AssetRecord> {
    isOptional: boolean;
}

interface AssetTableColumnFactoryOptions {
    onDelete: (asset: AssetRecord) => void;
    onDuplicate: (asset: AssetRecord) => void;
}

export const ASSET_OPTIONAL_COLUMN_OPTIONS: Array<{ key: AssetColumnKey; label: string }> = [
    { key: 'asset_id', label: 'Asset ID' },
    { key: 'status', label: 'Status' },
    { key: 'category', label: 'Category' },
    { key: 'location', label: 'Location' },
    { key: 'tags', label: 'Tags' },
    { key: 'description', label: 'Description' },
    { key: 'value', label: 'Value' },
    { key: 'created_at', label: 'Created' },
    { key: 'updated_at', label: 'Updated' },
    { key: 'actions', label: 'Actions' },
];

export const ASSET_OPTIONAL_COLUMN_LABELS = Object.fromEntries(
    ASSET_OPTIONAL_COLUMN_OPTIONS.map((column) => [column.key, column.label]),
) as Record<AssetColumnKey, string>;

export const DEFAULT_ASSET_COLUMN_PREFERENCES: AssetColumnPreference[] = ASSET_OPTIONAL_COLUMN_OPTIONS.map((column) => ({
    key: column.key,
    visible: true,
}));

export const cloneColumnPreferences = (columns: AssetColumnPreference[]) => columns.map((column) => ({ ...column }));

export const formatCurrency = (value: number | null) => {
    if (value === null) {
        return '-';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value));
};

export const formatDate = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
};

export function createAssetTableColumns({
    onDelete,
    onDuplicate,
}: AssetTableColumnFactoryOptions): AssetTableColumn[] {
    return [
        {
            key: 'name',
            header: 'Name',
            isOptional: false,
            headerClassName: 'w-full min-w-64',
            cellClassName: 'w-full min-w-64 font-semibold',
            render: (asset) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted/10">
                        {asset.image_url ? (
                            <img src={asset.image_url} alt={asset.name} className="h-full w-full object-cover" />
                        ) : (
                            <Camera className="text-muted-foreground" size={18} />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <Link href={`/assets/${asset.id}/overview`} className="block truncate hover:underline">
                            {asset.name}
                        </Link>
                    </div>
                </div>
            ),
        },

        {
            key: 'asset_id',
            header: 'Asset ID',
            isOptional: true,
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden font-medium text-muted-foreground md:table-cell',
            render: (asset) => asset.asset_id,
        },
        {
            key: 'status',
            header: 'Status',
            isOptional: true,
            cellClassName: 'hidden sm:table-cell',
            headerClassName: 'hidden sm:table-cell',
            render: (asset) => (
                <Badge variant="outline" className="capitalize">{asset.status}</Badge>
            ),
        },
        {
            key: 'category',
            header: 'Category',
            isOptional: true,
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden lg:table-cell',
            render: (asset) => asset.category?.name || '-',
        },
        {
            key: 'location',
            header: 'Location',
            isOptional: true,
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden lg:table-cell',
            render: (asset) => asset.location?.name || '-',
        },
        {
            key: 'tags',
            header: 'Tags',
            isOptional: true,
            headerClassName: 'hidden xl:table-cell',
            cellClassName: 'hidden min-w-40 xl:table-cell',
            render: (asset) => (
                asset.tags && asset.tags.length > 0 ? (
                    <div className="flex flex-nowrap gap-1 overflow-x-auto no-scrollbar max-w-[200px] lg:max-w-[300px]">
                        {asset.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="shrink-0 whitespace-nowrap">{tag.name}</Badge>
                        ))}
                    </div>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            ),
        },
        {
            key: 'description',
            header: 'Description',
            isOptional: true,
            headerClassName: 'hidden xl:table-cell',
            cellClassName: 'hidden text-muted-foreground xl:table-cell',
            render: (asset) => asset.description || '-',
        },
        {
            key: 'value',
            header: 'Value',
            isOptional: true,
            headerClassName: 'hidden text-right md:table-cell',
            cellClassName: 'hidden text-right font-medium md:table-cell',
            render: (asset) => formatCurrency(asset.value),
        },
        {
            key: 'created_at',
            header: 'Created',
            isOptional: true,
            headerClassName: 'hidden xl:table-cell',
            cellClassName: 'hidden xl:table-cell',
            render: (asset) => formatDate(asset.created_at),
        },
        {
            key: 'updated_at',
            header: 'Updated',
            isOptional: true,
            headerClassName: 'hidden xl:table-cell',
            cellClassName: 'hidden xl:table-cell',
            render: (asset) => formatDate(asset.updated_at),
        },
        {
            key: 'actions',
            header: 'Actions',
            isOptional: true,
            headerClassName: 'w-24 text-right',
            cellClassName: 'w-24 text-right',
            render: (asset) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 border" asChild>
                        <Link href={`/assets/${asset.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border"
                        onClick={() => onDuplicate(asset)}
                    >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Duplicate</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(asset)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            ),
        },
    ];
}
