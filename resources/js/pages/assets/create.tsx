import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { AssetSelectField } from '@/components/asset-select-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryFormDialog } from '@/pages/categories/create';
import { TagFormDialog } from '@/pages/tags/create';
import { LocationFormDialog } from '@/pages/locations/form-dialog';

interface CategoryOption {
    id: number;
    name: string;
}

interface LocationOption {
    id: string;
    name: string;
}

interface TagOption {
    id: number;
    name: string;
}

interface PageProps extends Record<string, unknown> {
    categories?: CategoryOption[];
    tags?: TagOption[];
    locations?: LocationOption[];
    flash?: {
        createdCategory?: CategoryOption;
        createdTag?: TagOption;
        createdLocation?: LocationOption;
    };
    next_id: string;
}

export default function Create() {
    const page = usePage<PageProps>();
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        asset_id: string;
        description: string;
        value: string;
        category_id: string;
        tags: string[];
        location_id: string;
    }>({
        name: '',
        asset_id: page.props.next_id || '',
        description: '',
        value: '',
        category_id: '',
        tags: [],
        location_id: '',
    });

    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);
    const [isTagSelectOpen, setIsTagSelectOpen] = useState(false);
    const [isLocationSelectOpen, setIsLocationSelectOpen] = useState(false);
    const [pendingDialog, setPendingDialog] = useState<'category' | 'tag' | 'location' | null>(null);
    const handledCreatedCategoryId = useRef<number | null>(null);
    const handledCreatedTagId = useRef<number | null>(null);
    const handledCreatedLocationId = useRef<string | null>(null);

    const categories = page.props.categories || [];
    const tags = page.props.tags || [];
    const locations = page.props.locations || [];
    const flash = page.props.flash;

    const openCategoryCreate = () => {
        setIsCategoryDialogOpen(true);
    };

    const openTagCreate = () => {
        setIsTagDialogOpen(true);
    };

    const openLocationCreate = () => {
        setIsLocationDialogOpen(true);
    };

    useEffect(() => {
        if (!flash?.createdCategory) {
            return;
        }

        if (handledCreatedCategoryId.current === flash.createdCategory.id) {
            return;
        }

        handledCreatedCategoryId.current = flash.createdCategory.id;

        setData('category_id', String(flash.createdCategory.id));
        setIsCategorySelectOpen(false);
        setIsCategoryDialogOpen(false);
        setPendingDialog((current) => (current === 'category' ? null : current));
    }, [flash?.createdCategory, setData]);

    useEffect(() => {
        if (pendingDialog !== 'category' || isCategorySelectOpen) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setPendingDialog(null);
            openCategoryCreate();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isCategorySelectOpen, pendingDialog]);

    useEffect(() => {
        if (!flash?.createdTag) {
            return;
        }

        if (handledCreatedTagId.current === flash.createdTag.id) {
            return;
        }

        handledCreatedTagId.current = flash.createdTag.id;

        setData('tags', [String(flash.createdTag.id)]);
        setIsTagSelectOpen(false);
        setIsTagDialogOpen(false);
        setPendingDialog((current) => (current === 'tag' ? null : current));
    }, [flash?.createdTag, setData]);

    useEffect(() => {
        if (pendingDialog !== 'tag' || isTagSelectOpen) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setPendingDialog(null);
            openTagCreate();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isTagSelectOpen, pendingDialog]);

    useEffect(() => {
        if (!flash?.createdLocation) {
            return;
        }

        if (handledCreatedLocationId.current === flash.createdLocation.id) {
            return;
        }

        handledCreatedLocationId.current = flash.createdLocation.id;

        setData('location_id', String(flash.createdLocation.id));
        setIsLocationSelectOpen(false);
        setIsLocationDialogOpen(false);
        setPendingDialog((current) => (current === 'location' ? null : current));
    }, [flash?.createdLocation, setData]);

    useEffect(() => {
        if (pendingDialog !== 'location' || isLocationSelectOpen) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setPendingDialog(null);
            openLocationCreate();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isLocationSelectOpen, pendingDialog]);

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
                    <CardContent className="space-y-6">
                        <div className="flex justify-between border-b border-border/50 pb-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Basic fields</CardTitle>
                                <CardDescription>
                                    Basic information about your asset.
                                </CardDescription>
                            </CardHeader>

                            <div className="flex gap-2">
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
                                <p className="text-sm text-muted-foreground mt-1">This sequential ID is automatically generated and fixed.</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex -space-x-px">
                                    <div className="flex items-center rounded-l border border-input bg-muted px-3 text-sm text-muted-foreground">
                                        AST
                                    </div>
                                    <Input
                                        id="asset_id"
                                        value={data.asset_id}
                                        onChange={e => setData('asset_id', e.target.value)}
                                        className="rounded-l-none rounded-r focus-visible:z-10 bg-muted/50 cursor-not-allowed"
                                        placeholder="0002"
                                        disabled
                                        readOnly
                                    />
                                </div>
                                {errors.asset_id && <span className="text-sm text-red-500">{errors.asset_id}</span>}
                            </div>
                        </div>

                        {/* Category */}
                        <AssetSelectField
                            label="Category"
                            description="Make it unique. Each asset can have 1 category. It will show on your index."
                            open={isCategorySelectOpen}
                            onOpenChange={setIsCategorySelectOpen}
                            value={data.category_id ? String(data.category_id) : ''}
                            onValueChange={(value) => {
                                if (value === 'create_category') {
                                    setPendingDialog('category');
                                    setIsCategorySelectOpen(false);
                                    return;
                                }

                                setData('category_id', value);
                            }}
                            placeholder="Select category"
                            options={categories}
                            emptyLabel="No categories yet."
                            createValue="create_category"
                            createLabel="Create new category"
                        />

                        {/* Tags */}
                        <AssetSelectField
                            label="Tags"
                            description="Tags can help you organise your database. They can be combined."
                            open={isTagSelectOpen}
                            onOpenChange={setIsTagSelectOpen}
                            value={data.tags[0] ?? ''}
                            onValueChange={(value) => {
                                if (value === 'create_tag') {
                                    setPendingDialog('tag');
                                    setIsTagSelectOpen(false);
                                    return;
                                }

                                setData('tags', value ? [value] : []);
                                setIsTagSelectOpen(false);
                            }}
                            placeholder="Select tag"
                            options={tags}
                            emptyLabel="No tags yet."
                            createValue="create_tag"
                            createLabel="Create new tag"
                        />

                        {/* Location */}
                        <AssetSelectField
                            label="Location"
                            description="A location is a place where an item is supposed to be located. This is different than the last scanned location."
                            open={isLocationSelectOpen}
                            onOpenChange={setIsLocationSelectOpen}
                            value={data.location_id ? String(data.location_id) : ''}
                            onValueChange={(value) => {
                                if (value === 'create_location') {
                                    setPendingDialog('location');
                                    setIsLocationSelectOpen(false);
                                    return;
                                }

                                setData('location_id', value);
                            }}
                            placeholder="Select location"
                            options={locations}
                            emptyLabel="No locations yet."
                            createValue="create_location"
                            createLabel="Create new location"
                        />

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

            <CategoryFormDialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
                redirectTo="/assets/create"
                preserveState={true}
            />

            <TagFormDialog
                open={isTagDialogOpen}
                onOpenChange={setIsTagDialogOpen}
                redirectTo="/assets/create"
                preserveState={true}
            />

            <LocationFormDialog
                open={isLocationDialogOpen}
                onOpenChange={setIsLocationDialogOpen}
                parentOptions={locations}
                redirectTo="/assets/create"
                preserveState={true}
            />
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
