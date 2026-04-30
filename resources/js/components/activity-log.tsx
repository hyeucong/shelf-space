import { router, useForm } from '@inertiajs/react';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold, Italic, List, ListOrdered,
    Undo, Redo, PenLine, MoreHorizontal, Trash2
} from 'lucide-react';
import { useState } from 'react';

import { ResourceDeleteDialog } from '@/components/resource-form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const tiptapStyles =
    'text-sm leading-6 [&_p]:m-0 [&_ul]:m-0 [&_ul]:list-outside [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:m-0 [&_ol]:list-outside [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:m-0 [&_li]:pl-1 [&_li]:leading-6 [&_li>p]:m-0 [&_li>p]:inline [&_li>p]:align-baseline [&_li>p]:leading-6';

interface ActivityItem {
    id: number;
    description: string;
    event: string;
    is_note: boolean;
    can_delete: boolean;
    causer_name: string | null;
    created_at: string | null;
    properties?: {
        note?: string;
        [key: string]: any;
    };
}

interface ActivityLogProps {
    activity: ActivityItem[];
    resourceId: string;
    storeUrl: string;
    destroyUrl: (activityId: number) => string;
    emptyMessage?: string;
}

export function ActivityLog({ activity, resourceId, storeUrl, destroyUrl, emptyMessage = 'No recent activity.' }: ActivityLogProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [deletingActivityId, setDeletingActivityId] = useState<number | null>(null);
    const [activityPendingDelete, setActivityPendingDelete] = useState<{ id: number; description: string } | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        note: '',
    });

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                link: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-4 cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder: 'Note supports Markdown. Use / to access commands.',
            }),
        ],
        content: data.note,
        onUpdate: ({ editor }) => {
            setData('note', editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `${tiptapStyles} min-h-[150px] p-4 focus:outline-none`,
            },
        },
    });

    const handleSubmit = () => {
        if (data.note === '<p></p>' || !data.note) {
            return;
        }

        post(storeUrl, {
            onSuccess: () => {
                setIsEditing(false);
                reset('note');
                editor?.commands.setContent('');
            },
            preserveScroll: true,
        });
    };

    const handleDeleteNote = () => {
        if (!activityPendingDelete || deletingActivityId !== null) {
            return;
        }

        const activityId = activityPendingDelete.id;
        setDeletingActivityId(activityId);

        router.delete(destroyUrl(activityId), {
            preserveScroll: true,
            onSuccess: () => setActivityPendingDelete(null),
            onFinish: () => setDeletingActivityId(null),
        });
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="flex-1 overflow-hidden">
            <ResourceDeleteDialog
                open={activityPendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActivityPendingDelete(null);
                    }
                }}
                title="Delete note"
                itemName="this note"
                itemMeta={activityPendingDelete?.description ?? null}
                processing={deletingActivityId !== null}
                onConfirm={handleDeleteNote}
                confirmLabel="Delete note"
                contentClassName="rounded sm:max-w-lg"
            />

            <div className="p-4">
                {!isEditing ? (
                    <div
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-3 border rounded p-4 cursor-text text-muted-foreground hover:bg-accent/50 transition-colors"
                    >
                        <PenLine size={18} />
                        <span className="text-sm">Leave a note</span>
                    </div>
                ) : (
                    <div className="border rounded bg-background overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between border-b p-2 bg-muted/20">
                            <div className="flex items-center gap-0.5 flex-wrap">
                                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={<Undo size={16} />} />
                                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={<Redo size={16} />} />
                                <div className="w-px h-4 bg-border mx-1" />
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    active={editor.isActive('bold')}
                                    icon={<Bold size={16} />}
                                />
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    active={editor.isActive('italic')}
                                    icon={<Italic size={16} />}
                                />
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    active={editor.isActive('bulletList')}
                                    icon={<List size={16} />}
                                />
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                    active={editor.isActive('orderedList')}
                                    icon={<ListOrdered size={16} />}
                                />
                            </div>

                            <div className="flex items-center gap-2 pr-1">
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={processing}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleSubmit} disabled={processing || !data.note || data.note === '<p></p>'}>
                                    {processing ? 'Saving...' : 'Create note'}
                                </Button>
                            </div>
                        </div>
                        <EditorContent editor={editor} />
                    </div>
                )}

                <div className="mt-4 space-y-4">
                    {activity.length === 0 ? (
                        <div className="rounded border bg-background p-3 text-sm text-muted-foreground shadow-sm">
                            {emptyMessage}
                        </div>
                    ) : (
                        activity.map((item) => (
                            <div key={item.id} className="rounded border bg-background flex flex-col text-sm shadow-sm">
                                <div className="flex justify-between gap-3 p-3 items-center">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <Badge variant="outline">
                                            {item.created_at && (
                                                <span className="text-xs text-muted-foreground">{item.created_at}</span>
                                            )}
                                        </Badge>
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="font-bold text-foreground">{item.causer_name ?? 'Someone'}</span>
                                            <span className="text-muted-foreground">{item.description}</span>
                                        </div>
                                    </div>

                                    {item.can_delete ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 text-foreground hover:bg-muted"
                                                    disabled={deletingActivityId === item.id}
                                                    aria-label="Open note actions"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={() => setActivityPendingDelete({
                                                        id: item.id,
                                                        description: item.description,
                                                    })}
                                                    disabled={deletingActivityId === item.id}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete note
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : null}
                                </div>

                                {item.properties?.note && (
                                    <div
                                        className={`${tiptapStyles} text-foreground border-t p-4`}
                                        dangerouslySetInnerHTML={{ __html: item.properties.note }}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({ icon, onClick, active = false }: { icon: React.ReactNode, onClick?: () => void, active?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded hover:bg-muted transition-colors ${active ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'}`}
        >
            {icon}
        </button>
    );
}
