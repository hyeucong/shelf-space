import { CategoryFormDialog } from '@/pages/categories/create';
import { LocationFormDialog } from '@/pages/locations/create';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Bookmark, Filter, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type AssetQueryValue = string | number | undefined;
export type AssetFilterKey = 'status' | 'category_id' | 'location_id' | 'asset_id' | 'value';
export type AssetFilterCondition = 'equals' | 'contains' | 'gte' | 'lte';
export type AssetSortField = 'created_at' | 'name' | 'value' | 'asset_id' | 'status';
export type AssetSortDirection = 'asc' | 'desc';

export type AssetFilterOption = {
    id: number;
    name: string;
};

export type AssetSavedFilter = {
    id: number;
    key: string;
    name: string;
    filters: {
        status?: string | null;
        category_id?: string | null;
        location_id?: string | null;
        asset_id?: string | null;
        value_min?: string | null;
        value_max?: string | null;
    };
};

export type AssetFiltersQuery = {
    search?: string;
    per_page?: string | number;
    sort?: string;
    order?: 'asc' | 'desc';
    sorts?: string;
    status?: string;
    category_id?: string | number;
    location_id?: string | number;
    asset_id?: string;
    value_min?: string | number;
    value_max?: string | number;
};

export type AssetFilterState = {
    status: string;
    category_id: string;
    location_id: string;
    asset_id: string;
    value_min: string;
    value_max: string;
};

export type AssetSortDraft = {
    field: AssetSortField;
    order: AssetSortDirection;
};

type FilterDefinition = {
    key: AssetFilterKey;
    label: string;
    input: 'select' | 'text' | 'number';
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    conditions: AssetFilterCondition[];
    defaultCondition: AssetFilterCondition;
};

type FilterRow = {
    id: string;
    fieldKey: AssetFilterKey | '';
    condition: AssetFilterCondition | '';
    value: string;
};

type SortDefinition = {
    key: AssetSortField;
    label: string;
};

type SortRow = {
    id: string;
    field: AssetSortField;
    order: AssetSortDirection;
};

type ResourceFilterField = 'category_id' | 'location_id';

type BuilderMode = 'filter' | 'sort' | null;
type CreateTarget = 'category' | 'location';

type PendingCreate = {
    target: CreateTarget;
    rowId: string;
};

type SharedPageProps = Record<string, unknown> & {
    flash?: {
        createdCategory?: AssetFilterOption;
        createdLocation?: AssetFilterOption;
    };
};

interface AssetQueryBuilderProps {
    categories: AssetFilterOption[];
    locations: AssetFilterOption[];
    savedFilters: AssetSavedFilter[];
    filters: AssetFiltersQuery;
    sorts: AssetSortDraft[];
}

interface BuilderOptionSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: Array<{ value: string; label: string }>;
    emptyLabel: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    createValue?: string;
    createLabel?: string;
    disabled?: boolean;
}

const EMPTY_FILTERS: AssetFilterState = {
    status: '',
    category_id: '',
    location_id: '',
    asset_id: '',
    value_min: '',
    value_max: '',
};

const FILTER_CONDITION_LABELS: Record<AssetFilterCondition, string> = {
    equals: '=',
    contains: 'contains',
    gte: '>=',
    lte: '<=',
};

const PANEL_TOGGLE_BUTTON_CLASS = 'h-9 gap-2 border-white bg-background text-foreground shadow-none font-normal shrink-0 hover:bg-muted';
const PANEL_ROW_CLASS = 'flex flex-col gap-2 md:flex-row md:items-center justify-between';
const EMPTY_ROW_CLASS = 'flex h-11 items-center rounded border border-dashed px-4 text-sm text-muted-foreground';
const DEFAULT_SORT: AssetSortDraft = {
    field: 'created_at',
    order: 'desc',
};
const SORT_DEFINITIONS: SortDefinition[] = [
    { key: 'created_at', label: 'Created Date' },
    { key: 'name', label: 'Name' },
    { key: 'asset_id', label: 'Asset ID' },
    { key: 'status', label: 'Status' },
    { key: 'value', label: 'Value' },
];

const createFilterRow = (): FilterRow => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldKey: '',
    condition: '',
    value: '',
});

const createSortRow = (field: AssetSortField, order: AssetSortDirection = 'desc'): SortRow => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    field,
    order,
});

const createResourceFilterRow = (fieldKey: ResourceFilterField, value: string): FilterRow => ({
    id: createFilterRow().id,
    fieldKey,
    condition: 'equals',
    value,
});

