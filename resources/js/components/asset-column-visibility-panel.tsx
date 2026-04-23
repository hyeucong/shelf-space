import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Modifier } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ASSET_OPTIONAL_COLUMN_LABELS } from '@/pages/assets/column-config';
import type { AssetColumnKey, AssetColumnPreference } from '@/pages/assets/column-config';

interface SortableColumnItemProps {
    column: AssetColumnPreference;
    onToggle: (columnKey: AssetColumnKey, checked: boolean) => void;
}

interface ColumnVisibilityPanelProps {
    open: boolean;
    columns: AssetColumnPreference[];
    onToggle: (columnKey: AssetColumnKey, checked: boolean) => void;
    onReorder: (event: DragEndEvent) => void;
    onCancel: () => void;
    onSave: () => void;
    isSaving: boolean;
    hasPendingChanges: boolean;
}

function SortableColumnItem({ column, onToggle }: SortableColumnItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column.key });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={isDragging ? 'rounded border bg-background opacity-80 shadow-lg' : undefined}
        >
            <div
                className="flex cursor-grab items-center gap-3 rounded border px-3 py-2 text-sm active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div
                    className="flex items-center gap-3"
                    onPointerDown={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                    onTouchStart={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                >
                    <Checkbox
                        checked={column.visible}
                        onCheckedChange={(checked) => onToggle(column.key, checked === true)}
                    />
                    <span>{ASSET_OPTIONAL_COLUMN_LABELS[column.key]}</span>
                </div>
            </div>
        </div>
    );
}

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
    ...transform,
    x: 0,
});

export function ColumnVisibilityPanel({
    open,
    columns,
    onToggle,
    onReorder,
    onCancel,
    onSave,
    isSaving,
    hasPendingChanges,
}: ColumnVisibilityPanelProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    if (!open) {
        return null;
    }

    return (
        <div className="absolute left-0 top-full z-50 mt-3 flex w-72 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded border bg-background shadow-xl">
            <div className="flex items-start justify-between border-b px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Visible columns</h3>
                    <p className="text-xs text-muted-foreground">Name is always visible.</p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={onCancel}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close panel</span>
                </Button>
            </div>
            <div className="p-4 pb-3">
                <div className="max-h-90 overflow-y-auto pr-1">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onReorder} modifiers={[restrictToVerticalAxis]}>
                        <SortableContext items={columns.map((column) => column.key)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {columns.map((column) => (
                                    <SortableColumnItem key={column.key} column={column} onToggle={onToggle} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
            <div className="border-t bg-background px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onSave} disabled={!hasPendingChanges || isSaving}>
                        {isSaving ? 'Saving...' : 'Save Layout'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
