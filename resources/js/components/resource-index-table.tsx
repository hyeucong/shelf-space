import { router } from '@inertiajs/react';
import { SearchInput } from '@/components/search-input';
import { DataTablePagination } from '@/components/data-table-pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
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
import type { PaginatedData } from '@/types/pagination';
import { ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

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

interface ResourceIndexSelection<T extends { id: number }> {
    selectedIds: number[];
    onToggleAll: (checked: boolean) => void;
    onToggleOne: (item: T, checked: boolean) => void;
    getLabel: (item: T) => string;
}

interface ResourceIndexSortConfig {
    value: string;
    options: ResourceIndexSortOption[];
}

interface ResourceIndexTableProps<T extends { id: number }> {
    resourcePath: string;
    searchPlaceholder: string;
    pagination: PaginatedData<T>;
    filters: Record<string, FilterValue>;
    columns: ResourceIndexColumn<T>[];
    emptyMessage: string;
    sort?: ResourceIndexSortConfig;
    selection?: ResourceIndexSelection<T>;
    tableClassName?: string;
}

export function ResourceIndexTable<T extends { id: number }>({
    resourcePath,
    searchPlaceholder,
    pagination,
    filters,
    columns,
    emptyMessage,
    sort,
    selection,
    tableClassName,
}: ResourceIndexTableProps<T>) {
    const items = pagination?.data || [];
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

    const searchQuery = {
        ...filters,
        page: undefined,
    };

    const emptyColSpan = columns.length + (selection ? 1 : 0);

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
            <div className="shrink-0 mb-4 mx-4 mt-4 flex min-h-12 flex-col items-start justify-between gap-3 rounded border bg-background p-2 shadow-sm md:flex-row md:items-center">
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

                    <SearchInput
                        url={resourcePath}
                        placeholder={searchPlaceholder}
                        initialValue={typeof filters.search === 'string' ? filters.search : ''}
                        query={searchQuery}
                    />
                </div>
            </div>

            <div className="mx-4 mb-4 flex flex-1 flex-col overflow-y-auto rounded border bg-background shadow-sm">
                <Table className={tableClassName}>
                    <TableHeader className="bg-background">
                        <TableRow className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--color-border)] hover:bg-background">
                            {selection ? (
                                <TableHead className="w-12.5">
                                    <Checkbox
                                        aria-label="Select all"
                                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                        onCheckedChange={(value) => selection.onToggleAll(!!value)}
                                    />
                                </TableHead>
                            ) : null}

                            {columns.map((column) => (
                                <TableHead key={column.key} className={column.headerClassName}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length > 0 ? (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    {selection ? (
                                        <TableCell>
                                            <Checkbox
                                                aria-label={selection.getLabel(item)}
                                                checked={selection.selectedIds.includes(item.id)}
                                                onCheckedChange={(value) => selection.onToggleOne(item, !!value)}
                                            />
                                        </TableCell>
                                    ) : null}

                                    {columns.map((column) => {
                                        const cellClassName = typeof column.cellClassName === 'function'
                                            ? column.cellClassName(item)
                                            : column.cellClassName;

                                        return (
                                            <TableCell key={column.key} className={cellClassName}>
                                                {column.render(item)}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={emptyColSpan} className="h-24 text-center text-muted-foreground">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination pagination={pagination} onPerPageChange={handlePerPageChange} />
        </div>
    );
}
