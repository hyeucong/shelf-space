import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CategoryOption {
    id: number;
    name: string;
}

interface LocationOption {
    id: number;
    name: string;
}

interface PageProps extends Record<string, unknown> {
    categories?: CategoryOption[];
    locations?: LocationOption[];
    flash?: {
        createdCategory?: CategoryOption;
        createdLocation?: LocationOption;
    };
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        asset_id: '',
        description: '',
        value: '',
        category_id: '',
        tags: [],
        location_id: '',
    });
    const categoryForm = useForm({
        name: '',
        description: '',
        hex_color: '#ab339f',
        redirect_to: '/assets/create',
    });
    const locationForm = useForm({
        name: '',
        description: '',
        redirect_to: '/assets/create',
    });

    const [newTag, setNewTag] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const page = usePage<PageProps>();
    const categories = page.props.categories || [];
    const locations = page.props.locations || [];
    const flash = page.props.flash;

    const openCategoryCreate = () => {
        categoryForm.reset();
        categoryForm.clearErrors();
        setIsCategoryDialogOpen(true);
    };

    const openLocationCreate = () => {
        locationForm.reset();
        locationForm.clearErrors();
        setIsLocationDialogOpen(true);
    };

    useEffect(() => {
        if (!flash?.createdCategory) {
            return;
        }

        setData('category_id', String(flash.createdCategory.id));
        setIsCategoryDialogOpen(false);
        categoryForm.reset();
        categoryForm.clearErrors();
    }, [categoryForm, flash?.createdCategory, setData]);

    useEffect(() => {
        if (!flash?.createdLocation) {
            return;
        }

        setData('location_id', String(flash.createdLocation.id));
        setIsLocationDialogOpen(false);
        locationForm.reset();
        locationForm.clearErrors();
    }, [flash?.createdLocation, locationForm, setData]);

    const submitCategory = (e: React.FormEvent) => {
        e.preventDefault();

        categoryForm.post('/categories', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsCategoryDialogOpen(false);
            },
        });
    };

    const submitLocation = (e: React.FormEvent) => {
        e.preventDefault();

        locationForm.post('/locations', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsLocationDialogOpen(false);
            },
        });
    };

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        post('/assets');
    };

    return (
        <div className="w-full">
            <Head title="New asset" />

            <div className="w-full border-b px-6 py-4 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    {data.name || 'Untitled Asset'}
                </h1>
            </div>

            <form onSubmit={submit} className="px-6 space-y-6 max-w-4xl pb-10">
                <Card className="rounded border shadow-none">
                    <div className="flex items-center justify-between pr-6 border-b border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Basic fields</CardTitle>
                            <CardDescription>
                                Basic information about your asset.
                            </CardDescription>
                        </CardHeader>

                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-px">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-l rounded-r-none border-r-0"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button type="button" variant="outline" className="rounded-l-none rounded-r">
                                    Add another
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className={`rounded bg-[#f0642d] hover:bg-[#d95627] text-white border-none`}
                            >
                                Save
                            </Button>
                        </div>
                    </div>

                    <CardContent className="space-y-6 pt-6">
                        {/* Name Input */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="rounded"
                                    placeholder="e.g. MacBook Pro"
                                />
                                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                            </div>
                        </div>

                        {/* Asset ID Group */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                                <Label htmlFor="asset_id">Asset ID</Label>
                                <p className="text-sm text-muted-foreground mt-1">This sequential ID will be assigned when the asset is created.</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex -space-x-px">
                                    <div className="flex items-center rounded-l border border-input bg-muted px-3 text-sm text-muted-foreground">
                                        SAM
                                    </div>
                                    <Input
                                        id="asset_id"
                                        value={data.asset_id}
                                        onChange={e => setData('asset_id', e.target.value)}
                                        className="rounded-l-none rounded-r focus-visible:z-10"
                                        placeholder="0002"
                                    />
                                </div>
                                {errors.asset_id && <span className="text-sm text-red-500">{errors.asset_id}</span>}
                            </div>
                        </div>

                        {/* Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                                <Label>Category</Label>
                                <p className="text-sm text-muted-foreground mt-1">Make it unique. Each asset can have 1 category. It will show on your index.</p>
                            </div>
                            <div className="md:col-span-2">
                                <Select
                                    value={data.category_id ? String(data.category_id) : ''}
                                    onValueChange={(v) => {
                                        if (v === 'create_category') {
                                            openCategoryCreate();
                                            return;
                                        }

                                        setData('category_id', v);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {categories.length ? (
                                            categories.map((c: any) => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem
                                                value="create_category"
                                                className="cursor-pointer"
                                                onSelect={openCategoryCreate}
                                            >
                                                Create new category
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                                <Label>Tags</Label>
                                <p className="text-sm text-muted-foreground mt-1">Tags can help you organise your database. They can be combined.</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="new_tag"
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        className="rounded"
                                        placeholder="Add a tag"
                                    />
                                    <Button type="button" onClick={() => {
                                        if (!newTag) return;
                                        setSelectedTags(prev => Array.from(new Set([...prev, newTag])));
                                        setNewTag('');
                                    }}>Add</Button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedTags.map((t) => (
                                        <Badge key={t} className="cursor-default">{t}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                                <Label>Location</Label>
                                <p className="text-sm text-muted-foreground mt-1">A location is a place where an item is supposed to be located. This is different than the last scanned location.</p>
                            </div>
                            <div className="md:col-span-2">
                                <Select
                                    value={data.location_id ? String(data.location_id) : ''}
                                    onValueChange={(v) => {
                                        if (v === 'create_location') {
                                            openLocationCreate();
                                            return;
                                        }

                                        setData('location_id', v);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {locations.length ? (
                                            locations.map((l: any) => (
                                                <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem
                                                value="create_location"
                                                className="cursor-pointer"
                                                onSelect={openLocationCreate}
                                            >
                                                Create new location
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Value Input */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                                <Label htmlFor="value">Value</Label>
                                <p className="text-sm text-muted-foreground mt-1">Specify the value of assets to get an idea of the total value of your inventory.</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex -space-x-px">
                                    <div className="flex items-center rounded-l border border-input bg-muted px-3 text-sm text-muted-foreground">
                                        USD
                                    </div>
                                    <Input
                                        id="value"
                                        value={data.value}
                                        onChange={e => setData('value', e.target.value)}
                                        className="rounded-l-none rounded-r focus-visible:z-10"
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.value && <span className="text-sm text-red-500">{errors.value}</span>}
                            </div>
                        </div>

                        {/* Description Input */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                                <Label htmlFor="description">Description</Label>
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="rounded"
                                    placeholder="Add a short description"
                                />
                                {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>

            <Dialog
                open={isCategoryDialogOpen}
                onOpenChange={(open) => {
                    if (!open && !categoryForm.processing) {
                        categoryForm.reset();
                        categoryForm.clearErrors();
                    }

                    setIsCategoryDialogOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-180 rounded-lg">
                    <DialogHeader>
                        <DialogTitle>New category</DialogTitle>
                        <DialogDescription>
                            Create a category without leaving the asset form.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCategory} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="category_name">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="category_name"
                                value={categoryForm.data.name}
                                onChange={(e) => categoryForm.setData('name', e.target.value)}
                                className="rounded"
                                placeholder="e.g. Office Equipment"
                            />
                            {categoryForm.errors.name && <span className="text-sm text-red-500">{categoryForm.errors.name}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category_description">Description</Label>
                            <Input
                                id="category_description"
                                value={categoryForm.data.description}
                                onChange={(e) => categoryForm.setData('description', e.target.value)}
                                className="rounded"
                                placeholder="Short category description"
                            />
                            {categoryForm.errors.description && <span className="text-sm text-red-500">{categoryForm.errors.description}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category_hex_color">Hex Color</Label>
                            <Input
                                id="category_hex_color"
                                value={categoryForm.data.hex_color}
                                onChange={(e) => categoryForm.setData('hex_color', e.target.value)}
                                className="rounded"
                                placeholder="#ab339f"
                            />
                            {categoryForm.errors.hex_color && <span className="text-sm text-red-500">{categoryForm.errors.hex_color}</span>}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCategoryDialogOpen(false)}
                                className="rounded"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={categoryForm.processing}
                                className="rounded bg-[#f0642d] text-white border-none hover:bg-[#d95627]"
                            >
                                {categoryForm.processing ? 'Saving...' : 'Save category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isLocationDialogOpen}
                onOpenChange={(open) => {
                    if (!open && !locationForm.processing) {
                        locationForm.reset();
                        locationForm.clearErrors();
                    }

                    setIsLocationDialogOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-180 rounded-lg">
                    <DialogHeader>
                        <DialogTitle>New location</DialogTitle>
                        <DialogDescription>
                            Create a location without leaving the asset form.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitLocation} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="location_name">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="location_name"
                                value={locationForm.data.name}
                                onChange={(e) => locationForm.setData('name', e.target.value)}
                                className="rounded"
                                placeholder="e.g. Main Office"
                            />
                            {locationForm.errors.name && <span className="text-sm text-red-500">{locationForm.errors.name}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location_description">Description</Label>
                            <Input
                                id="location_description"
                                value={locationForm.data.description}
                                onChange={(e) => locationForm.setData('description', e.target.value)}
                                className="rounded"
                                placeholder="Short location description"
                            />
                            {locationForm.errors.description && <span className="text-sm text-red-500">{locationForm.errors.description}</span>}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsLocationDialogOpen(false)}
                                className="rounded"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={locationForm.processing}
                                className="rounded bg-[#f0642d] text-white border-none hover:bg-[#d95627]"
                            >
                                {locationForm.processing ? 'Saving...' : 'Save location'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Assets', href: '/assets' },
            { title: 'New asset', href: '' }
        ]}
    />
);