const sanitizeQuery = (query: Record<string, AssetQueryValue>) => (
    Object.fromEntries(
        Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
    ) as Record<string, string | number>
);

const normalizeDraftFilters = (filters: AssetFiltersQuery): AssetFilterState => ({
    status: String(filters.status ?? ''),
    category_id: String(filters.category_id ?? ''),
    location_id: String(filters.location_id ?? ''),
    asset_id: String(filters.asset_id ?? ''),
    value_min: String(filters.value_min ?? ''),
    value_max: String(filters.value_max ?? ''),
});

const normalizeAppliedSorts = (sorts: AssetSortDraft[]): AssetSortDraft[] => {
    if (sorts.length === 0) {
        return [DEFAULT_SORT];
    }

    return sorts;
};

const filtersToRows = (filters: AssetFilterState): FilterRow[] => {
    const rows: FilterRow[] = [];

    if (filters.status) {
        rows.push({ id: createFilterRow().id, fieldKey: 'status', condition: 'equals', value: filters.status });
    }

    if (filters.category_id) {
        rows.push({ id: createFilterRow().id, fieldKey: 'category_id', condition: 'equals', value: filters.category_id });
    }

    if (filters.location_id) {
        rows.push({ id: createFilterRow().id, fieldKey: 'location_id', condition: 'equals', value: filters.location_id });
    }

    if (filters.asset_id) {
        rows.push({ id: createFilterRow().id, fieldKey: 'asset_id', condition: 'contains', value: filters.asset_id });
    }

    if (filters.value_min) {
        rows.push({ id: createFilterRow().id, fieldKey: 'value', condition: 'gte', value: filters.value_min });
    }

    if (filters.value_max) {
        rows.push({ id: createFilterRow().id, fieldKey: 'value', condition: 'lte', value: filters.value_max });
    }

    return rows;
};

const rowsToFilters = (rows: FilterRow[]): AssetFilterState => {
    const nextFilters = { ...EMPTY_FILTERS };

    rows.forEach((row) => {
        if (!row.fieldKey || !row.condition || row.value.trim() === '') {
            return;
        }

        if (row.fieldKey === 'status' && row.condition === 'equals') {
            nextFilters.status = row.value;
        }

        if (row.fieldKey === 'category_id' && row.condition === 'equals') {
            nextFilters.category_id = row.value;
        }

        if (row.fieldKey === 'location_id' && row.condition === 'equals') {
            nextFilters.location_id = row.value;
        }

        if (row.fieldKey === 'asset_id' && row.condition === 'contains') {
            nextFilters.asset_id = row.value;
        }

        if (row.fieldKey === 'value' && row.condition === 'gte') {
            nextFilters.value_min = row.value;
        }

        if (row.fieldKey === 'value' && row.condition === 'lte') {
            nextFilters.value_max = row.value;
        }
    });

    return nextFilters;
};

const sortDraftsToRows = (sorts: AssetSortDraft[]): SortRow[] => {
    const normalizedSorts = normalizeAppliedSorts(sorts);

    if (normalizedSorts.length === 1 && normalizedSorts[0].field === DEFAULT_SORT.field && normalizedSorts[0].order === DEFAULT_SORT.order) {
        return [];
    }

    return normalizedSorts.map((sort) => createSortRow(sort.field, sort.order));
};

const sortRowsToDrafts = (rows: SortRow[]): AssetSortDraft[] => {
    if (rows.length === 0) {
        return [DEFAULT_SORT];
    }

    return rows.map((row) => ({
        field: row.field,
        order: row.order,
    }));
};

const getFilterDefinitions = (
    categories: AssetFilterOption[],
    locations: AssetFilterOption[],
): FilterDefinition[] => [
        {
            key: 'status',
            label: 'Status',
            input: 'select',
            options: [
                { value: 'available', label: 'Available' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'maintenance', label: 'In Maintenance' },
                { value: 'retired', label: 'Retired' },
            ],
            conditions: ['equals'],
            defaultCondition: 'equals',
        },
        {
            key: 'category_id',
            label: 'Category',
            input: 'select',
            options: categories.map((category) => ({ value: String(category.id), label: category.name })),
            conditions: ['equals'],
            defaultCondition: 'equals',
        },
        {
            key: 'location_id',
            label: 'Location',
            input: 'select',
            options: locations.map((location) => ({ value: String(location.id), label: location.name })),
            conditions: ['equals'],
            defaultCondition: 'equals',
        },
        {
            key: 'asset_id',
            label: 'Asset ID',
            input: 'text',
            placeholder: 'e.g. AST-204',
            conditions: ['contains'],
            defaultCondition: 'contains',
        },
        {
            key: 'value',
            label: 'Value',
            input: 'number',
            placeholder: '0.00',
            conditions: ['gte', 'lte'],
            defaultCondition: 'gte',
        },
    ];

