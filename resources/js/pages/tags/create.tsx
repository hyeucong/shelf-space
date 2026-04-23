import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResourceFormDialog } from '@/components/resource-form-dialog';

export const TAG_CREATE_EVENT = 'tags:create:open';

export function dispatchTagCreateEvent() {
    window.dispatchEvent(new CustomEvent(TAG_CREATE_EVENT));
}

export interface TagFormValues {
    name: string;
    description: string;
    hex_color: string;
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
        description: initialValues?.description ?? '',
        hex_color: initialValues?.hex_color ?? '#ab339f',
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
    const initialDescription = initialValues?.description ?? '';
    const initialHexColor = initialValues?.hex_color ?? '#ab339f';
    const { data, setData, post, put, processing, errors, clearErrors } = useForm(buildFormValues(initialValues, redirectTo));

    useEffect(() => {
        if (!open) {
            return;
        }

        setData(buildFormValues({ name: initialName, description: initialDescription, hex_color: initialHexColor }, redirectTo));
        clearErrors();
    }, [clearErrors, initialDescription, initialHexColor, initialName, open, redirectTo, setData]);

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
            contentClassName="sm:max-w-xl rounded"
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

            <div className="grid gap-2">
                <Label htmlFor="tag_description">Description</Label>
                <Input
                    id="tag_description"
                    value={data.description}
                    onChange={(event) => setData('description', event.target.value)}
                    className="rounded"
                    placeholder="Short description"
                />
                {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="tag_hex_color">Hex Color</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="tag_hex_color"
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
                        className="h-10 shrink-0 items-center justify-center gap-2 rounded border-2 border-border px-3 text-sm font-semibold text-white transition-shadow hover:shadow-md"
                        title="Click to generate random color"
                    >
                        <RotateCcw size={16} className="drop-shadow-md" />
                    </Button>
                </div>
                {errors.hex_color && <span className="text-sm text-red-500">{errors.hex_color}</span>}
            </div>
        </ResourceFormDialog>
    );
}
