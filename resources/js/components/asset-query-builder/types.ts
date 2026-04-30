import type { ReactNode } from 'react';

export type AssetQueryValue = string | number | undefined;
export type AssetFilterKey = 'status' | 'category_id' | 'location_id' | 'asset_id' | 'value';
export type AssetFilterCondition = 'equals' | 'contains' | 'gte' | 'lte';
export type AssetSortField = 'created_at' | 'name' | 'value' | 'asset_id' | 'status';
export type AssetSortDirection = 'asc' | 'desc';

export type AssetFilterOption = {
    id: string | number;
    name: string;
};

export type AssetSavedFilter = {
    id: string | number;
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

export type FilterDefinition = {
    key: AssetFilterKey;
    label: string;
    input: 'select' | 'text' | 'number';
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    conditions: AssetFilterCondition[];
    defaultCondition: AssetFilterCondition;
};

export type FilterRow = {
    id: string;
    fieldKey: AssetFilterKey | '';
    condition: AssetFilterCondition | '';
    value: string;
};

export type SortDefinition = {
    key: AssetSortField;
    label: string;
};

export type SortRow = {
    id: string;
    field: AssetSortField;
    order: AssetSortDirection;
};

export type ResourceFilterField = 'category_id' | 'location_id';

export type BuilderMode = 'filter' | 'sort' | 'saved' | null;
export type CreateTarget = 'category' | 'location';

export type PendingCreate = {
    target: CreateTarget;
    rowId: string;
};

export type SavedFilterDialogMode = 'edit' | 'delete' | null;

export type SharedPageProps = Record<string, unknown> & {
    flash?: {
        createdCategory?: AssetFilterOption;
        createdLocation?: AssetFilterOption;
    };
};

export interface AssetQueryBuilderProps {
    categories: AssetFilterOption[];
    locations: AssetFilterOption[];
    savedFilters: AssetSavedFilter[];
    filters: AssetFiltersQuery;
    sorts: AssetSortDraft[];
    resourcePath?: string;
    showFilterButton?: boolean;
    showSortButton?: boolean;
    showSavedFiltersButton?: boolean;
    filterActionLayout?: 'default' | 'confirm';
}

export interface BuilderOptionSelectProps {
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
