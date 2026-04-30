import {
    AssetFilterCondition,
    AssetFilterKey,
    AssetFilterOption,
    AssetFilterState,
    AssetFiltersQuery,
    AssetQueryValue,
    AssetSortDraft,
    AssetSortField,
    AssetSortDirection,
    FilterDefinition,
    FilterRow,
    ResourceFilterField,
    SortDefinition,
    SortRow,
} from './types';

export const EMPTY_FILTERS: AssetFilterState = {
    status: '',
    category_id: '',
    location_id: '',
    asset_id: '',
    value_min: '',
    value_max: '',
};

export const FILTER_CONDITION_LABELS: Record<AssetFilterCondition, string> = {
    equals: '=',
    contains: 'contains',
    gte: '>=',
    lte: '<=',
};

export const PANEL_TOGGLE_BUTTON_CLASS = 'h-9 gap-2 border-white bg-background text-foreground shadow-none font-normal shrink-0 hover:bg-muted';
export const PANEL_ROW_CLASS = 'flex flex-col gap-2 md:flex-row md:items-center justify-between';
export const EMPTY_ROW_CLASS = 'flex h-11 items-center rounded border border-dashed px-4 text-sm text-muted-foreground';

export const DEFAULT_SORT: AssetSortDraft = {
    field: 'created_at',
    order: 'desc',
};

export const NESTED_OVERLAY_SELECTOR = '[data-slot="select-content"], [data-slot="dropdown-menu-content"], [data-slot="dialog-content"]';

export const SORT_DEFINITIONS: SortDefinition[] = [
    { key: 'created_at', label: 'Created Date' },
    { key: 'name', label: 'Name' },
    { key: 'asset_id', label: 'Asset ID' },
    { key: 'status', label: 'Status' },
    { key: 'value', label: 'Value' },
];

export const createFilterRow = (): FilterRow => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldKey: '',
    condition: '',
    value: '',
});

export const createSortRow = (field: AssetSortField, order: AssetSortDirection = 'desc'): SortRow => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    field,
    order,
});

export const createResourceFilterRow = (fieldKey: ResourceFilterField, value: string): FilterRow => ({
    id: createFilterRow().id,
    fieldKey,
    condition: 'equals',
    value,
});

export const sanitizeQuery = (query: Record<string, AssetQueryValue>) => (
    Object.fromEntries(
        Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
    ) as Record<string, string | number>
);

export const normalizeDraftFilters = (filters: AssetFiltersQuery): AssetFilterState => ({
    status: String(filters.status ?? ''),
    category_id: String(filters.category_id ?? ''),
    location_id: String(filters.location_id ?? ''),
    asset_id: String(filters.asset_id ?? ''),
    value_min: String(filters.value_min ?? ''),
    value_max: String(filters.value_max ?? ''),
});

export const normalizeAppliedSorts = (sorts: AssetSortDraft[]): AssetSortDraft[] => {
    if (sorts.length === 0) {
        return [DEFAULT_SORT];
    }

    return sorts;
};

export const filtersToRows = (filters: AssetFilterState): FilterRow[] => {
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

export const rowsToFilters = (rows: FilterRow[]): AssetFilterState => {
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

export const sortDraftsToRows = (sorts: AssetSortDraft[]): SortRow[] => {
    const normalizedSorts = normalizeAppliedSorts(sorts);

    if (normalizedSorts.length === 1 && normalizedSorts[0].field === DEFAULT_SORT.field && normalizedSorts[0].order === DEFAULT_SORT.order) {
        return [];
    }

    return normalizedSorts.map((sort) => createSortRow(sort.field, sort.order));
};

export const sortRowsToDrafts = (rows: SortRow[]): AssetSortDraft[] => {
    if (rows.length === 0) {
        return [DEFAULT_SORT];
    }

    return rows.map((row) => ({
        field: row.field,
        order: row.order,
    }));
};

export const getFilterDefinitions = (
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
