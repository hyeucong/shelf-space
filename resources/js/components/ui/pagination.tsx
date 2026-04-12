import * as React from "react"
import { Link } from "@inertiajs/react"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn("flex items-center gap-4", className)}
            {...props}
        />
    )
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn("flex items-center rounded-md border -space-x-px bg-background", className)}
            {...props}
        />
    )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
    return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
    isActive?: boolean;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & Omit<React.ComponentProps<typeof Link>, "size">;

function PaginationLink({
    className,
    isActive,
    size = "icon",
    ...props
}: PaginationLinkProps) {
    return (
        <Link
            aria-current={isActive ? "page" : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            className={cn(
                buttonVariants({
                    variant: "ghost",
                    size,
                }),
                "rounded-none border-l first:border-l-0 first:rounded-l-md last:rounded-r-md h-9 text-muted-foreground hover:text-foreground",
                className
            )}
            preserveScroll
            {...props}
        />
    )
}

function PaginationFirst({
    className,
    ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "size">) {
    return (
        <PaginationLink
            aria-label="Go to first page"
            size="icon"
            className={cn("", className)}
            {...props}
        >
            <ChevronsLeft className="size-4" />
        </PaginationLink>
    )
}

function PaginationLast({
    className,
    ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "size">) {
    return (
        <PaginationLink
            aria-label="Go to last page"
            size="icon"
            className={cn("", className)}
            {...props}
        >
            <ChevronsRight className="size-4" />
        </PaginationLink>
    )
}

function PaginationPrevious({
    className,
    ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "size">) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="icon"
            className={cn("", className)}
            {...props}
        >
            <ChevronLeftIcon className="size-4" />
        </PaginationLink>
    )
}

function PaginationNext({
    className,
    ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "size">) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="icon"
            className={cn("", className)}
            {...props}
        >
            <ChevronRightIcon className="size-4" />
        </PaginationLink>
    )
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn("flex size-9 items-center justify-center border-l text-muted-foreground", className)}
            {...props}
        >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">More pages</span>
        </span>
    )
}

function PaginationPageIndicator({
    currentPage,
    lastPage,
    className
}: {
    currentPage: number;
    lastPage: number;
    className?: string;
}) {
    return (
        <div className={cn("px-4 py-2 text-sm font-medium border-l text-muted-foreground whitespace-nowrap", className)}>
            Page <span className="text-foreground">{currentPage}</span> of <span className="text-foreground">{lastPage}</span>
        </div>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationFirst,
    PaginationLast,
    PaginationNext,
    PaginationEllipsis,
    PaginationPageIndicator,
}
