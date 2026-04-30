import { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';

import { ResourceFormDialog } from '@/components/resource-form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface LocationFormValues {
    name: string;
    description: string;
    address: string;
    parent_location_id: string;
}

export interface LocationOption {
    id: string | number;
    name: string;
}

interface SharedPageProps extends Record<string, unknown> {
    parentOptions?: LocationOption[];
    locations?: LocationOption[];
}

interface LocationFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: 'create' | 'edit';
    locationId?: string | null;
    initialValues?: Partial<LocationFormValues>;
    parentOptions?: LocationOption[];
    redirectTo?: string;
    preserveState?: boolean;
    onSuccess?: () => void;
}

function buildFormValues(initialValues?: Partial<LocationFormValues>, redirectTo = '') {
    return {
        name: initialValues?.name ?? '',
        description: initialValues?.description ?? '',
        address: initialValues?.address ?? '',
        parent_location_id: initialValues?.parent_location_id ?? '',
        redirect_to: redirectTo,
    };
}

export function LocationFormDialog({
    open,
    onOpenChange,
    mode = 'create',
    locationId = null,
    initialValues,
    parentOptions,
    redirectTo = '',
    preserveState = false,
    onSuccess,
}: LocationFormDialogProps) {
    const page = usePage<SharedPageProps>();
    const availableParentOptions = parentOptions ?? page.props.parentOptions ?? page.props.locations ?? [];
    const initialName = initialValues?.name ?? '';
    const initialDescription = initialValues?.description ?? '';
    const initialAddress = initialValues?.address ?? '';
    const initialParentLocationId = initialValues?.parent_location_id ?? '';
    const { data, setData, post, put, processing, errors, clearErrors } = useForm(buildFormValues(initialValues, redirectTo));
    const filteredParentOptions = availableParentOptions.filter((location) => String(location.id) !== String(locationId ?? ''));

    useEffect(() => {
        if (!open) {
            return;
        }

        setData(buildFormValues({
            name: initialName,
            description: initialDescription,
            address: initialAddress,
            parent_location_id: initialParentLocationId,
        }, redirectTo));
        clearErrors();
    }, [clearErrors, initialAddress, initialDescription, initialName, initialParentLocationId, open, redirectTo, setData]);

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

            <div className="grid gap-2">
                <Label htmlFor="location_address">Address</Label>
                <Input
                    id="location_address"
                    value={data.address}
                    onChange={(event) => setData('address', event.target.value)}
                    className="rounded"
                    placeholder="Street, City, State, ZIP"
                />
                {errors.address && <span className="text-sm text-red-500">{errors.address}</span>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="location_parent">Parent Location</Label>
                <Select value={data.parent_location_id || 'none'} onValueChange={(value) => setData('parent_location_id', value === 'none' ? '' : value)}>
                    <SelectTrigger id="location_parent" className="w-full rounded">
                        <SelectValue placeholder="Select a parent location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">No parent</SelectItem>
                        {filteredParentOptions.map((location) => (
                            <SelectItem key={location.id} value={String(location.id)}>
                                {location.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.parent_location_id && <span className="text-sm text-red-500">{errors.parent_location_id}</span>}
            </div>
        </ResourceFormDialog>
    );
}
