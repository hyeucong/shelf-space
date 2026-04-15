import { Head, router, useForm } from '@inertiajs/react';
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
import { ArrowUpDown, Pipette, Pencil, Trash2 } from 'lucide-react';
import { SearchInput } from '@/components/search-input';
import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    categories: PaginatedData<Category>;
    filters: {
        search?: string;
        per_page?: string | number;
        sort?: string;
        order?: 'asc' | 'desc';
    };
}

export default function Categories({ categories, filters }: PageProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

    const closeTimeoutRef = useRef<number | null>(null);

    // Local optimistic state and delete modal
    const [localCategories, setLocalCategories] = useState<Category[]>(categories?.data || []);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    // Cleanup any pending close timeout when component unmounts
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    // Keep local list in sync with server props
    useEffect(() => {
        setLocalCategories(categories?.data || []);
    }, [categories]);

    const handleSortChange = (value: string) => {
        const [sort, order] = value.split(':');
        router.get('/categories', {
            ...filters,
            sort,
            order,
            page: 1
        }, {
            preserveState: true,
            replace: true
        });
    };

    const closeCreateDialog = () => {
        // start closing the dialog (triggers animation)
        setIsDialogOpen(false);

        // Delay clearing/reset until after the close animation finishes
        // (matches the dialog animation duration)
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }

        closeTimeoutRef.current = window.setTimeout(() => {
            setDialogMode('create');
            setActiveCategoryId(null);
            reset();
            clearErrors();
            closeTimeoutRef.current = null;
        }, 220);
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
                setCategoryToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <Head title="Categories" />

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
                                    url="/categories"
                                    placeholder="Search categories..."
                                    initialValue={filters?.search}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    {localCategories.length > 0 ? (
                        <div className="rounded border bg-background shadow-sm">
                            <div className="divide-y">
                                {localCategories.map((category) => (
                                    <div key={category.id} className="flex items-start justify-between gap-4 p-4">
                                        <div className="min-w-0 space-y-1">
                                            <h3 className="font-medium text-foreground">{category.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {category.description || 'No description yet.'}
                                            </p>
                                        </div>

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
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 border"
                                                onClick={() => setCategoryToDelete(category)}
                                                disabled={processing}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center rounded border border-dashed bg-background h-75">
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-2xl font-bold tracking-tight">No categories yet</h3>
                                <p className="text-sm text-muted-foreground">
                                    Categories help you organize your assets into groups like Electronics or Furniture.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
