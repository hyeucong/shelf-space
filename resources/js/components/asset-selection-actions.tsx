import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export interface AssetSelectionActionItem {
    key: string;
    label: string;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    destructive?: boolean;
}

interface AssetSelectionActionsProps {
    actions?: AssetSelectionActionItem[];
    actionsLabel?: string;
    actionsDisabled?: boolean;
}

export function AssetSelectionActions({
    actions = [],
    actionsLabel = 'Actions',
    actionsDisabled = false,
}: AssetSelectionActionsProps) {
    const [isActionsPanelOpen, setIsActionsPanelOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Keep the Actions button enabled even when inner items are disabled
    // (user should always be able to open the panel). Only disable when
    // the caller explicitly sets `actionsDisabled` or there are no actions.
    const isActionsButtonDisabled = actionsDisabled || actions.length === 0;

    useEffect(() => {
        if (!isActionsPanelOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsActionsPanelOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActionsPanelOpen]);

    useEffect(() => {
        if (!isActionsPanelOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | PointerEvent | TouchEvent) => {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (containerRef.current?.contains(target)) {
                return;
            }

            if (
                target instanceof Element
                && target.closest('[data-slot="select-content"], [data-slot="dropdown-menu-content"], [data-slot="dialog-content"]')
            ) {
                return;
            }

            setIsActionsPanelOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [isActionsPanelOpen]);

    return (
        <div className="flex items-center gap-2">
            <div ref={containerRef} className="relative shrink-0">
                <Button
                    type="button"
                    variant="outline"
                    className={isActionsPanelOpen ? 'h-9 shrink-0 rounded bg-muted text-foreground shadow-none' : 'h-9 shrink-0 rounded shadow-none'}
                    onClick={() => setIsActionsPanelOpen((current) => !current)}
                    aria-expanded={isActionsPanelOpen}
                    disabled={isActionsButtonDisabled}
                >
                    {actionsLabel}
                </Button>

                {isActionsPanelOpen ? (
                    <div className="absolute right-0 top-full z-50 mt-3 flex w-72 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded border bg-background shadow-xl">
                        <div className="p-2">
                            <div className="space-y-1">
                                {actions.map((action) => {
                                    const content = (
                                        <span className="flex items-center gap-3">
                                            {action.icon ? <span className="shrink-0">{action.icon}</span> : null}
                                            <span>{action.label}</span>
                                        </span>
                                    );

                                    const baseClass = 'h-11 w-full justify-start px-3 font-normal';
                                    const activeClass = action.destructive
                                        ? 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                                        : 'hover:bg-muted/10';
                                    const disabledClass = 'text-muted-foreground cursor-not-allowed hover:bg-transparent';
                                    const finalClass = `${baseClass} ${action.disabled ? disabledClass : activeClass}`;

                                    if (action.href && !action.disabled) {
                                        return (
                                            <Button
                                                key={action.key}
                                                type="button"
                                                variant="ghost"
                                                className={finalClass}
                                                asChild
                                            >
                                                <Link href={action.href} onClick={() => setIsActionsPanelOpen(false)}>
                                                    {content}
                                                </Link>
                                            </Button>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={action.key}
                                            type="button"
                                            variant="ghost"
                                            className={finalClass}
                                            disabled={action.disabled}
                                            onClick={() => {
                                                if (action.disabled) {
                                                    return;
                                                }

                                                action.onClick?.();

                                                setIsActionsPanelOpen(false);
                                            }}
                                        >
                                            {content}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
