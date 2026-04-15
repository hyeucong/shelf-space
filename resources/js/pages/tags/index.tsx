import { Head, router, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { ResourceDeleteDialog, ResourceFormDialog, ResourceHeaderAction } from '@/components/resource-form-dialog';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ResourceIndexTable, type ResourceIndexColumn, type ResourceIndexSortOption } from '@/components/resource-index-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PaginatedData } from '@/types/pagination';

const TAG_CREATE_EVENT = 'tags:create:open';

function dispatchTagCreateEvent() {
    window.dispatchEvent(new CustomEvent(TAG_CREATE_EVENT));
}

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
    const [activeTagId, setActiveTagId] = useState<number | null>(null);
    const [localTags, setLocalTags] = useState<Tag[]>(tags?.data || []);
    const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
    });

    useEffect(() => {
        const handleOpen = () => {
            reset();
            clearErrors();
            setDialogMode('create');
            setActiveTagId(null);
            setIsDialogOpen(true);
        };

        window.addEventListener(TAG_CREATE_EVENT, handleOpen);

        return () => window.removeEventListener(TAG_CREATE_EVENT, handleOpen);
    }, [clearErrors, reset]);

    useEffect(() => {
        setLocalTags(tags?.data || []);
    }, [tags]);

    const closeFormDialog = () => {
        setIsDialogOpen(false);
    };

    const handleEditClick = (tag: Tag) => {
        clearErrors();
        setDialogMode('edit');
        setActiveTagId(tag.id);
        setData({
            name: tag.name,
        });
        setIsDialogOpen(true);
    };

    const submitDialog = (event: React.FormEvent) => {
        event.preventDefault();

        const onSuccess = () => {
            closeFormDialog();
        };

        if (dialogMode === 'edit' && activeTagId !== null) {
            put(`/tags/${activeTagId}`, {
                preserveScroll: true,
                onSuccess,
            });

            return;
        }

        post('/tags', {
            preserveScroll: true,
            onSuccess,
        });
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
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(tag)} disabled={processing}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setTagToDelete(tag)}
                        disabled={processing}
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

            <ResourceFormDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeFormDialog();
                    }
                }}
                onSubmit={submitDialog}
                title={dialogMode === 'edit' ? (data.name || 'Edit tag') : (data.name || 'New tag')}
                description={dialogMode === 'edit' ? 'Update the selected tag.' : 'Basic information about your tag.'}
                processing={processing}
                submitLabel={dialogMode === 'edit' ? 'Update' : 'Save'}
                submitPendingLabel={dialogMode === 'edit' ? 'Updating...' : 'Saving...'}
                contentClassName="sm:max-w-xl rounded-lg"
            >
                <div className="grid gap-2">
                    <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        className="rounded"
                        placeholder="e.g. Critical"
                    />
                    {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                </div>
            </ResourceFormDialog>

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
