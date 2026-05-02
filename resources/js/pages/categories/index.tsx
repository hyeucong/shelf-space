import { Head, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AssetSelectionActions } from '@/components/asset-selection-actions';
import { ResourceDeleteDialog, ResourceHeaderAction, ResourceSelectDeleteDialog } from '@/components/resource-form-dialog';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { ResourceIndexColumn } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { CATEGORY_CREATE_EVENT, CategoryFormDialog, dispatchCategoryCreateEvent } from '@/pages/categories/create';
import type { PaginatedData } from '@/types/pagination';

interface Category {
    id: number;
    name: string;
    description: string | null;
    hex_color?: string | null;
    assets_count: number;
}

interface PageProps {
    categories: PaginatedData<Category>;
    filters: {
        search?: string;
        per_page?: string | number;
    };
}

export default function Categories({ categories, filters }: PageProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);

    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSelectingDelete, setIsSelectingDelete] = useState(false);
    const [showSelectDelete, setShowSelectDelete] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deletedCategoryIds, setDeletedCategoryIds] = useState<number[]>([]);

    const localCategories = useMemo(
        () => (categories?.data || []).filter((category) => !deletedCategoryIds.includes(category.id)),
        [categories, deletedCategoryIds],
    );
    const activeSelectedIds = useMemo(
        () => selectedIds.filter((id) => localCategories.some((category) => category.id === id)),
        [localCategories, selectedIds],
    );
    const selectedCategories = useMemo(
        () => localCategories.filter((category) => activeSelectedIds.includes(category.id)),
        [activeSelectedIds, localCategories],
    );
    const primarySelectedCategory = activeSelectedIds.length === 1
        ? selectedCategories[0] ?? null
        : null;

    useEffect(() => {
        const handleOpen = () => {
            setDialogMode('create');
            setActiveCategory(null);
            setIsDialogOpen(true);
        };

        window.addEventListener(CATEGORY_CREATE_EVENT, handleOpen);

        return () => window.removeEventListener(CATEGORY_CREATE_EVENT, handleOpen);
    }, []);

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
            setSelectedIds(localCategories.map((category) => category.id));

            return;
        }

        setSelectedIds([]);
    };

    const closeFormDialog = () => {
        setIsDialogOpen(false);
        setActiveCategory(null);
    };

    const handleEditClick = (category: Category) => {
        setDialogMode('edit');
        setActiveCategory(category);
        setIsDialogOpen(true);
    };

    const closeDeleteDialog = () => setCategoryToDelete(null);

    const handleDelete = () => {
        if (!categoryToDelete || isDeleting) {
            return;
        }

        const id = categoryToDelete.id;

        router.delete(`/categories/${id}`, {
            preserveScroll: true,
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setDeletedCategoryIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
                setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
                setCategoryToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleSelectDelete = () => {
        if (activeSelectedIds.length === 0 || isSelectingDelete) {
            return;
        }

        router.delete('/categories/select-delete', {
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

    const columns: ResourceIndexColumn<Category>[] = [
        {
            key: 'name',
            header: 'Name',
            headerClassName: 'min-w-56',
            cellClassName: 'min-w-56 font-medium text-foreground',
            render: (category) => category.name,
        },
        {
            key: 'description',
            header: 'Description',
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden text-muted-foreground lg:table-cell',
            render: (category) => category.description || 'No description yet.',
        },
        {
            key: 'assets',
            header: 'Assets',
            headerClassName: 'hidden sm:table-cell',
            cellClassName: 'hidden font-medium text-muted-foreground sm:table-cell',
            render: (category) => `${category.assets_count} asset${category.assets_count === 1 ? '' : 's'}`,
        },
        {
            key: 'color',
            header: 'Color',
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden md:table-cell',
            render: (category) => (
                <div className="flex items-center gap-2">
                    <span
                        className="h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: category.hex_color || '#d1d5db' }}
                    />
                    <span className="text-sm text-muted-foreground">
                        {category.hex_color || '-'}
                    </span>
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'w-24 text-right',
            cellClassName: 'w-24 text-right',
            render: (category) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border"
                        onClick={() => handleEditClick(category)}
                    >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setCategoryToDelete(category)}
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
            <Head title="Categories" />

            <ResourceIndexTable
                resourcePath="/categories"
                searchPlaceholder="Search categories..."
                pagination={{ ...categories, data: localCategories }}
                filters={filters}
                columns={columns}
                emptyState={{
                    title: 'No categories yet',
                    description: 'Categories help organize assets into clear groups so your inventory stays easier to manage.',
                }}
                selection={{
                    selectedIds: activeSelectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (category, checked) => toggleOne(category.id, checked),
                    getLabel: (category) => `Select ${category.name}`,
                }}
                toolbarEnd={(
                    <AssetSelectionActions
                        actions={[
                            {
                                key: 'edit',
                                label: 'Edit',
                                icon: <Pencil className="h-4 w-4" />,
                                onClick: () => {
                                    if (!primarySelectedCategory) {
                                        return;
                                    }

                                    handleEditClick(primarySelectedCategory);
                                },
                                disabled: !primarySelectedCategory,
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

            <CategoryFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                mode={dialogMode}
                categoryId={activeCategory?.id ?? null}
                initialValues={activeCategory ? {
                    name: activeCategory.name,
                    description: activeCategory.description ?? '',
                    hex_color: activeCategory.hex_color ?? '#ab339f',
                } : undefined}
                onSuccess={closeFormDialog}
            />

            <ResourceDeleteDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && closeDeleteDialog()}
                title="Delete Category"
                itemName={categoryToDelete?.name}
                processing={isDeleting}
                onConfirm={handleDelete}
                confirmLabel="Delete category"
            />

            <ResourceSelectDeleteDialog
                open={showSelectDelete}
                onOpenChange={setShowSelectDelete}
                title="Delete Categories"
                resourceName="Category"
                count={activeSelectedIds.length}
                processing={isSelectingDelete}
                onConfirm={handleSelectDelete}
                confirmLabel="Delete selected"
            />
        </>
    );
}

Categories.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Categories', href: '/categories' }
        ]}
        headerAction={
            <ResourceHeaderAction label="New category" onClick={dispatchCategoryCreateEvent} />
        }
    />
);
