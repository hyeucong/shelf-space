import { router } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types/pagination';

type FilterValue = string | number | undefined;

export interface ResourceIndexColumn<T> {
    key: string;
    header: ReactNode;
    headerClassName?: string;
    cellClassName?: string | ((item: T) => string | undefined);
    render: (item: T) => ReactNode;
}

export interface ResourceIndexSortOption {
    value: string;
    label: string;
}

interface ResourceIndexSelection<T extends { id: string | number }> {
    selectedIds: (string | number)[];
    onToggleAll: (checked: boolean) => void;
    onToggleOne: (item: T, checked: boolean) => void;
    getLabel: (item: T) => string;
}

interface ResourceIndexSortConfig {
    value: string;
    options: ResourceIndexSortOption[];
}

interface ResourceIndexEmptyState {
    title: string;
    description?: string;
}

interface ResourceIndexRowActions<T> {
    header?: ReactNode;
    render: (item: T) => ReactNode;
    headerClassName?: string;
    cellClassName?: string;
}

interface ResourceIndexTableProps<T extends { id: string | number }> {
    resourcePath: string;
    searchPlaceholder: string;
    pagination: PaginatedData<T>;
    filters: Record<string, FilterValue>;
    columns: ResourceIndexColumn<T>[];
    emptyState: ResourceIndexEmptyState;
    sort?: ResourceIndexSortConfig;
    selection?: ResourceIndexSelection<T>;
    searchQuery?: Record<string, FilterValue>;
    tableClassName?: string;
    toolbarStart?: ReactNode;
    toolbarEnd?: ReactNode;
    showSearch?: boolean;
    rowActions?: ResourceIndexRowActions<T>;
    onRowClick?: (item: T) => void;
}

export function ResourceIndexTable<T extends { id: string | number }>({
    resourcePath,
    searchPlaceholder,
    pagination,
    filters,
    columns,
    emptyState,
    sort,
    selection,
    searchQuery,
    tableClassName,
    toolbarStart,
    toolbarEnd,
    showSearch = true,
    rowActions,
    onRowClick,
}: ResourceIndexTableProps<T>) {
    const items = pagination?.data || [];
    const hasItems = items.length > 0;
    const allSelected = selection ? items.length > 0 && selection.selectedIds.length === items.length : false;
    const someSelected = selection ? selection.selectedIds.length > 0 && selection.selectedIds.length < items.length : false;

    const handlePerPageChange = (value: string) => {
        router.get(resourcePath, {
            ...filters,
            per_page: value,
            page: 1,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSortChange = (value: string) => {
        const [sortBy, order] = value.split(':');

        router.get(resourcePath, {
            ...filters,
            sort: sortBy,
            order,
            page: 1,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resolvedSearchQuery = searchQuery ?? {
        ...filters,
        page: undefined,
    };

    const isInteractiveTarget = (target: EventTarget | null) => {
        if (!(target instanceof Element)) {
            return false;
        }

        return Boolean(target.closest('a, button, input, [role="checkbox"], [data-row-click-ignore="true"]'));
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
            {(showSearch || toolbarStart || toolbarEnd || sort) ? (
                <div className="mx-4 mt-4 flex min-h-12 shrink-0 flex-col items-start justify-between gap-3 rounded border bg-background p-2 shadow-sm md:flex-row md:items-center">
                    <div className="flex w-full flex-1 flex-row flex-wrap items-center gap-2 md:w-auto md:flex-nowrap">
                        {sort ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-9 shrink-0 gap-2 font-normal text-muted-foreground shadow-none">
                                        <ArrowUpDown size={16} /> Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={sort.value} onValueChange={handleSortChange}>
                                        {sort.options.map((option) => (
                                            <DropdownMenuRadioItem key={option.value} value={option.value}>
                                                {option.label}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}

                        {toolbarStart}

                        {showSearch ? (
                            <div className="flex flex-1">
                                <SearchInput
                                    url={resourcePath}
                                    placeholder={searchPlaceholder}
                                    initialValue={typeof filters.search === 'string' ? filters.search : ''}
                                    query={resolvedSearchQuery}
                                />
                            </div>
                        ) : null}
                    </div>

                    {toolbarEnd ? (
                        <div className="flex w-full flex-wrap items-center justify-end gap-2 border-t pt-2 md:w-auto md:border-t-0 md:pt-0">
                            {toolbarEnd}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {hasItems ? (
                <div className="mx-4 mt-4 mb-4 flex flex-1 min-h-0 flex-col overflow-hidden rounded border bg-background shadow-sm">
                    <div className="flex-1 overflow-auto overscroll-x-contain [&_[data-slot=table-container]]:overflow-visible">
                        <Table className={tableClassName}>
                            <TableHeader>
                                <TableRow className="sticky top-0 z-10 bg-background hover:bg-background">
                                    {selection ? (
                                        <TableHead className="w-11 px-3">
                                            <div className="flex items-center justify-center">
                                                <Checkbox
                                                    aria-label="Select all"
                                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                                    onCheckedChange={(value) => selection.onToggleAll(!!value)}
                                                />
                                            </div>
                                        </TableHead>
                                    ) : null}

                                    {columns.map((column, index) => (
                                        <TableHead key={column.key} className={cn(index === 0 && 'pl-0', column.headerClassName)}>
                                            {column.header}
                                        </TableHead>
                                    ))}

                                    {rowActions ? (
                                        <TableHead className={cn('w-1 whitespace-nowrap text-right', rowActions.headerClassName)}>
                                            {rowActions.header ?? 'Actions'}
                                        </TableHead>
                                    ) : null}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className={onRowClick ? 'cursor-pointer' : undefined}
                                        onClick={(event) => {
                                            if (!onRowClick || isInteractiveTarget(event.target)) {
                                                return;
                                            }

                                            onRowClick(item);
                                        }}
                                    >
                                        {selection ? (
                                            <TableCell className="w-11 px-3">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        aria-label={selection.getLabel(item)}
                                                        checked={selection.selectedIds.includes(item.id)}
                                                        onCheckedChange={(value) => selection.onToggleOne(item, !!value)}
                                                        onClick={(event) => event.stopPropagation()}
                                                    />
                                                </div>
                                            </TableCell>
                                        ) : null}

                                        {columns.map((column, index) => {
                                            const cellClassName = typeof column.cellClassName === 'function'
                                                ? column.cellClassName(item)
                                                : column.cellClassName;

                                            return (
                                                <TableCell key={column.key} className={cn(index === 0 && 'pl-0', cellClassName)}>
                                                    {column.render(item)}
                                                </TableCell>
                                            );
                                        })}

                                        {rowActions ? (
                                            <TableCell className={cn('text-right', rowActions.cellClassName)}>
                                                {rowActions.render(item)}
                                            </TableCell>
                                        ) : null}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {hasItems ? <DataTablePagination pagination={pagination} onPerPageChange={handlePerPageChange} /> : null}
                </div>
            ) : (
                <div className="mx-4 mb-4 mt-4 flex flex-1 items-center justify-center rounded border border-dashed bg-background p-6 text-center shadow-sm">
                    <div className="mx-auto max-w-lg space-y-1">
                        <h3 className="text-2xl font-bold tracking-tight">{emptyState.title}</h3>
                        {emptyState.description ? (
                            <p className="text-sm text-muted-foreground">{emptyState.description}</p>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
