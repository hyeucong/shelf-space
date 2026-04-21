import { Link } from '@inertiajs/react';
import { Camera, Pencil, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell } from '@/components/ui/table';

export interface AssetRecord {
    id: number;
    category_id: number | null;
    location_id: number | null;
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
        id: number;
        name: string;
    } | null;
    tags?: Array<{
        id: number;
        name: string;
    }>;
}

export type AssetColumnKey = 'id' | 'asset_id' | 'status' | 'category' | 'location' | 'tags' | 'description' | 'value' | 'created_at' | 'updated_at';

export type AssetTableColumnKey = 'select' | 'name' | 'actions' | AssetColumnKey;

export interface AssetColumnPreference {
    key: AssetColumnKey;
    visible: boolean;
}

export interface AssetTableColumn {
    key: AssetTableColumnKey;
    label: string;
    isOptional: boolean;
    headerClassName?: string;
    renderCell: (asset: AssetRecord) => ReactElement;
}

interface AssetTableColumnFactoryOptions {
    selectedIds: number[];
    onToggleOne: (id: number, checked: boolean) => void;
    onDelete: (asset: AssetRecord) => void;
}

export const ASSET_OPTIONAL_COLUMN_OPTIONS: Array<{ key: AssetColumnKey; label: string }> = [
    { key: 'id', label: 'ID' },
    { key: 'asset_id', label: 'Asset ID' },
    { key: 'status', label: 'Status' },
    { key: 'category', label: 'Category' },
    { key: 'location', label: 'Location' },
    { key: 'tags', label: 'Tags' },
    { key: 'description', label: 'Description' },
    { key: 'value', label: 'Value' },
    { key: 'created_at', label: 'Created' },
    { key: 'updated_at', label: 'Updated' },
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
    selectedIds,
    onToggleOne,
    onDelete,
}: AssetTableColumnFactoryOptions): AssetTableColumn[] {
    return [
        {
            key: 'select',
            label: '',
            isOptional: false,
            headerClassName: 'w-11 px-3 md:px-4',
            renderCell: (asset) => (
                <TableCell className="w-11 px-3 md:px-4">
                    <Checkbox
                        aria-label={`Select ${asset.name}`}
                        checked={selectedIds.includes(asset.id)}
                        onCheckedChange={(value) => onToggleOne(asset.id, !!value)}
                    />
                </TableCell>
            ),
        },
        {
            key: 'name',
            label: 'Name',
            isOptional: false,
            headerClassName: 'w-full min-w-64',
            renderCell: (asset) => (
                <TableCell className="w-full min-w-64 font-semibold">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted/10">
                            {asset.image_url ? (
                                <img src={asset.image_url} alt={asset.name} className="h-full w-full object-cover" />
                            ) : (
                                <Camera className="text-muted-foreground" size={18} />
                            )}
                        </div>
                        <div className="min-w-0">
                            <Link href={`/assets/${asset.id}/overview`} className="block line-clamp-2 hover:underline">
                                {asset.name}
                            </Link>
                        </div>
                    </div>
                </TableCell>
            ),
        },
        {
            key: 'id',
            label: 'ID',
            isOptional: true,
            renderCell: (asset) => (
                <TableCell className="font-medium whitespace-nowrap text-muted-foreground">{asset.id}</TableCell>
            ),
        },
        {
            key: 'asset_id',
            label: 'Asset ID',
            isOptional: true,
            renderCell: (asset) => (
                <TableCell className="font-medium whitespace-nowrap text-muted-foreground">{asset.asset_id}</TableCell>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            isOptional: true,
            renderCell: (asset) => (
                <TableCell>
                    <Badge variant="outline" className="capitalize">{asset.status}</Badge>
                </TableCell>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            isOptional: true,
            renderCell: (asset) => (
                <TableCell>
                    <div className="min-w-32 whitespace-normal">
                        <div>{asset.category?.name || '-'}</div>
                        {asset.category_id ? (
                            <div className="text-xs text-muted-foreground">{`ID ${asset.category_id}`}</div>
                        ) : null}
                    </div>
                </TableCell>
            ),
        },
        {
            key: 'location',
            label: 'Location',
            isOptional: true,
            renderCell: (asset) => (
                <TableCell>
                    <div className="min-w-32 whitespace-normal">
                        <div>{asset.location?.name || '-'}</div>
                        {asset.location_id ? (
                            <div className="text-xs text-muted-foreground">{`ID ${asset.location_id}`}</div>
                        ) : null}
                    </div>
                </TableCell>
            ),
        },
        {
            key: 'tags',
            label: 'Tags',
            isOptional: true,
            renderCell: (asset) => (
                <TableCell className="min-w-40 whitespace-normal">
                    {asset.tags && asset.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {asset.tags.map((tag) => (
                                <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                            ))}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </TableCell>
            ),
        },
        {
            key: 'description',
            label: 'Description',
            isOptional: true,
            renderCell: (asset) => (
                <TableCell className="min-w-56 max-w-80 whitespace-normal text-muted-foreground">
                    {asset.description || '-'}
                </TableCell>
            ),
        },
        {
            key: 'value',
            label: 'Value',
            isOptional: true,
            headerClassName: 'text-right',
            renderCell: (asset) => (
                <TableCell className="text-right font-medium whitespace-nowrap">{formatCurrency(asset.value)}</TableCell>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
            isOptional: true,
            renderCell: (asset) => (
                <TableCell className="whitespace-nowrap">{formatDate(asset.created_at)}</TableCell>
            ),
        },
        {
            key: 'updated_at',
            label: 'Updated',
            isOptional: true,
            renderCell: (asset) => (
                <TableCell className="whitespace-nowrap">{formatDate(asset.updated_at)}</TableCell>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            isOptional: false,
            headerClassName: 'w-24 text-right',
            renderCell: (asset) => (
                <TableCell className="w-24 text-right">
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
                            className="h-8 w-8 border text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(asset)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                </TableCell>
            ),
        },
    ];
}