function BuilderOptionSelect({
    value,
    onValueChange,
    placeholder,
    options,
    emptyLabel,
    open,
    onOpenChange,
    createValue,
    createLabel,
    disabled = false,
}: BuilderOptionSelectProps) {
    return (
        <Select open={open} onOpenChange={onOpenChange} value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent align="start" side="top">
                {options.length > 0 ? (
                    options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))
                ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel}</div>
                )}
                {createValue && createLabel ? (
                    <>
                        <SelectSeparator />
                        <SelectItem value={createValue}>{createLabel}</SelectItem>
                    </>
                ) : null}
            </SelectContent>
        </Select>
    );
}

export function AssetQueryBuilder({ categories, locations, savedFilters, filters, sorts }: AssetQueryBuilderProps) {
    const page = usePage<SharedPageProps>();
    const flash = page.props.flash;
    const appliedFilters = normalizeDraftFilters(filters);
    const appliedFiltersSignature = JSON.stringify(appliedFilters);
    const appliedSorts = normalizeAppliedSorts(sorts);
    const appliedSortSignature = JSON.stringify(appliedSorts);
    const filterDefinitions = useMemo(() => getFilterDefinitions(categories, locations), [categories, locations]);
    const filterDefinitionMap = useMemo(
        () => Object.fromEntries(filterDefinitions.map((definition) => [definition.key, definition])) as Record<AssetFilterKey, FilterDefinition>,
        [filterDefinitions],
    );

    const [builderMode, setBuilderMode] = useState<BuilderMode>(null);
    const [isSaveFilterDialogOpen, setIsSaveFilterDialogOpen] = useState(false);
    const [filterRows, setFilterRows] = useState<FilterRow[]>(() => filtersToRows(appliedFilters));
    const [sortRows, setSortRows] = useState<SortRow[]>(() => sortDraftsToRows(appliedSorts));
    const [savedFilterName, setSavedFilterName] = useState('');
    const [isSavingFilter, setIsSavingFilter] = useState(false);
    const [openSelectKey, setOpenSelectKey] = useState<string | null>(null);
    const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const handledCreatedCategoryId = useRef<number | null>(null);
    const handledCreatedLocationId = useRef<number | null>(null);

    useEffect(() => {
        setFilterRows(filtersToRows(appliedFilters));
    }, [appliedFiltersSignature]);

    useEffect(() => {
        setSortRows(sortDraftsToRows(appliedSorts));
    }, [appliedSortSignature]);

    useEffect(() => {
        if (pendingCreate?.target !== 'category' || openSelectKey !== null) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setIsCategoryDialogOpen(true);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [openSelectKey, pendingCreate]);

    useEffect(() => {
        if (pendingCreate?.target !== 'location' || openSelectKey !== null) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setIsLocationDialogOpen(true);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [openSelectKey, pendingCreate]);

    useEffect(() => {
        if (pendingCreate?.target !== 'category' || !flash?.createdCategory || handledCreatedCategoryId.current === flash.createdCategory.id) {
            return;
        }

        const createdCategory = flash.createdCategory;

        handledCreatedCategoryId.current = createdCategory.id;

        setFilterRows((current) => {
            const nextRows: FilterRow[] = current.map((row): FilterRow => (
                row.id === pendingCreate?.rowId
                    ? { ...row, fieldKey: 'category_id', condition: 'equals', value: String(createdCategory.id) }
                    : row
            ));

            if (nextRows.some((row) => row.id === pendingCreate?.rowId)) {
                return nextRows;
            }

            return [
                createResourceFilterRow('category_id', String(createdCategory.id)),
                ...nextRows,
            ];
        });

        setOpenSelectKey(null);
        setPendingCreate(null);
        setIsCategoryDialogOpen(false);
    }, [flash?.createdCategory, pendingCreate]);

    useEffect(() => {
        if (pendingCreate?.target !== 'location' || !flash?.createdLocation || handledCreatedLocationId.current === flash.createdLocation.id) {
            return;
        }

        const createdLocation = flash.createdLocation;

        handledCreatedLocationId.current = createdLocation.id;

        setFilterRows((current) => {
            const nextRows: FilterRow[] = current.map((row): FilterRow => (
                row.id === pendingCreate?.rowId
                    ? { ...row, fieldKey: 'location_id', condition: 'equals', value: String(createdLocation.id) }
                    : row
            ));

            if (nextRows.some((row) => row.id === pendingCreate?.rowId)) {
                return nextRows;
            }

            return [
                createResourceFilterRow('location_id', String(createdLocation.id)),
                ...nextRows,
            ];
        });

        setOpenSelectKey(null);
        setPendingCreate(null);
        setIsLocationDialogOpen(false);
    }, [flash?.createdLocation, pendingCreate]);

    const draftFilters = rowsToFilters(filterRows);
    const draftFiltersSignature = JSON.stringify(draftFilters);
    const sortDrafts = sortRowsToDrafts(sortRows);
    const sortRowsSignature = JSON.stringify(sortDrafts);
    const completedFilterRows = filterRows.filter((row) => row.fieldKey && row.condition && row.value.trim() !== '');
    const activeFilterCount = completedFilterRows.length;
    const hasDraftFilters = activeFilterCount > 0;
    const hasPendingFilterChanges = draftFiltersSignature !== appliedFiltersSignature;
    const hasPendingSortChanges = sortRowsSignature !== appliedSortSignature;

    const applyFilters = (nextFilters: AssetFilterState = draftFilters) => {
        router.get('/assets', sanitizeQuery({
            ...filters,
            ...nextFilters,
            page: 1,
        }), {
            preserveState: true,
            replace: true,
        });
    };

    const applySort = (nextSorts: AssetSortDraft[] = sortDrafts) => {
        router.get('/assets', sanitizeQuery({
            ...filters,
            sort: undefined,
            order: undefined,
            sorts: nextSorts.length === 1 && nextSorts[0].field === DEFAULT_SORT.field && nextSorts[0].order === DEFAULT_SORT.order
                ? undefined
                : nextSorts.map((sort) => `${sort.field}:${sort.order}`).join(','),
            page: 1,
        }), {
            preserveState: true,
            replace: true,
        });
    };

    const handleApplySavedFilter = (savedFilter: AssetSavedFilter) => {
        const nextFilters = {
            ...EMPTY_FILTERS,
            ...savedFilter.filters,
        } as AssetFilterState;

        setFilterRows(filtersToRows(nextFilters));
        setBuilderMode('filter');
        applyFilters(nextFilters);
    };

    const handleSaveFilter = () => {
        if (!savedFilterName.trim() || isSavingFilter) {
            return;
        }

        setIsSavingFilter(true);

        router.post('/assets/saved-filters', {
            name: savedFilterName.trim(),
            filters: draftFilters,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSavedFilterName('');
                setIsSaveFilterDialogOpen(false);
            },
            onFinish: () => setIsSavingFilter(false),
        });
    };

    const handleClearDraftFilters = () => {
        setFilterRows([]);
    };

    const handleAddFilterRow = () => {
        setFilterRows((current) => [createFilterRow(), ...current]);
    };

    const handleRemoveFilterRow = (rowId: string) => {
        setFilterRows((current) => current.filter((row) => row.id !== rowId));
    };

    const handleFilterFieldChange = (rowId: string, fieldKey: AssetFilterKey) => {
        const definition = filterDefinitionMap[fieldKey];

        setFilterRows((current) => current.map((row) => (
            row.id === rowId
                ? {
                    ...row,
                    fieldKey,
                    condition: definition.defaultCondition,
                    value: '',
                }
                : row
        )));
    };

    const handleFilterConditionChange = (rowId: string, condition: AssetFilterCondition) => {
        setFilterRows((current) => current.map((row) => (
            row.id === rowId
                ? {
                    ...row,
                    condition,
                    value: row.fieldKey === 'value' ? '' : row.value,
                }
                : row
        )));
    };

    const handleFilterValueChange = (rowId: string, value: string) => {
        setFilterRows((current) => current.map((row) => (
            row.id === rowId
                ? {
                    ...row,
                    value,
                }
                : row
        )));
    };

    const handleCreateFromRow = (target: CreateTarget, rowId: string) => {
        setPendingCreate({ target, rowId });
        setOpenSelectKey(null);
    };

    const renderFilterValueControl = (filterRow: FilterRow, definition: FilterDefinition | null) => {
        if (!definition) {
            return (
                <Input
                    value={filterRow.value}
                    onChange={(event) => handleFilterValueChange(filterRow.id, event.target.value)}
                    placeholder="Select a field first"
                    disabled
                />
            );
        }

        if (definition.input === 'select') {
            const createTarget = filterRow.fieldKey === 'category_id'
                ? {
                    createValue: 'create_category',
                    createLabel: 'Create new category',
                    emptyLabel: 'No categories yet.',
                }
                : filterRow.fieldKey === 'location_id'
                    ? {
                        createValue: 'create_location',
                        createLabel: 'Create new location',
                        emptyLabel: 'No locations yet.',
                    }
                    : {
                        emptyLabel: `No ${definition.label.toLowerCase()} options yet.`,
                    };

            return (
                <BuilderOptionSelect
                    value={filterRow.value}
                    onValueChange={(value) => {
                        if (value === 'create_category') {
                            handleCreateFromRow('category', filterRow.id);
                            return;
                        }

                        if (value === 'create_location') {
                            handleCreateFromRow('location', filterRow.id);
                            return;
                        }

                        handleFilterValueChange(filterRow.id, value);
                        setOpenSelectKey(null);
                    }}
                    placeholder={`Select ${definition.label.toLowerCase()}`}
                    options={definition.options ?? []}
                    emptyLabel={createTarget.emptyLabel}
                    open={openSelectKey === `value:${filterRow.id}`}
                    onOpenChange={(open) => setOpenSelectKey(open ? `value:${filterRow.id}` : null)}
                    createValue={'createValue' in createTarget ? createTarget.createValue : undefined}
                    createLabel={'createLabel' in createTarget ? createTarget.createLabel : undefined}
                />
            );
        }

        return (
            <Input
                type={definition.input === 'number' ? 'number' : 'text'}
                value={filterRow.value}
                onChange={(event) => handleFilterValueChange(filterRow.id, event.target.value)}
                placeholder={definition.placeholder ?? 'Enter value'}
                min={definition.input === 'number' ? '0' : undefined}
            />
        );
    };

    return (
        <>
            <div className="rounded border bg-background p-2 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className={builderMode === 'filter' ? PANEL_TOGGLE_BUTTON_CLASS : 'h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0'}
                        onClick={() => setBuilderMode((current) => current === 'filter' ? null : 'filter')}
                    >
                        <Filter size={16} />
                        {activeFilterCount > 0 ? `Filtered by ${activeFilterCount}` : 'Filter'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className={builderMode === 'sort' ? PANEL_TOGGLE_BUTTON_CLASS : 'h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0'}
                        onClick={() => setBuilderMode((current) => current === 'sort' ? null : 'sort')}
                    >
                        <ArrowUpDown size={16} /> Sort
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0">
                                <Bookmark size={16} /> Saved Filters
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-60">
                            <DropdownMenuLabel>Saved asset filters</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {savedFilters.length > 0 ? savedFilters.map((savedFilter) => (
                                <DropdownMenuItem key={savedFilter.id} onClick={() => handleApplySavedFilter(savedFilter)}>
                                    {savedFilter.name}
                                </DropdownMenuItem>
                            )) : (
                                <DropdownMenuItem disabled>
                                    No saved filters yet
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {builderMode === 'filter' ? (
                <div className="mt-4 rounded border bg-background p-4 shadow-sm">
                    <div className="space-y-3">
                        {filterRows.length > 0 ? filterRows.map((filterRow) => {
                            const definition = filterRow.fieldKey ? filterDefinitionMap[filterRow.fieldKey] : null;
                            const conditionOptions = definition?.conditions ?? [];

                            return (
                                <div key={filterRow.id} className={PANEL_ROW_CLASS}>
                                    <div className="md:min-w-48">
                                        <Select
                                            value={filterRow.fieldKey || undefined}
                                            onValueChange={(value) => handleFilterFieldChange(filterRow.id, value as AssetFilterKey)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select field" />
                                            </SelectTrigger>
                                            <SelectContent align="start" side="top">
                                                {filterDefinitions.map((definitionOption) => (
                                                    <SelectItem key={definitionOption.key} value={definitionOption.key}>
                                                        {definitionOption.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:w-28">
                                        <Select
                                            value={filterRow.condition || undefined}
                                            onValueChange={(value) => handleFilterConditionChange(filterRow.id, value as AssetFilterCondition)}
                                            disabled={!definition}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Condition" />
                                            </SelectTrigger>
                                            <SelectContent align="start" side="top">
                                                {conditionOptions.map((condition) => (
                                                    <SelectItem key={condition} value={condition}>
                                                        {FILTER_CONDITION_LABELS[condition]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1">
                                        {renderFilterValueControl(filterRow, definition)}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 shrink-0"
                                        onClick={() => handleRemoveFilterRow(filterRow.id)}
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Remove filter</span>
                                    </Button>
                                </div>
                            );
                        }) : (
                            <div className={EMPTY_ROW_CLASS}>
                                No filters added yet. Add one to narrow the assets list.
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button type="button" variant="outline" className="gap-2" onClick={handleAddFilterRow}>
                                <Plus size={16} /> Add filter
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Pick a field, choose a condition, then fill in the value.
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button type="button" variant="ghost" className="px-2 text-sm text-muted-foreground" onClick={handleClearDraftFilters}>
                                Clear all
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="gap-2"
                                onClick={() => setIsSaveFilterDialogOpen(true)}
                                disabled={!hasDraftFilters}
                            >
                                <Bookmark size={16} /> Save Filter
                            </Button>
                            <Button type="button" onClick={() => applyFilters()} disabled={!hasPendingFilterChanges}>
                                Apply filters
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            {builderMode === 'sort' ? (
                <div className="mt-4 rounded border bg-background p-4 shadow-sm">
                    <div className="space-y-3">
                        {sortRows.length > 0 ? sortRows.map((sortRow) => (
                            <div key={sortRow.id} className={PANEL_ROW_CLASS}>
                                <div className="flex-1 md:max-w-72">
                                    <Select
                                        value={sortRow.field}
                                        onValueChange={(value) => {
                                            setSortRows((current) => current.map((row) => (
                                                row.id === sortRow.id
                                                    ? { ...row, field: value as AssetSortField }
                                                    : row
                                            )));
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select sort field" />
                                        </SelectTrigger>
                                        <SelectContent align="start" side="top">
                                            {SORT_DEFINITIONS.map((definition) => (
                                                <SelectItem key={definition.key} value={definition.key}>
                                                    {definition.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex gap-1'>
                                    <div className="flex items-center rounded border p-1 gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className={sortRow.order === 'asc' ? 'h-7 bg-muted text-foreground shadow-none' : 'h-7 text-muted-foreground shadow-none'}
                                            onClick={() => setSortRows((current) => current.map((row) => (
                                                row.id === sortRow.id
                                                    ? { ...row, order: 'asc' }
                                                    : row
                                            )))}
                                        >
                                            Ascending
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className={sortRow.order === 'desc' ? 'h-7 bg-muted text-foreground shadow-none' : 'h-7 text-muted-foreground shadow-none'}
                                            onClick={() => setSortRows((current) => current.map((row) => (
                                                row.id === sortRow.id
                                                    ? { ...row, order: 'desc' }
                                                    : row
                                            )))}
                                        >
                                            Reverse
                                        </Button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 shrink-0"
                                        onClick={() => setSortRows((current) => current.filter((row) => row.id !== sortRow.id))}
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Remove sort</span>
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <div className={EMPTY_ROW_CLASS}>
                                No sorting added yet. Add one to override the default created date order.
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" variant="outline" className="gap-2">
                                        <Plus size={16} /> Add sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuLabel>Pick a column to sort by</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {SORT_DEFINITIONS.map((definition) => (
                                        <DropdownMenuItem key={definition.key} onClick={() => setSortRows((current) => [...current, createSortRow(definition.key)])}>
                                            {definition.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <span className="text-sm text-muted-foreground">
                                Add sort blocks in the order they should be applied, then choose ascending or reverse.
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button type="button" onClick={() => applySort()} disabled={!hasPendingSortChanges}>
                                Apply sort
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            <Dialog open={isSaveFilterDialogOpen} onOpenChange={setIsSaveFilterDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Save filter</DialogTitle>
                        <DialogDescription>
                            Save the current asset filter set so you can apply it again from the toolbar.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="saved-filter-name">Filter name</Label>
                        <Input
                            id="saved-filter-name"
                            value={savedFilterName}
                            onChange={(event) => setSavedFilterName(event.target.value)}
                            placeholder="e.g. Available warehouse assets"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsSaveFilterDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSaveFilter} disabled={!savedFilterName.trim() || isSavingFilter}>
                            Save filter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CategoryFormDialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
                redirectTo="/assets"
                preserveState
            />
            <LocationFormDialog
                open={isLocationDialogOpen}
                onOpenChange={setIsLocationDialogOpen}
                redirectTo="/assets"
                preserveState
            />
        </>
    );
}
