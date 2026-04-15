import { useEffect, useState, type FormEventHandler, type ReactNode } from 'react';

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
    warning: ReactNode;
    processing?: boolean;
    onConfirm: () => void;
    confirmLabel: string;
    confirmPendingLabel?: string;
    contentClassName?: string;
    footerClassName?: string;
}

export function ResourceHeaderAction({ label, onClick, visible = true }: ResourceHeaderActionProps) {
    if (!visible) {
        return null;
    }

    return (
        <Button className="rounded border-none" onClick={onClick}>
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
                            className={cn('rounded border-none bg-[#f0642d] text-white hover:bg-[#d95627]', submitButtonClassName)}
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
    warning,
    processing = false,
    onConfirm,
    confirmLabel,
    confirmPendingLabel = 'Deleting...',
    contentClassName = 'sm:max-w-106.25 rounded-lg',
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
                <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-muted-foreground">
                    {warning}
                </div>
                <DialogFooter className={cn('gap-2 sm:gap-0', footerClassName)}>
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
