import { Head, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AssetSelectionActions } from '@/components/asset-selection-actions';
import { ResourceDeleteDialog, ResourceHeaderAction, ResourceSelectDeleteDialog } from '@/components/resource-form-dialog';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { ResourceIndexColumn, ResourceIndexSortOption } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { TAG_CREATE_EVENT, TagFormDialog, dispatchTagCreateEvent } from '@/pages/tags/create';
import type { PaginatedData } from '@/types/pagination';

interface Tag {
    id: number;
    name: string;
    description: string | null;
    hex_color?: string | null;
    assets_count: number;
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
    const [isSelectingDelete, setIsSelectingDelete] = useState(false);
    const [showSelectDelete, setShowSelectDelete] = useState(false);
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
    const selectedTags = useMemo(
        () => localTags.filter((tag) => activeSelectedIds.includes(tag.id)),
        [activeSelectedIds, localTags],
    );
    const primarySelectedTag = activeSelectedIds.length === 1
        ? selectedTags[0] ?? null
        : null;

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

    const handleSelectDelete = () => {
        if (activeSelectedIds.length === 0 || isSelectingDelete) {
            return;
        }

        router.delete('/tags/select-delete', {
            data: { ids: activeSelectedIds },
            preserveScroll: true,
            onBefore: () => setIsSelectingDelete(true),
            onSuccess: () => {
                setSelectedIds([]);
                setShowSelectDelete(false);
            },
            onFinish: () => setIsSelectingDelete(false),
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
            key: 'description',
            header: 'Description',
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden max-w-120 whitespace-normal text-muted-foreground lg:table-cell',
            render: (tag) => tag.description || 'No description yet.',
        },
        {
            key: 'assets',
            header: 'Assets',
            headerClassName: 'hidden sm:table-cell',
            cellClassName: 'hidden whitespace-nowrap font-medium text-muted-foreground sm:table-cell',
            render: (tag) => `${tag.assets_count} asset${tag.assets_count === 1 ? '' : 's'}`,
        },
        {
            key: 'color',
            header: 'Color',
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden md:table-cell',
            render: (tag) => (
                <div className="flex items-center gap-2">
                    <span
                        className="h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: tag.hex_color || '#d1d5db' }}
                    />
                    <span className="text-sm text-muted-foreground">
                        {tag.hex_color || '-'}
                    </span>
                </div>
            ),
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
                toolbarEnd={(
                    <AssetSelectionActions
                        actions={[
                            {
                                key: 'edit',
                                label: 'Edit',
                                icon: <Pencil className="h-4 w-4" />,
                                onClick: () => {
                                    if (!primarySelectedTag) {
                                        return;
                                    }

                                    handleEditClick(primarySelectedTag);
                                },
                                disabled: !primarySelectedTag,
                            },
                            {
                                key: 'delete',
                                label: 'Delete',
                                icon: <Trash2 className="h-4 w-4" />,
                                onClick: () => setShowSelectDelete(true),
                                disabled: activeSelectedIds.length === 0,
                                destructive: true,
                            },
                        ]}
                    />
                )}
            />

            <TagFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                mode={dialogMode}
                tagId={activeTag?.id ?? null}
                initialValues={activeTag ? {
                    name: activeTag.name,
                    description: activeTag.description ?? '',
                    hex_color: activeTag.hex_color ?? '#ab339f',
                } : undefined}
                onSuccess={closeFormDialog}
            />

            <ResourceDeleteDialog
                open={!!tagToDelete}
                onOpenChange={(open) => !open && closeDeleteDialog()}
                title="Delete Tag"
                itemName={tagToDelete?.name}
                processing={isDeleting}
                onConfirm={handleDelete}
                confirmLabel="Delete tag"
            />

            <ResourceSelectDeleteDialog
                open={showSelectDelete}
                onOpenChange={setShowSelectDelete}
                title="Delete Tags"
                resourceName="Tag"
                count={activeSelectedIds.length}
                processing={isSelectingDelete}
                onConfirm={handleSelectDelete}
                confirmLabel="Delete selected"
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
