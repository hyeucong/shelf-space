import { Link } from '@inertiajs/react';
import { Edit2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export interface HeaderActionItem {
    key: string;
    label: string;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    destructive?: boolean;
}

interface HeaderActionsProps {
    actions?: HeaderActionItem[];
    editHref?: string;
}

export function HeaderActions({ actions = [], editHref }: HeaderActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const allActions: HeaderActionItem[] = [];
    if (editHref) {
        allActions.push({
            key: 'edit',
            label: 'Edit',
            icon: <Edit2 size={16} />,
            href: editHref,
        });
    }
    allActions.push(...actions);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        const handlePointerDown = (event: MouseEvent | PointerEvent | TouchEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (containerRef.current?.contains(target)) return;
            
            if (
                target instanceof Element &&
                target.closest('[data-slot="select-content"], [data-slot="dropdown-menu-content"], [data-slot="dialog-content"]')
            ) {
                return;
            }

            setIsOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [isOpen]);

    if (allActions.length === 0) return null;

    return (
        <div ref={containerRef} className="relative shrink-0">
            <Button
                type="button"
                variant="outline"
                className={isOpen ? 'h-9 shrink-0 rounded bg-muted text-foreground border-border' : 'h-9 shrink-0 rounded border-border'}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
            >
                Actions
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded border bg-background">
                    <div className="p-2">
                        <div className="space-y-1">
                            {allActions.map((action) => {
                                const content = (
                                    <span className="flex items-center gap-3">
                                        {action.icon && <span className="shrink-0 text-muted-foreground">{action.icon}</span>}
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
                                            <Link href={action.href} onClick={() => setIsOpen(false)}>
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
                                            if (action.disabled) return;
                                            action.onClick?.();
                                            setIsOpen(false);
                                        }}
                                    >
                                        {content}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
