import { useEffect, useState, type FormEventHandler, type ReactNode } from 'react';
import { AssetSelectField, type AssetSelectOption } from '@/components/asset-select-field';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ResourceHeaderActionProps {
    label: string;
    onClick: () => void;
    visible?: boolean;
}

interface ResourceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: FormEventHandler<HTMLFormElement>;
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    processing?: boolean;
    submitLabel: string;
    submitPendingLabel?: string;
    cancelLabel?: string;
    contentClassName?: string;
    footerClassName?: string;
    submitButtonClassName?: string;
    cancelButtonClassName?: string;
}

interface ResourceDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    itemName?: string | null;
    itemMeta?: string | null;
    warning?: ReactNode;
    processing?: boolean;
    onConfirm: () => void;
    confirmLabel: string;
    confirmPendingLabel?: string;
    contentClassName?: string;
    footerClassName?: string;
}

interface ResourceDuplicateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName?: string | null;
    itemMeta?: string | null;
    processing?: boolean;
    onConfirm: (count: number) => void;
    maxCopies?: number;
}

interface ResourceSelectDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    resourceName: string;
    count: number;
    processing?: boolean;
    onConfirm: () => void;
    confirmLabel: string;
    confirmPendingLabel?: string;
}

interface ResourceSelectUpdateTagDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    count: number;
    options: AssetSelectOption[];
    processing?: boolean;
    onConfirm: (tagId: string) => void;
}

interface ResourceSelectUpdateCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    count: number;
    options: AssetSelectOption[];
    processing?: boolean;
    onConfirm: (categoryId: string) => void;
}

export function ResourceHeaderAction({ label, onClick, visible = true }: ResourceHeaderActionProps) {
    if (!visible) {
        return null;
    }

    return (
        <Button className="rounded bg-white text-black hover:bg-zinc-200 border border-border dark:bg-white dark:text-black dark:hover:bg-zinc-200" onClick={onClick}>
            {label}
        </Button>
    );
}

