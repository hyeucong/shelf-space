import { Head, Link, router } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import { SearchInput } from '@/components/search-input';
import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    PaginationFirst,
    PaginationLast,
    PaginationPageIndicator,
} from '@/components/ui/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Tag {
    id: number;
    name: string;
}

interface PaginationLinkType {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLinkType[];
    current_page: number;
    last_page: number;
    per_page: number;
    first_page_url: string;
    last_page_url: string;
    from: number;
    to: number;
    total: number;
}

interface PageProps {
    tags: PaginatedData<Tag>;
    filters: {
        search?: string;
        per_page?: string | number;
        sort?: string;
        order?: 'asc' | 'desc';
    };
}

export default function Tags({ tags, filters }: PageProps) {
    const [localTags, setLocalTags] = useState<Tag[]>(tags?.data || []);
    const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setLocalTags(tags?.data || []);
    }, [tags]);

    const closeDeleteDialog = () => setTagToDelete(null);

    const handleDelete = () => {
        if (!tagToDelete || isDeleting) return;

        const id = tagToDelete.id;

        router.delete(`/tags/${id}`, {
            preserveScroll: true,
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setLocalTags((prev) => prev.filter((t) => t.id !== id));
                setTagToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleSortChange = (value: string) => {
        const [sort, order] = value.split(':');
        router.get('/tags', {
            ...filters,
            sort,
            order,
            page: 1
        }, {
            preserveState: true,
            replace: true
        });
    };

    return (
        <>
            <Head title="Tags" />

            <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Toolbar */}
                    <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded border bg-background p-2 shadow-sm min-h-12">
                        <div className="flex flex-1 flex-row flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0">
                                        <ArrowUpDown size={16} /> Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup
                                        value={`${filters?.sort || 'created_at'}:${filters?.order || 'desc'}`}
                                        onValueChange={handleSortChange}
                                    >
                                        <DropdownMenuRadioItem value="created_at:desc">Newest</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="created_at:asc">Oldest</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="name:asc">Name (A-Z)</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="name:desc">Name (Z-A)</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex">
                                <SearchInput
                                    url="/tags"
                                    placeholder="Search tags..."
                                    initialValue={filters?.search}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    {localTags.length > 0 ? (
                        <div className="rounded border bg-background shadow-sm">
                            <div className="p-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="w-31.25">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {localTags.map((tag) => (
                                            <TableRow key={tag.id}>
                                                <TableCell>{tag.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 justify-end">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/tags/${tag.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 border" onClick={() => setTagToDelete(tag)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {tags.links && tags.links.length > 0 && (
                                <div className="shrink-0 border-t bg-background/95 p-4">
                                    <Pagination className="justify-start">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationFirst
                                                    href={tags.first_page_url}
                                                    className={tags.current_page === 1 ? "opacity-30 pointer-events-none" : ""}
                                                />
                                            </PaginationItem>

                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={tags.links[0].url || "#"}
                                                    className={!tags.links[0].url ? "opacity-30 pointer-events-none" : ""}
                                                />
                                            </PaginationItem>

                                            <PaginationItem>
                                                <PaginationPageIndicator
                                                    currentPage={tags.current_page}
                                                    lastPage={tags.last_page}
                                                />
                                            </PaginationItem>

                                            <PaginationItem>
                                                <PaginationNext
                                                    href={tags.links[tags.links.length - 1].url || "#"}
                                                    className={!tags.links[tags.links.length - 1].url ? "opacity-30 pointer-events-none" : ""}
                                                />
                                            </PaginationItem>

                                            <PaginationItem>
                                                <PaginationLast
                                                    href={tags.last_page_url}
                                                    className={tags.current_page === tags.last_page ? "opacity-30 pointer-events-none" : ""}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center rounded border border-dashed bg-background h-75">
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-2xl font-bold tracking-tight">No tags yet</h3>
                                <p className="text-sm text-muted-foreground">Tags allow you to add flexible labels to your assets.</p>
                                <Button className="mt-4 rounded" asChild>
                                    <Link href="/tags/create">New tag</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Delete Confirmation Dialog */}
            <Dialog open={!!tagToDelete} onOpenChange={(open) => !open && closeDeleteDialog()}>
                <DialogContent className="sm:max-w-106.25 rounded-lg" onPointerDownOutside={closeDeleteDialog}>
                    <DialogHeader>
                        <DialogTitle>Delete Tag</DialogTitle>
                        <DialogDescription>
                            This will permanently remove <span className="font-semibold text-foreground">{tagToDelete?.name}</span>. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-muted-foreground">
                        Delete this tag only if you are sure it should no longer exist and won't break any asset associations.
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={closeDeleteDialog} className="rounded">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded" disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete tag'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Tags.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Tags', href: '/tags' }
        ]}
        headerAction={
            <Button className="rounded border-none" asChild>
                <Link href="/tags/create">
                    New tag
                </Link>
            </Button>
        }
    />
);
