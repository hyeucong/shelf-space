import { Head, router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { ResourceDeleteDialog, ResourceHeaderAction } from '@/components/resource-form-dialog';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ResourceIndexTable, type ResourceIndexColumn, type ResourceIndexSortOption } from '@/components/resource-index-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TAG_CREATE_EVENT, TagFormDialog, dispatchTagCreateEvent } from '@/pages/tags/create';
import type { PaginatedData } from '@/types/pagination';

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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [activeTag, setActiveTag] = useState<Tag | null>(null);
    const [localTags, setLocalTags] = useState<Tag[]>(tags?.data || []);
    const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const handleOpen = () => {
            setDialogMode('create');
            setActiveTag(null);
            setIsDialogOpen(true);
        };

        window.addEventListener(TAG_CREATE_EVENT, handleOpen);

        return () => window.removeEventListener(TAG_CREATE_EVENT, handleOpen);
    }, []);

    useEffect(() => {
        setLocalTags(tags?.data || []);
    }, [tags]);

    const closeFormDialog = () => {
        setIsDialogOpen(false);
        setActiveTag(null);
    };

    const handleEditClick = (tag: Tag) => {
        setDialogMode('edit');
        setActiveTag(tag);
        setIsDialogOpen(true);
    };

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
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(tag)} disabled={isDeleting}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setTagToDelete(tag)}
                        disabled={isDeleting}
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
                emptyState={{
                    title: 'No tags yet',
                    description: 'Tags let you label assets with flexible keywords. Create tags to add custom metadata to your inventory.',
                }}
                sort={{
                    value: `${filters?.sort || 'created_at'}:${filters?.order || 'desc'}`,
                    options: sortOptions,
                }}
            />

            <TagFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                mode={dialogMode}
                tagId={activeTag?.id ?? null}
                initialValues={activeTag ? { name: activeTag.name } : undefined}
                onSuccess={closeFormDialog}
            />

            <ResourceDeleteDialog
                open={!!tagToDelete}
                onOpenChange={(open) => !open && closeDeleteDialog()}
                title="Delete Tag"
                itemName={tagToDelete?.name}
                warning="Delete this tag only if you are sure it should no longer exist and won't break any asset associations."
                processing={isDeleting}
                onConfirm={handleDelete}
                confirmLabel="Delete tag"
            />
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
            <ResourceHeaderAction label="New tag" onClick={dispatchTagCreateEvent} />
        }
    />
);