export function ResourceFormDialog({
    open,
    onOpenChange,
    onSubmit,
    title,
    description,
    children,
    processing = false,
    submitLabel,
    submitPendingLabel,
    cancelLabel = 'Cancel',
    contentClassName,
    footerClassName,
    submitButtonClassName,
    cancelButtonClassName,
}: ResourceFormDialogProps) {
    const resolvedSubmitLabel = processing && submitPendingLabel ? submitPendingLabel : submitLabel;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={contentClassName}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-6">
                    {children}

                    <DialogFooter className={cn('gap-2', footerClassName)}>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className={cn('rounded', cancelButtonClassName)}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className={cn('rounded bg-white text-black hover:bg-zinc-200 border border-border', submitButtonClassName)}
                        >
                            {resolvedSubmitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function ResourceDeleteDialog({
    open,
    onOpenChange,
    title,
    itemName,
    itemMeta,
    processing = false,
    onConfirm,
    confirmLabel,
    confirmPendingLabel = 'Deleting...',
    contentClassName = 'sm:max-w-106.25 rounded',
    footerClassName,
}: ResourceDeleteDialogProps) {
    const [snapshot, setSnapshot] = useState({
        itemName: itemName ?? '',
        itemMeta: itemMeta ?? null,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        setSnapshot({
            itemName: itemName ?? '',
            itemMeta: itemMeta ?? null,
        });
    }, [itemMeta, itemName, open]);

    const displayName = itemName ?? snapshot.itemName;
    const displayMeta = itemMeta ?? snapshot.itemMeta;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={contentClassName}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        This will permanently remove <span className="font-semibold text-foreground">{displayName}</span>
                        {displayMeta ? <span className="text-muted-foreground"> ({displayMeta})</span> : null}.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className={cn('gap-2', footerClassName)}>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} className="rounded" disabled={processing}>
                        {processing ? confirmPendingLabel : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ResourceDuplicateDialog({
    open,
    onOpenChange,
    itemName,
    itemMeta,
    processing = false,
    onConfirm,
    maxCopies = 10,
}: ResourceDuplicateDialogProps) {
    const [count, setCount] = useState(1);
    const [snapshot, setSnapshot] = useState({
        itemName: itemName ?? '',
        itemMeta: itemMeta ?? null,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        setSnapshot({
            itemName: itemName ?? '',
            itemMeta: itemMeta ?? null,
        });
        setCount(1);
    }, [itemMeta, itemName, open]);

    const displayName = itemName ?? snapshot.itemName;
    const displayMeta = itemMeta ?? snapshot.itemMeta;

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        onConfirm(count);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded">
                <DialogHeader>
                    <DialogTitle>Duplicate Resource</DialogTitle>
                    <DialogDescription>
                        Create copies of <span className="font-semibold text-foreground">{displayName}</span>
                        {displayMeta ? <span className="text-muted-foreground"> ({displayMeta})</span> : null}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <div className="space-y-2">
                        <label htmlFor="copies-count" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Number of copies
                        </label>
                        <input
                            id="copies-count"
                            type="number"
                            min="1"
                            max={maxCopies}
                            value={count}
                            onChange={(e) => setCount(Math.min(maxCopies, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            You can create up to {maxCopies} copies at once.
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="rounded">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="rounded bg-white text-black hover:bg-zinc-200 border border-border"
                            disabled={processing}
                        >
                            {processing ? 'Duplicating...' : 'Duplicate'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function ResourceSelectDeleteDialog({
    open,
    onOpenChange,
    title,
    resourceName,
    count,
    processing = false,
    onConfirm,
    confirmLabel,
    confirmPendingLabel = 'Deleting...',
}: ResourceSelectDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25 rounded">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        This will permanently remove <span className="font-semibold text-foreground">{count} {count === 1 ? resourceName : `${resourceName}s`}</span>.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} className="rounded" disabled={processing}>
                        {processing ? confirmPendingLabel : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ResourceSelectUpdateTagDialog({
    open,
    onOpenChange,
    count,
    options,
    processing = false,
    onConfirm,
}: ResourceSelectUpdateTagDialogProps) {
    const [tagId, setTagId] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        onConfirm(tagId);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded">
                <DialogHeader>
                    <DialogTitle>Update Tags</DialogTitle>
                    <DialogDescription>
                        Select a tag to apply to <span className="font-semibold text-foreground">{count} {count === 1 ? 'asset' : 'assets'}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <AssetSelectField
                        label="Tag"
                        description="Choose a tag to sync to all selected assets."
                        open={isSelectOpen}
                        onOpenChange={setIsSelectOpen}
                        value={tagId}
                        onValueChange={setTagId}
                        placeholder="Select tag"
                        options={options}
                        emptyLabel="No tags yet."
                        createValue="create_tag"
                        createLabel="Create new tag"
                        showCreate={false}
                        hideLabel={true}
                    />

                    <DialogFooter className="gap-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="rounded">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className={cn('rounded bg-white text-black hover:bg-zinc-200 border border-zinc-200')}
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function ResourceSelectUpdateCategoryDialog({
    open,
    onOpenChange,
    count,
    options,
    processing = false,
    onConfirm,
}: ResourceSelectUpdateCategoryDialogProps) {
    const [categoryId, setCategoryId] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        onConfirm(categoryId);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded">
                <DialogHeader>
                    <DialogTitle>Update Category</DialogTitle>
                    <DialogDescription>
                        Select a category to apply to <span className="font-semibold text-foreground">{count} {count === 1 ? 'asset' : 'assets'}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <AssetSelectField
                        label="Category"
                        description="Choose a category to set for all selected assets."
                        open={isSelectOpen}
                        onOpenChange={setIsSelectOpen}
                        value={categoryId}
                        onValueChange={setCategoryId}
                        placeholder="Select category"
                        options={options}
                        emptyLabel="No categories yet."
                        createValue="create_category"
                        createLabel="Create new category"
                        showCreate={false}
                        hideLabel={true}
                    />

                    <DialogFooter className="gap-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="rounded">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className={cn('rounded bg-white text-black hover:bg-zinc-200 border border-zinc-200')}
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
