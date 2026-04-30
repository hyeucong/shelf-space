import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    AssetFilterCondition,
    AssetFilterKey,
    AssetFilterOption,
    AssetFilterState,
    AssetFiltersQuery,
    AssetSavedFilter,
    AssetSortDraft,
    BuilderMode,
    CreateTarget,
    FilterDefinition,
    FilterRow,
    PendingCreate,
    SavedFilterDialogMode,
    SharedPageProps,
    SortRow,
} from './types';
import {
    DEFAULT_SORT,
    EMPTY_FILTERS,
    NESTED_OVERLAY_SELECTOR,
    createFilterRow,
    createResourceFilterRow,
    filtersToRows,
    getFilterDefinitions,
    normalizeAppliedSorts,
    normalizeDraftFilters,
    rowsToFilters,
    sanitizeQuery,
    sortDraftsToRows,
    sortRowsToDrafts,
} from './constants';

export function useAssetQuery(
    categories: AssetFilterOption[],
    locations: AssetFilterOption[],
    filters: AssetFiltersQuery,
    sorts: AssetSortDraft[],
    resourcePath: string,
    showSavedFiltersButton: boolean,
    filterActionLayout: 'default' | 'confirm'
) {
    const page = usePage<SharedPageProps>();
    const flash = page.props.flash;
    const builderContainerRef = useRef<HTMLDivElement | null>(null);
    
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
    const [savedFilterDialogMode, setSavedFilterDialogMode] = useState<SavedFilterDialogMode>(null);
    const [selectedSavedFilter, setSelectedSavedFilter] = useState<AssetSavedFilter | null>(null);
    const [editingSavedFilterName, setEditingSavedFilterName] = useState('');
    const [isUpdatingSavedFilter, setIsUpdatingSavedFilter] = useState(false);
    const [isDeletingSavedFilter, setIsDeletingSavedFilter] = useState(false);
    const [openSelectKey, setOpenSelectKey] = useState<string | null>(null);
    const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    
    const handledCreatedCategoryId = useRef<string | number | null>(null);
    const handledCreatedLocationId = useRef<string | number | null>(null);

    // Close on Escape or outside click
    useEffect(() => {
        if (builderMode === null) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (document.querySelector(NESTED_OVERLAY_SELECTOR)) return;
                setBuilderMode(null);
                setOpenSelectKey(null);
            }
        };

        const handlePointerDown = (event: MouseEvent | PointerEvent | TouchEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (builderContainerRef.current?.contains(target)) return;
            if (target instanceof Element && target.closest(NESTED_OVERLAY_SELECTOR)) return;
            if (document.querySelector(NESTED_OVERLAY_SELECTOR)) return;
            
            setBuilderMode(null);
            setOpenSelectKey(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [builderMode]);

    // Update rows when applied filters/sorts change
    useEffect(() => {
        setFilterRows(filtersToRows(appliedFilters));
    }, [appliedFiltersSignature]);

    useEffect(() => {
        setSortRows(sortDraftsToRows(appliedSorts));
    }, [appliedSortSignature]);

    // Handle creation dialogs
    useEffect(() => {
        if (pendingCreate?.target === 'category' && openSelectKey === null) {
            const timeoutId = window.setTimeout(() => setIsCategoryDialogOpen(true), 0);
            return () => window.clearTimeout(timeoutId);
        }
    }, [openSelectKey, pendingCreate]);

    useEffect(() => {
        if (pendingCreate?.target === 'location' && openSelectKey === null) {
            const timeoutId = window.setTimeout(() => setIsLocationDialogOpen(true), 0);
            return () => window.clearTimeout(timeoutId);
        }
    }, [openSelectKey, pendingCreate]);

    // Handle flash messages for newly created resources
    useEffect(() => {
        if (pendingCreate?.target === 'category' && flash?.createdCategory && handledCreatedCategoryId.current !== flash.createdCategory.id) {
            const createdCategory = flash.createdCategory;
            handledCreatedCategoryId.current = createdCategory.id;

            setFilterRows((current) => {
                const nextRows = current.map((row) => (
                    row.id === pendingCreate?.rowId
                        ? { ...row, fieldKey: 'category_id' as const, condition: 'equals' as const, value: String(createdCategory.id) }
                        : row
                ));

                if (nextRows.some((row) => row.id === pendingCreate?.rowId)) return nextRows;
                return [createResourceFilterRow('category_id', String(createdCategory.id)), ...nextRows];
            });

            setOpenSelectKey(null);
            setPendingCreate(null);
            setIsCategoryDialogOpen(false);
        }
    }, [flash?.createdCategory, pendingCreate]);

    useEffect(() => {
        if (pendingCreate?.target === 'location' && flash?.createdLocation && handledCreatedLocationId.current !== flash.createdLocation.id) {
            const createdLocation = flash.createdLocation;
            handledCreatedLocationId.current = createdLocation.id;

            setFilterRows((current) => {
                const nextRows = current.map((row) => (
                    row.id === pendingCreate?.rowId
                        ? { ...row, fieldKey: 'location_id' as const, condition: 'equals' as const, value: String(createdLocation.id) }
                        : row
                ));

                if (nextRows.some((row) => row.id === pendingCreate?.rowId)) return nextRows;
                return [createResourceFilterRow('location_id', String(createdLocation.id)), ...nextRows];
            });

            setOpenSelectKey(null);
            setPendingCreate(null);
            setIsLocationDialogOpen(false);
        }
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
    const showConfirmFilterActions = filterActionLayout === 'confirm';

    const applyFilters = (nextFilters: AssetFilterState = draftFilters) => {
        router.get(resourcePath, sanitizeQuery({
            ...filters,
            ...nextFilters,
            page: 1,
        }), {
            preserveState: true,
            replace: true,
        });
    };

    const applySort = (nextSorts: AssetSortDraft[] = sortDrafts) => {
        router.get(resourcePath, sanitizeQuery({
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
        const nextFilters = { ...EMPTY_FILTERS, ...savedFilter.filters } as AssetFilterState;
        setFilterRows(filtersToRows(nextFilters));
        setBuilderMode(null);
        applyFilters(nextFilters);
    };

    const handleOpenEditSavedFilter = (savedFilter: AssetSavedFilter) => {
        setSelectedSavedFilter(savedFilter);
        setEditingSavedFilterName(savedFilter.name);
        setSavedFilterDialogMode('edit');
    };

    const handleOpenDeleteSavedFilter = (savedFilter: AssetSavedFilter) => {
        setSelectedSavedFilter(savedFilter);
        setSavedFilterDialogMode('delete');
    };

    const handleCloseSavedFilterDialog = (force = false) => {
        if (!force && (isUpdatingSavedFilter || isDeletingSavedFilter)) return;
        setSavedFilterDialogMode(null);
        setSelectedSavedFilter(null);
        setEditingSavedFilterName('');
    };

    const handleUpdateSavedFilter = () => {
        if (!selectedSavedFilter || !editingSavedFilterName.trim() || isUpdatingSavedFilter) return;
        setIsUpdatingSavedFilter(true);
        router.patch(`/assets/saved-filters/${selectedSavedFilter.id}`, {
            name: editingSavedFilterName.trim(),
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => handleCloseSavedFilterDialog(true),
            onFinish: () => setIsUpdatingSavedFilter(false),
        });
    };

    const handleDeleteSavedFilter = () => {
        if (!selectedSavedFilter || isDeletingSavedFilter) return;
        setIsDeletingSavedFilter(true);
        router.delete(`/assets/saved-filters/${selectedSavedFilter.id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                handleCloseSavedFilterDialog(true);
                setBuilderMode(showSavedFiltersButton ? 'saved' : null);
            },
            onFinish: () => setIsDeletingSavedFilter(false),
        });
    };

    const handleSaveFilter = () => {
        if (!savedFilterName.trim() || isSavingFilter) return;
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

    const handleClearDraftFilters = () => setFilterRows([]);
    const handleAddFilterRow = () => setFilterRows((current) => [createFilterRow(), ...current]);
    const handleRemoveFilterRow = (rowId: string) => setFilterRows((current) => current.filter((row) => row.id !== rowId));

    const handleFilterFieldChange = (rowId: string, fieldKey: AssetFilterKey) => {
        const definition = filterDefinitionMap[fieldKey];
        setFilterRows((current) => current.map((row) => (
            row.id === rowId
                ? { ...row, fieldKey, condition: definition.defaultCondition, value: '' }
                : row
        )));
    };

    const handleFilterConditionChange = (rowId: string, condition: AssetFilterCondition) => {
        setFilterRows((current) => current.map((row) => (
            row.id === rowId
                ? { ...row, condition, value: row.fieldKey === 'value' ? '' : row.value }
                : row
        )));
    };

    const handleFilterValueChange = (rowId: string, value: string) => {
        setFilterRows((current) => current.map((row) => (
            row.id === rowId ? { ...row, value } : row
        )));
    };

    const handleCreateFromRow = (target: CreateTarget, rowId: string) => {
        setPendingCreate({ target, rowId });
        setOpenSelectKey(null);
    };

    const closeBuilderPanel = () => {
        setBuilderMode(null);
        setOpenSelectKey(null);
    };

    return {
        // State
        builderMode,
        setBuilderMode,
        filterRows,
        sortRows,
        setSortRows,
        savedFilterName,
        setSavedFilterName,
        isSavingFilter,
        setIsSavingFilter,
        isSaveFilterDialogOpen,
        setIsSaveFilterDialogOpen,
        savedFilterDialogMode,
        selectedSavedFilter,
        editingSavedFilterName,
        setEditingSavedFilterName,
        isUpdatingSavedFilter,
        isDeletingSavedFilter,
        openSelectKey,
        setOpenSelectKey,
        isCategoryDialogOpen,
        setIsCategoryDialogOpen,
        isLocationDialogOpen,
        setIsLocationDialogOpen,
        builderContainerRef,
        
        // Computed
        filterDefinitions,
        filterDefinitionMap,
        activeFilterCount,
        completedFilterRows,
        hasDraftFilters,
        hasPendingFilterChanges,
        hasPendingSortChanges,
        showConfirmFilterActions,
        draftFilters,
        sortDrafts,
        
        // Handlers
        applyFilters,
        applySort,
        handleApplySavedFilter,
        handleOpenEditSavedFilter,
        handleOpenDeleteSavedFilter,
        handleCloseSavedFilterDialog,
        handleUpdateSavedFilter,
        handleDeleteSavedFilter,
        handleSaveFilter,
        handleClearDraftFilters,
        handleAddFilterRow,
        handleRemoveFilterRow,
        handleFilterFieldChange,
        handleFilterConditionChange,
        handleFilterValueChange,
        handleCreateFromRow,
        closeBuilderPanel,
    };
}
