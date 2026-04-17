import {
    Pagination,
    PaginationContent,
    PaginationFirst,
    PaginationItem,
    PaginationLast,
    PaginationNext,
    PaginationPageIndicator,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PaginatedData } from '@/types/pagination';

interface DataTablePaginationProps {
    pagination: Pick<PaginatedData<unknown>, 'links' | 'current_page' | 'last_page' | 'per_page' | 'first_page_url' | 'last_page_url' | 'from' | 'to' | 'total'>;
    onPerPageChange: (value: string) => void;
    perPageOptions?: string[];
}

export function DataTablePagination({
    pagination,
    onPerPageChange,
    perPageOptions = ['20', '50', '100'],
}: DataTablePaginationProps) {
    if (!pagination.links || pagination.links.length === 0) {
        return null;
    }

    return (
        <div className="shrink-0 border-t bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60">
            <Pagination className="flex w-full flex-col gap-2 sm:flex-row sm:items-center ">
                <PaginationContent>
                    <PaginationItem className="border-r">
                        <PaginationFirst
                            href={pagination.first_page_url}
                            className={pagination.current_page === 1 ? 'opacity-30 pointer-events-none' : ''}
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationPrevious
                            href={pagination.links[0].url || '#'}
                            className={!pagination.links[0].url ? 'opacity-30 pointer-events-none' : ''}
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationPageIndicator
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            href={pagination.links[pagination.links.length - 1].url || '#'}
                            className={!pagination.links[pagination.links.length - 1].url ? 'opacity-30 pointer-events-none' : ''}
                        />
                    </PaginationItem>

                    <PaginationItem className="border-l">
                        <PaginationLast
                            href={pagination.last_page_url}
                            className={pagination.current_page === pagination.last_page ? 'opacity-30 pointer-events-none' : ''}
                        />
                    </PaginationItem>
                </PaginationContent>

                <div className="flex items-center gap-2">
                    <Select
                        value={String(pagination.per_page)}
                        onValueChange={onPerPageChange}
                    >
                        <SelectTrigger className="h-9 w-17.5 rounded shadow-none cursor-pointer">
                            <SelectValue placeholder={pagination.per_page} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {perPageOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Showing {pagination.from ?? 0}-{pagination.to ?? 0} of {pagination.total} items
                    </span>
                </div>
            </Pagination>
        </div>
    );
}
