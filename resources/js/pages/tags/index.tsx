import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ResourceIndexTable, type ResourceIndexColumn, type ResourceIndexSortOption } from '@/components/resource-index-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { PaginatedData } from '@/types/pagination';
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

    const sortOptions: ResourceIndexSortOption[] = [
        { value: 'created_at:desc', label: 'Newest' },
        { value: 'created_at:asc', label: 'Oldest' },
        { value: 'name:asc', label: 'Name (A-Z)' },
        { value: 'name:desc', label: 'Name (Z-A)' },
    ];

    const columns: ResourceIndexColumn<Tag>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (tag) => tag.name,
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'w-31.25',
            render: (tag) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/tags/${tag.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setTagToDelete(tag)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Tags" />

            <ResourceIndexTable
                resourcePath="/tags"
                searchPlaceholder="Search tags..."
                pagination={{ ...tags, data: localTags }}
                filters={filters}
                columns={columns}
                emptyMessage="No tags found."
                sort={{
                    value: `${filters?.sort || 'created_at'}:${filters?.order || 'desc'}`,
                    options: sortOptions,
                }}
            />
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
