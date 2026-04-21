import { Head, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ResourceDeleteDialog, ResourceHeaderAction } from '@/components/resource-form-dialog';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { ResourceIndexColumn, ResourceIndexSortOption } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
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
    const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deletedTagIds, setDeletedTagIds] = useState<number[]>([]);

    const localTags = useMemo(
        () => (tags?.data || []).filter((tag) => !deletedTagIds.includes(tag.id)),
        [deletedTagIds, tags],
    );
    const activeSelectedIds = useMemo(
        () => selectedIds.filter((id) => localTags.some((tag) => tag.id === id)),
        [localTags, selectedIds],
    );

    useEffect(() => {
        const handleOpen = () => {
            setDialogMode('create');
            setActiveTag(null);
            setIsDialogOpen(true);
        };

        window.addEventListener(TAG_CREATE_EVENT, handleOpen);

        return () => window.removeEventListener(TAG_CREATE_EVENT, handleOpen);
    }, []);

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
        if (!tagToDelete || isDeleting) {
            return;
        }

        const id = tagToDelete.id;

        router.delete(`/tags/${id}`, {
            preserveScroll: true,
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setDeletedTagIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
                setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
                setTagToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const toggleOne = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) {
                return Array.from(new Set([...prev, id]));
            }

            return prev.filter((currentId) => currentId !== id);
        });
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(localTags.map((tag) => tag.id));

            return;
        }

        setSelectedIds([]);
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
            headerClassName: 'min-w-56',
            cellClassName: 'min-w-56 font-medium text-foreground',
            render: (tag) => tag.name,
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'w-24 text-right',
            cellClassName: 'w-24 text-right',
            render: (tag) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 border" onClick={() => handleEditClick(tag)} disabled={isDeleting}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                selection={{
                    selectedIds: activeSelectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (tag, checked) => toggleOne(tag.id, checked),
                    getLabel: (tag) => `Select ${tag.name}`,
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
