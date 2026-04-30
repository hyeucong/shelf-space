import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { AssetSelectField } from '@/components/asset-select-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryFormDialog } from '@/pages/categories/create';
import { LocationFormDialog } from '@/pages/locations/form-dialog';

interface CategoryOption {
    id: number;
    name: string;
}

interface LocationOption {
    id: string;
    name: string;
}

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        category_id: '',
        location_id: '',
    });

    const [submitMode, setSubmitMode] = useState<'save' | 'add-another'>('save');
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);
    const [isLocationSelectOpen, setIsLocationSelectOpen] = useState(false);
    const [pendingDialog, setPendingDialog] = useState<'category' | 'location' | null>(null);
    const handledCreatedCategoryId = useRef<number | null>(null);
    const handledCreatedLocationId = useRef<string | null>(null);
    const page = usePage<{ categories?: CategoryOption[]; locations?: LocationOption[]; flash?: Record<string, any> }>();
    const categories = page.props.categories || [];
    const locations = page.props.locations || [];
    const flash = page.props.flash;

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        post('/kits', {
            preserveScroll: true,
            onSuccess: () => {
                if (submitMode !== 'add-another') {
                    return;
                }

                reset();
                setSubmitMode('save');
            },
        });
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
            setIsCategoryDialogOpen(true);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isCategorySelectOpen, pendingDialog]);

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
            setIsLocationDialogOpen(true);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isLocationSelectOpen, pendingDialog]);

    return (
        <div className="w-full">
            <Head title="New kit" />

            <div className="w-full border-b px-6 py-4 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    {data.name || 'Untitled Kit'}
                </h1>
            </div>

            <form onSubmit={submit} className="px-6 space-y-6 max-w-4xl pb-10">
                <Card className="rounded border shadow-none">
                    <CardContent className="space-y-6">
                        <div className="flex justify-between border-b border-border/50 pb-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Basic fields</CardTitle>
                                <CardDescription>
                                    Basic information about your kit.
                                </CardDescription>
                            </CardHeader>

                            <div className="flex gap-2">
                                <div className="flex -space-x-px">
                                    <Button variant="outline" className="rounded" asChild>
                                        <Link href="/kits">Cancel</Link>
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="rounded-l-none rounded-r"
                                        onClick={() => setSubmitMode('add-another')}
                                    >
                                        Add another
                                    </Button>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    onClick={() => setSubmitMode('save')}
                                    className="rounded border-none bg-[#f0642d] text-white hover:bg-[#d95627]"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
                            <div>
                                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="rounded"
                                    placeholder="e.g. Photography Kit"
                                />
                                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                            </div>
                        </div>
                        <AssetSelectField
                            label="Category"
                            description="Assign a category to group similar kits."
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

                        <AssetSelectField
                            label="Location"
                            description="Select a location where this kit is usually stored."
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <p className="mt-1 text-sm text-muted-foreground">Add context to help teammates understand this kit.</p>
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
                redirectTo="/kits/create"
                preserveState={true}
            />

            <LocationFormDialog
                open={isLocationDialogOpen}
                onOpenChange={setIsLocationDialogOpen}
                parentOptions={locations}
                redirectTo="/kits/create"
                preserveState={true}
            />
        </div>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Kits', href: '/kits' },
            { title: 'New Kit', href: '' }
        ]}
    />
);
