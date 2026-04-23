import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { AssetSelectField } from '@/components/asset-select-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationFormDialog } from '@/pages/locations/form-dialog';

export interface LocationFormValues {
    name: string;
    description: string;
    address: string;
    parent_location_id: string;
}

interface LocationOption {
    id: number;
    name: string;
}

interface SharedPageProps extends Record<string, unknown> {
    location?: {
        id: number;
        name: string;
        description: string | null;
        address: string | null;
        parent_location_id: number | null;
    } | null;
    parentOptions?: LocationOption[];
    locations?: LocationOption[];
    flash?: {
        createdLocation?: LocationOption;
    };
}

function buildFormValues(initialValues?: Partial<LocationFormValues>) {
    return {
        name: initialValues?.name ?? '',
        description: initialValues?.description ?? '',
        address: initialValues?.address ?? '',
        parent_location_id: initialValues?.parent_location_id ?? '',
    };
}

export default function Create() {
    const page = usePage<SharedPageProps>();
    const location = page.props.location;
    const isEditing = !!location;
    const parentOptions = (page.props.parentOptions ?? []).filter((option) => option.id !== location?.id);
    const flash = page.props.flash;
    const [isParentSelectOpen, setIsParentSelectOpen] = useState(false);
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const [pendingDialog, setPendingDialog] = useState<'location' | null>(null);
    const [submitMode, setSubmitMode] = useState<'save' | 'add-another'>('save');
    const handledCreatedLocationId = useRef<number | null>(null);
    const initialValues = buildFormValues({
        name: location?.name ?? '',
        description: location?.description ?? '',
        address: location?.address ?? '',
        parent_location_id: location?.parent_location_id ? String(location.parent_location_id) : '',
    });
    const { data, setData, post, put, processing, errors, reset } = useForm(initialValues);
    const redirectTo = isEditing && location ? `/locations/${location.id}/edit` : '/locations/create';

    useEffect(() => {
        if (!flash?.createdLocation) {
            return;
        }

        if (handledCreatedLocationId.current === flash.createdLocation.id) {
            return;
        }

        handledCreatedLocationId.current = flash.createdLocation.id;
        setData('parent_location_id', String(flash.createdLocation.id));
        setIsParentSelectOpen(false);
        setIsLocationDialogOpen(false);
        setPendingDialog(null);
    }, [flash?.createdLocation, setData]);

    useEffect(() => {
        if (pendingDialog !== 'location' || isParentSelectOpen) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setPendingDialog(null);
            setIsLocationDialogOpen(true);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isParentSelectOpen, pendingDialog]);

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (isEditing && location) {
            put(`/locations/${location.id}`);

            return;
        }

        post('/locations', {
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

    return (
        <div className="w-full">
            <Head title={isEditing ? 'Edit location' : 'New location'} />

            <div className="w-full border-b px-6 py-4 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    {data.name || (isEditing ? 'Edit location' : 'New location')}
                </h1>
            </div>

            <form onSubmit={submit} className="px-6 space-y-6 max-w-4xl pb-10">
                <Card className="rounded border shadow-none">
                    <CardContent className="space-y-6">
                        <div className="flex justify-between border-b border-border/50 pb-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Basic fields</CardTitle>
                                <CardDescription>
                                    {isEditing ? 'Update the selected location.' : 'Basic information about your new location.'}
                                </CardDescription>
                            </CardHeader>

                            <div className="flex gap-2">
                                <div className="flex -space-x-px">
                                    <Button
                                        variant="outline"
                                        className="rounded-l rounded-r-none border-r-0"
                                        asChild
                                    >
                                        <Link href="/locations">Cancel</Link>
                                    </Button>

                                    {!isEditing ? (
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            className="rounded-l-none rounded-r"
                                            onClick={() => setSubmitMode('add-another')}
                                        >
                                            Add another
                                        </Button>
                                    ) : null}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    onClick={() => setSubmitMode('save')}
                                    className="rounded border-none bg-[#f0642d] text-white hover:bg-[#d95627]"
                                >
                                    {isEditing ? 'Update' : 'Save'}
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
                                    placeholder="e.g. Main Warehouse"
                                />
                                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                            </div>
                        </div>

                        <AssetSelectField
                            label="Parent location"
                            description="Use a parent location to organize spaces into a clear hierarchy, like building, floor, and room."
                            open={isParentSelectOpen}
                            onOpenChange={setIsParentSelectOpen}
                            value={data.parent_location_id || ''}
                            onValueChange={(value) => {
                                if (value === 'none') {
                                    setData('parent_location_id', '');
                                    setIsParentSelectOpen(false);

                                    return;
                                }

                                if (value === 'create_location') {
                                    setPendingDialog('location');
                                    setIsParentSelectOpen(false);

                                    return;
                                }

                                setData('parent_location_id', value);
                                setIsParentSelectOpen(false);
                            }}
                            placeholder="Select parent location"
                            options={parentOptions}
                            emptyLabel="No parent locations yet."
                            clearValue="none"
                            clearLabel="No parent"
                            createValue="create_location"
                            createLabel="Create new location"
                        />
                        {errors.parent_location_id && <div className="text-sm text-red-500">{errors.parent_location_id}</div>}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
                            <div>
                                <Label htmlFor="address">Address</Label>
                                <p className="mt-1 text-sm text-muted-foreground">Store the street or mailing address for this location.</p>
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    className="rounded"
                                    placeholder="Street, City, State, ZIP"
                                />
                                {errors.address && <span className="text-sm text-red-500">{errors.address}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <p className="mt-1 text-sm text-muted-foreground">Add context to help teammates understand what is stored here.</p>
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

            <LocationFormDialog
                open={isLocationDialogOpen}
                onOpenChange={setIsLocationDialogOpen}
                parentOptions={parentOptions}
                redirectTo={redirectTo}
                preserveState
            />
        </div>
    );
}

Create.layout = (page: React.ReactNode) => {
    const locationPage = page as React.ReactElement<{ location?: unknown }>;
    const isEditing = Boolean(locationPage.props?.location);

    return (
        <AppSidebarLayout
            children={page}
            breadcrumbs={[
                { title: 'Locations', href: '/locations' },
                { title: isEditing ? 'Edit location' : 'New location', href: '' },
            ]}
        />
    );
};
