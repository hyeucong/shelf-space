import { ArrowUpDown, Bookmark, Filter, Pencil, Plus, Trash2, X } from 'lucide-react';

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
import { CategoryFormDialog } from '@/pages/categories/create';
import { LocationFormDialog } from '@/pages/locations/form-dialog';

import {
    EMPTY_ROW_CLASS,
    FILTER_CONDITION_LABELS,
    PANEL_ROW_CLASS,
    PANEL_TOGGLE_BUTTON_CLASS,
    SORT_DEFINITIONS,
} from './asset-query-builder/constants';
import {
    AssetFilterCondition,
    AssetFilterKey,
    AssetQueryBuilderProps,
    AssetSortField,
    BuilderOptionSelectProps,
    FilterDefinition,
    FilterRow,
    SortRow,
} from './asset-query-builder/types';
import { useAssetQuery } from './asset-query-builder/use-asset-query';

export type { AssetFilterOption, AssetFiltersQuery, AssetQueryValue, AssetSavedFilter, AssetSortDraft } from './asset-query-builder/types';

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

export function AssetQueryBuilder(props: AssetQueryBuilderProps) {
    const {
        categories,
        locations,
        savedFilters,
        filters,
        sorts,
        resourcePath = '/assets',
        showFilterButton = true,
        showSortButton = true,
        showSavedFiltersButton = true,
        filterActionLayout = 'default',
    } = props;

    const {
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
    } = useAssetQuery(
        categories,
        locations,
        filters,
        sorts,
        resourcePath,
        showSavedFiltersButton,
        filterActionLayout
    );

    const overlayWidth = 'min(52rem, calc(100vw - 2rem))';
    const panelTitle = builderMode === 'filter'
        ? 'Filter assets'
        : builderMode === 'sort'
            ? 'Sort assets'
            : 'Saved filters';
    const panelDescription = builderMode === 'filter'
        ? 'Build filters here without shifting the table layout below.'
        : builderMode === 'sort'
            ? 'Adjust the sort order in an overlay panel.'
            : 'Apply, rename, or remove saved asset filter sets.';

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
            <div ref={builderContainerRef} className="relative rounded bg-background shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {showFilterButton ? (
                        <Button
                            type="button"
                            variant="outline"
                            className={builderMode === 'filter' ? PANEL_TOGGLE_BUTTON_CLASS : 'h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0'}
                            onClick={() => setBuilderMode((current) => current === 'filter' ? null : 'filter')}
                            aria-expanded={builderMode === 'filter'}
                        >
                            <Filter size={16} />
                            {activeFilterCount > 0 ? `Filtered by ${activeFilterCount}` : 'Filter'}
                        </Button>
                    ) : null}
                    {showSortButton ? (
                        <Button
                            type="button"
                            variant="outline"
                            className={builderMode === 'sort' ? PANEL_TOGGLE_BUTTON_CLASS : 'h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0'}
                            onClick={() => setBuilderMode((current) => current === 'sort' ? null : 'sort')}
                            aria-expanded={builderMode === 'sort'}
                        >
                            <ArrowUpDown size={16} /> Sort
                        </Button>
                    ) : null}
                    {showSavedFiltersButton ? (
                        <Button
                            type="button"
                            variant="outline"
                            className={builderMode === 'saved' ? PANEL_TOGGLE_BUTTON_CLASS : 'h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0'}
                            onClick={() => setBuilderMode((current) => current === 'saved' ? null : 'saved')}
                            aria-expanded={builderMode === 'saved'}
                        >
                            <Bookmark size={16} /> Saved
                        </Button>
                    ) : null}
                </div>

                {builderMode ? (
                    <div
                        className="absolute left-0 top-full z-50 mt-3 flex flex-col overflow-hidden rounded border bg-background shadow-xl"
                        style={{ width: overlayWidth }}
                    >
                        <div className="flex items-start justify-between border-b px-4 py-3">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">{panelTitle}</h3>
                                <p className="text-xs text-muted-foreground">{panelDescription}</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={closeBuilderPanel}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close panel</span>
                            </Button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-4 pb-3">
                            {builderMode === 'filter' ? (
                                <div className="space-y-3">
                                    {filterRows.length > 0 ? filterRows.map((filterRow) => {
                                        const definition = filterRow.fieldKey ? filterDefinitionMap[filterRow.fieldKey] : null;

                                        return (
                                            <div key={filterRow.id} className="flex flex-wrap items-center gap-2 rounded border bg-muted/20 p-2 md:flex-nowrap">
                                                <div className="w-full md:w-1/3">
                                                    <Select
                                                        value={filterRow.fieldKey}
                                                        onValueChange={(value: AssetFilterKey) => handleFilterFieldChange(filterRow.id, value)}
                                                        open={openSelectKey === `field:${filterRow.id}`}
                                                        onOpenChange={(open) => setOpenSelectKey(open ? `field:${filterRow.id}` : null)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select field" />
                                                        </SelectTrigger>
                                                        <SelectContent align="start" side="top">
                                                            {filterDefinitions.map((def) => (
                                                                <SelectItem key={def.key} value={def.key}>
                                                                    {def.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="w-full md:w-24">
                                                    <Select
                                                        value={filterRow.condition}
                                                        onValueChange={(value: AssetFilterCondition) => handleFilterConditionChange(filterRow.id, value)}
                                                        disabled={!filterRow.fieldKey}
                                                        open={openSelectKey === `condition:${filterRow.id}`}
                                                        onOpenChange={(open) => setOpenSelectKey(open ? `condition:${filterRow.id}` : null)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Cond" />
                                                        </SelectTrigger>
                                                        <SelectContent align="start" side="top">
                                                            {definition?.conditions.map((cond) => (
                                                                <SelectItem key={cond} value={cond}>
                                                                    {FILTER_CONDITION_LABELS[cond]}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="min-w-0 flex-1">
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
                                            {!showConfirmFilterActions && showSavedFiltersButton ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="gap-2"
                                                    onClick={() => setIsSaveFilterDialogOpen(true)}
                                                    disabled={!hasDraftFilters}
                                                >
                                                    <Bookmark size={16} /> Save filter set
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ) : builderMode === 'sort' ? (
                                <div className="space-y-3">
                                    {sortRows.length > 0 ? sortRows.map((sortRow, index) => (
                                        <div key={sortRow.id} className="flex items-center gap-2 rounded border bg-muted/20 p-2">
                                            <span className="w-8 shrink-0 text-center text-xs font-medium text-muted-foreground">
                                                {index === 0 ? 'Sort' : 'Then'}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <Select
                                                    value={sortRow.field}
                                                    onValueChange={(value: AssetSortField) => {
                                                        setSortRows((current) => current.map((row) => (
                                                            row.id === sortRow.id ? { ...row, field: value } : row
                                                        )));
                                                    }}
                                                    open={openSelectKey === `sortField:${sortRow.id}`}
                                                    onOpenChange={(open) => setOpenSelectKey(open ? `sortField:${sortRow.id}` : null)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Sort field" />
                                                    </SelectTrigger>
                                                    <SelectContent align="start" side="top">
                                                        {SORT_DEFINITIONS.map((def) => (
                                                            <SelectItem key={def.key} value={def.key}>
                                                                {def.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="w-28 shrink-0">
                                                <Select
                                                    value={sortRow.order}
                                                    onValueChange={(value: 'asc' | 'desc') => {
                                                        setSortRows((current) => current.map((row) => (
                                                            row.id === sortRow.id ? { ...row, order: value } : row
                                                        )));
                                                    }}
                                                    open={openSelectKey === `sortOrder:${sortRow.id}`}
                                                    onOpenChange={(open) => setOpenSelectKey(open ? `sortOrder:${sortRow.id}` : null)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Order" />
                                                    </SelectTrigger>
                                                    <SelectContent align="start" side="top">
                                                        <SelectItem value="asc">Ascending</SelectItem>
                                                        <SelectItem value="desc">Descending</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                    )) : (
                                        <div className={EMPTY_ROW_CLASS}>
                                            Using default sorting (Newest First).
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => setSortRows((current) => [...current, {
                                                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                                                field: 'name',
                                                order: 'asc'
                                            }])}
                                            disabled={sortRows.length >= 3}
                                        >
                                            <Plus size={16} /> Add level
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Sort by up to 3 levels (e.g. Status then Name).
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {savedFilters.length > 0 ? savedFilters.map((savedFilter) => (
                                        <div
                                            key={savedFilter.id}
                                            className="group flex items-center justify-between gap-3 rounded border border-transparent p-2 hover:border-border hover:bg-muted/30"
                                        >
                                            <button
                                                type="button"
                                                className="min-w-0 flex-1 text-left"
                                                onClick={() => handleApplySavedFilter(savedFilter)}
                                            >
                                                <div className="truncate font-medium">{savedFilter.name}</div>
                                                <div className="truncate text-xs text-muted-foreground">
                                                    {Object.entries(savedFilter.filters)
                                                        .filter(([, value]) => value !== null && value !== undefined && value !== '')
                                                        .map(([key, value]) => `${key}: ${value}`)
                                                        .join(', ') || 'No filters'}
                                                </div>
                                            </button>
                                            <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleOpenEditSavedFilter(savedFilter)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit name</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleOpenDeleteSavedFilter(savedFilter)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className={EMPTY_ROW_CLASS}>
                                            No saved filters yet. Create some from the filter tab.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t bg-muted/20 px-4 py-3">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex-1">
                                    {builderMode === 'filter' && hasPendingFilterChanges && !showConfirmFilterActions ? (
                                        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                                            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                            Pending changes. Apply to see updated results.
                                        </div>
                                    ) : null}
                                    {builderMode === 'sort' && hasPendingSortChanges ? (
                                        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                                            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                            Pending sort changes. Apply to update order.
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={closeBuilderPanel}>
                                        Cancel
                                    </Button>
                                    {builderMode === 'filter' ? (
                                        <>
                                            {showConfirmFilterActions ? (
                                                <Button
                                                    type="button"
                                                    className="gap-2 rounded border-none bg-[#f0642d] text-white hover:bg-[#d95627]"
                                                    onClick={() => setIsSaveFilterDialogOpen(true)}
                                                    disabled={!hasDraftFilters}
                                                >
                                                    <Bookmark size={16} /> Save filter set
                                                </Button>
                                            ) : null}
                                            <Button
                                                type="button"
                                                className="gap-2 rounded border-none bg-primary text-primary-foreground"
                                                onClick={() => applyFilters()}
                                                disabled={!hasPendingFilterChanges}
                                            >
                                                Apply filters
                                            </Button>
                                        </>
                                    ) : builderMode === 'sort' ? (
                                        <Button
                                            type="button"
                                            className="gap-2 rounded border-none bg-primary text-primary-foreground"
                                            onClick={() => applySort()}
                                            disabled={!hasPendingSortChanges}
                                        >
                                            Apply sorting
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            <Dialog open={isSaveFilterDialogOpen} onOpenChange={setIsSaveFilterDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Save filter set</DialogTitle>
                        <DialogDescription>
                            Give this filter set a name to easily apply it later from the Saved tab.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="filter-name">Name</Label>
                            <Input
                                id="filter-name"
                                placeholder="e.g. Available Assets"
                                value={savedFilterName}
                                onChange={(e) => setSavedFilterName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="rounded bg-muted p-3 text-xs">
                            <div className="mb-1 font-medium text-foreground">Filters to save:</div>
                            <div className="text-muted-foreground">
                                {completedFilterRows.map((row: FilterRow) => {
                                    const label = filterDefinitionMap[row.fieldKey as AssetFilterKey]?.label || row.fieldKey;
                                    const condition = FILTER_CONDITION_LABELS[row.condition as AssetFilterCondition];
                                    return (
                                        <div key={row.id}>
                                            • {label} {condition} {row.value}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSaveFilterDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveFilter}
                            disabled={!savedFilterName.trim() || isSavingFilter}
                            className="rounded border-none bg-primary text-primary-foreground"
                        >
                            {isSavingFilter ? 'Saving...' : 'Save filters'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={savedFilterDialogMode === 'edit'} onOpenChange={(open) => !open && handleCloseSavedFilterDialog()}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Rename saved filter</DialogTitle>
                        <DialogDescription>
                            Enter a new name for this saved filter set.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-filter-name">Name</Label>
                            <Input
                                id="edit-filter-name"
                                value={editingSavedFilterName}
                                onChange={(e) => setEditingSavedFilterName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleCloseSavedFilterDialog()} disabled={isUpdatingSavedFilter}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleUpdateSavedFilter}
                            disabled={!editingSavedFilterName.trim() || isUpdatingSavedFilter}
                            className="rounded border-none bg-primary text-primary-foreground"
                        >
                            {isUpdatingSavedFilter ? 'Updating...' : 'Update name'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={savedFilterDialogMode === 'delete'} onOpenChange={(open) => !open && handleCloseSavedFilterDialog()}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Delete saved filter</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{selectedSavedFilter?.name}"</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 md:gap-0">
                        <Button variant="outline" onClick={() => handleCloseSavedFilterDialog()} disabled={isDeletingSavedFilter}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteSavedFilter}
                            disabled={isDeletingSavedFilter}
                            className="rounded"
                        >
                            {isDeletingSavedFilter ? 'Deleting...' : 'Delete saved filter'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CategoryFormDialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
            />

            <LocationFormDialog
                open={isLocationDialogOpen}
                onOpenChange={setIsLocationDialogOpen}
            />
        </>
    );
}
