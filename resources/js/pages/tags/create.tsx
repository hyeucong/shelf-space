import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResourceFormDialog } from '@/components/resource-form-dialog';

export const TAG_CREATE_EVENT = 'tags:create:open';

export function dispatchTagCreateEvent() {
    window.dispatchEvent(new CustomEvent(TAG_CREATE_EVENT));
}

export interface TagFormValues {
    name: string;
}

interface TagFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: 'create' | 'edit';
    tagId?: number | null;
    initialValues?: Partial<TagFormValues>;
    redirectTo?: string;
    preserveState?: boolean;
    onSuccess?: () => void;
}

function buildFormValues(initialValues?: Partial<TagFormValues>, redirectTo = '') {
    return {
        name: initialValues?.name ?? '',
        redirect_to: redirectTo,
    };
}

export function TagFormDialog({
    open,
    onOpenChange,
    mode = 'create',
    tagId = null,
    initialValues,
    redirectTo = '',
    preserveState = false,
    onSuccess,
}: TagFormDialogProps) {
    const initialName = initialValues?.name ?? '';
    const { data, setData, post, put, processing, errors, clearErrors } = useForm(buildFormValues(initialValues, redirectTo));

    useEffect(() => {
        if (!open) {
            return;
        }

        setData(buildFormValues({ name: initialName }, redirectTo));
        clearErrors();
    }, [clearErrors, initialName, open, redirectTo, setData]);

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

        if (mode === 'edit' && tagId !== null) {
            put(`/tags/${tagId}`, requestOptions);

            return;
        }

        post('/tags', requestOptions);
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
            title={mode === 'edit' ? (data.name || 'Edit tag') : (data.name || 'New tag')}
            description={mode === 'edit' ? 'Update the selected tag.' : 'Basic information about your tag.'}
            processing={processing}
            submitLabel={mode === 'edit' ? 'Update' : 'Save'}
            submitPendingLabel={mode === 'edit' ? 'Updating...' : 'Saving...'}
            contentClassName="sm:max-w-xl rounded-lg"
        >
            <div className="grid gap-2">
                <Label htmlFor="tag_name">Name <span className="text-red-500">*</span></Label>
                <Input
                    id="tag_name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    className="rounded"
                    placeholder="e.g. Critical"
                />
                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
            </div>
        </ResourceFormDialog>
    );
}
