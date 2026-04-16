import { Head, router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { ResourceDeleteDialog, ResourceHeaderAction } from '@/components/resource-form-dialog';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ResourceIndexTable, type ResourceIndexColumn } from '@/components/resource-index-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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

    // Local optimistic state and delete modal
    const [localCategories, setLocalCategories] = useState<Category[]>(categories?.data || []);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        const handleOpen = () => {
            setDialogMode('create');
            setActiveCategory(null);
            setIsDialogOpen(true);
        };

        window.addEventListener(CATEGORY_CREATE_EVENT, handleOpen);

        return () => window.removeEventListener(CATEGORY_CREATE_EVENT, handleOpen);
    }, []);

    // Keep local list in sync with server props
    useEffect(() => {
        setLocalCategories(categories?.data || []);
    }, [categories]);

    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => localCategories.some((category) => category.id === id)));
    }, [localCategories]);

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
        if (!categoryToDelete || isDeleting) return;

        const id = categoryToDelete.id;

        router.delete(`/categories/${id}`, {
            preserveScroll: true,
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setLocalCategories((prev) => prev.filter((c) => c.id !== id));
                setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
                setCategoryToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const columns: ResourceIndexColumn<Category>[] = [
        {
            key: 'name',
            header: 'Name',
            cellClassName: 'font-medium text-foreground',
            render: (category) => category.name,
        },
        {
            key: 'description',
            header: 'Description',
            cellClassName: 'max-w-120 whitespace-normal text-muted-foreground',
            render: (category) => category.description || 'No description yet.',
        },
        {
            key: 'assets',
            header: 'Assets',
            cellClassName: 'font-medium text-muted-foreground',
            render: (category) => `${category.assets_count} asset${category.assets_count === 1 ? '' : 's'}`,
        },
        {
            key: 'color',
            header: 'Color',
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
            render: (category) => (
                <div className="flex gap-2">
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
                    selectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (category, checked) => toggleOne(category.id, checked),
                    getLabel: (category) => `Select ${category.name}`,
                }}
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
                warning="Delete this category only if you are sure it should no longer exist and won't break any asset associations."
                processing={isDeleting}
                onConfirm={handleDelete}
                confirmLabel="Delete category"
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
