import { Head, router, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ResourceIndexTable, type ResourceIndexColumn } from '@/components/resource-index-table';
import { Pipette, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PaginatedData } from '@/types/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const CATEGORY_CREATE_EVENT = 'categories:create:open';

function dispatchCategoryCreateEvent() {
    window.dispatchEvent(new CustomEvent(CATEGORY_CREATE_EVENT));
}

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
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

    // Local optimistic state and delete modal
    const [localCategories, setLocalCategories] = useState<Category[]>(categories?.data || []);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        hex_color: '#ab339f',
    });

    useEffect(() => {
        const handleOpen = () => {
            reset();
            clearErrors();
            setDialogMode('create');
            setActiveCategoryId(null);
            setIsDialogOpen(true);
        };

        window.addEventListener(CATEGORY_CREATE_EVENT, handleOpen);

        return () => window.removeEventListener(CATEGORY_CREATE_EVENT, handleOpen);
    }, [clearErrors, reset]);

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

    const allSelected = localCategories.length > 0 && selectedIds.length === localCategories.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < localCategories.length;

    const closeCreateDialog = () => {
        setIsDialogOpen(false);
    };

    const handleEditClick = (category: Category) => {
        clearErrors();
        setDialogMode('edit');
        setActiveCategoryId(category.id);
        setData({
            name: category.name,
            description: category.description ?? '',
            hex_color: category.hex_color ?? '#ab339f',
        });
        setIsDialogOpen(true);
    };

    const submitDialog = (event: React.FormEvent) => {
        event.preventDefault();

        const onSuccess = () => {
            setIsDialogOpen(false);
            setDialogMode('create');
            setActiveCategoryId(null);
            reset();
            clearErrors();
        };

        if (dialogMode === 'edit' && activeCategoryId !== null) {
            put(`/categories/${activeCategoryId}`, {
                preserveScroll: true,
                onSuccess,
            });

            return;
        }

        post('/categories', {
            preserveScroll: true,
            onSuccess,
        });
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
                        disabled={processing}
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
            <Head title="Categories" />

            <ResourceIndexTable
                resourcePath="/categories"
                searchPlaceholder="Search categories..."
                pagination={{ ...categories, data: localCategories }}
                filters={filters}
                columns={columns}
                emptyMessage="No categories found."
                selection={{
                    selectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (category, checked) => toggleOne(category.id, checked),
                    getLabel: (category) => `Select ${category.name}`,
                }}
            />

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open ? closeCreateDialog() : setIsDialogOpen(true)}>
                <DialogContent className="sm:max-w-180 rounded-lg" onPointerDownOutside={closeCreateDialog}>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'edit' ? (data.name || 'Edit category') : (data.name || 'New category')}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'edit' ? 'Update the selected category.' : 'Basic information about your category.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitDialog} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className="rounded"
                                placeholder="e.g. Office Equipment"
                            />
                            {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                className="rounded"
                                placeholder="Items used for office work, such as computers, printers, scanners, or phones."
                            />
                            {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="hex_color">Hex Color</Label>
                            <div className='flex items-center gap-2'>
                                <Input
                                    id="hex_color"
                                    type="text"
                                    value={data.hex_color}
                                    onChange={(event) => setData('hex_color', event.target.value)}
                                    className="rounded"
                                    placeholder="#ab339f"
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                                        setData('hex_color', randomColor);
                                    }}
                                    style={{
                                        backgroundColor: data.hex_color,
                                    }}
                                    className="h-10 px-3 shrink-0 rounded border-2 border-border hover:shadow-md transition-shadow flex items-center justify-center gap-2 text-white font-semibold text-sm"
                                    title="Click to generate random color"
                                >
                                    <Pipette size={16} className="drop-shadow-md" />
                                </Button>
                            </div>
                            {errors.hex_color && <span className="text-sm text-red-500">{errors.hex_color}</span>}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={closeCreateDialog} className="rounded">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="rounded bg-[#f0642d] hover:bg-[#d95627] text-white border-none">
                                {processing ? (dialogMode === 'edit' ? 'Updating...' : 'Saving...') : (dialogMode === 'edit' ? 'Update' : 'Save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && closeDeleteDialog()}>
                <DialogContent className="sm:max-w-106.25 rounded-lg" onPointerDownOutside={closeDeleteDialog}>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            This will permanently remove <span className="font-semibold text-foreground">{categoryToDelete?.name}</span>. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-muted-foreground">
                        Delete this category only if you are sure it should no longer exist and won't break any asset associations.
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeDeleteDialog} className="rounded">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded" disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete category'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
            <Button className="rounded border-none" onClick={() => dispatchCategoryCreateEvent()}>
                New category
            </Button>
        }
    />
);
