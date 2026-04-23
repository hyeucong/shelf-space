import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResourceFormDialog } from '@/components/resource-form-dialog';

export const LOCATION_CREATE_EVENT = 'locations:create:open';

export function dispatchLocationCreateEvent() {
    window.dispatchEvent(new CustomEvent(LOCATION_CREATE_EVENT));
}

export interface LocationFormValues {
    name: string;
    description: string;
}

interface LocationFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: 'create' | 'edit';
    locationId?: number | null;
    initialValues?: Partial<LocationFormValues>;
    redirectTo?: string;
    preserveState?: boolean;
    onSuccess?: () => void;
}

function buildFormValues(initialValues?: Partial<LocationFormValues>, redirectTo = '') {
    return {
        name: initialValues?.name ?? '',
        description: initialValues?.description ?? '',
        redirect_to: redirectTo,
    };
}

export function LocationFormDialog({
    open,
    onOpenChange,
    mode = 'create',
    locationId = null,
    initialValues,
    redirectTo = '',
    preserveState = false,
    onSuccess,
}: LocationFormDialogProps) {
    const initialName = initialValues?.name ?? '';
    const initialDescription = initialValues?.description ?? '';
    const { data, setData, post, put, processing, errors, clearErrors } = useForm(buildFormValues(initialValues, redirectTo));

    useEffect(() => {
        if (!open) {
            return;
        }

        setData(buildFormValues({
            name: initialName,
            description: initialDescription,
        }, redirectTo));
        clearErrors();
    }, [clearErrors, initialDescription, initialName, open, redirectTo, setData]);

    const closeDialog = () => {
        onOpenChange(false);
    };

    const submitDialog = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const requestOptions = {
            preserveScroll: true,
            preserveState,
            onSuccess: () => {
                onSuccess?.();
                closeDialog();
            },
        };

        if (mode === 'edit' && locationId !== null) {
            put(`/locations/${locationId}`, requestOptions);

            return;
        }

        post('/locations', requestOptions);
    };

    return (
        <ResourceFormDialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    closeDialog();
                    return;
                }

                onOpenChange(true);
            }}
            onSubmit={submitDialog}
            title={mode === 'edit' ? (data.name || 'Edit location') : (data.name || 'New location')}
            description={mode === 'edit' ? 'Update the selected location.' : 'Basic information about your location.'}
            processing={processing}
            submitLabel={mode === 'edit' ? 'Update' : 'Save'}
            submitPendingLabel={mode === 'edit' ? 'Updating...' : 'Saving...'}
            contentClassName="sm:max-w-180 rounded"
        >
            <div className="grid gap-2">
                <Label htmlFor="location_name">Name <span className="text-red-500">*</span></Label>
                <Input
                    id="location_name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    className="rounded"
                    placeholder="e.g. Main Warehouse"
                />
                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="location_description">Description</Label>
                <Input
                    id="location_description"
                    value={data.description}
                    onChange={(event) => setData('description', event.target.value)}
                    className="rounded"
                    placeholder="Add a short description"
                />
                {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
            </div>
        </ResourceFormDialog>
    );
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
    });

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        post('/locations');
    };

    return (
        <div className="w-full">
            <Head title="New location" />

            <div className="w-full border-b px-6 py-4 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    {data.name || 'Untitled Location'}
                </h1>
            </div>

            <form onSubmit={submit} className="px-6 space-y-6 max-w-4xl pb-10">
                <Card className="rounded border shadow-none">
                    <div className="flex items-center justify-between pr-6 border-b border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Basic fields</CardTitle>
                            <CardDescription>
                                Basic information about your location.
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
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="rounded"
                                placeholder="e.g. Main Warehouse"
                            />
                            {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                        </div>

                        {/* Description Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="rounded"
                                placeholder="Add a short description"
                            />
                            {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Locations', href: '/locations' },
            { title: 'New Location', href: '' }
        ]}
    />
);
