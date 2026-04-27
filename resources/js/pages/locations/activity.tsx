import { useState, type ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import LocationLayout, { type LocationPageProps } from '@/layouts/location-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
    Bold, Italic, Link as LinkIcon, List, ListOrdered,
    Quote, Minus, Undo, Redo, Type, PenLine
} from 'lucide-react';

export default function LocationActivity() {
    const [isEditing, setIsEditing] = useState(false);
    const { location } = usePage<LocationPageProps>().props;

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({
                placeholder: 'note supports Markdown and Markdoc. Use / to access commands.',
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4',
            },
        },
    })

    if (!editor) return null;

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Activity`} />

            <div className="p-4 max-w-3xl">
                {/* 1. The "Leave a Note" Trigger (image_0a07ba.png) */}
                {!isEditing ? (
                    <div
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-3 border rounded p-3 cursor-text text-muted-foreground hover:bg-accent/50 transition-colors"
                    >
                        <PenLine size={18} />
                        <span className="text-sm">Leave a note</span>
                    </div>
                ) : (
                    /* 2. The Full Editor (image_0bc5d9.png) */
                    <div className="border rounded bg-background overflow-hidden shadow-sm">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between border-b p-2 bg-muted/20">
                            <div className="flex items-center gap-0.5 flex-wrap">
                                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={<Undo size={16} />} />
                                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={<Redo size={16} />} />
                                <div className="w-px h-4 bg-border mx-1" />
                                <ToolbarButton icon={<Type size={16} />} /> {/* Paragraph dropdown placeholder */}
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
                                <ToolbarButton icon={<LinkIcon size={16} />} />
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
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                    active={editor.isActive('blockquote')}
                                    icon={<Quote size={16} />}
                                />
                                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<Minus size={16} />} />
                            </div>

                            <div className="flex items-center gap-2 pr-1">
                                <Button className='border rounded' variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button className='border rounded' size="sm" >Create note</Button>
                            </div>
                        </div>

                        {/* Editor Surface */}
                        <EditorContent editor={editor} />
                    </div>
                )}

                {/* 3. The Activity Feed below */}
                {/* <div className="mt-4 space-y-4">
                    {activity.length === 0 ? (
                        <div className="rounded border bg-background p-3 text-sm text-muted-foreground shadow-sm">
                            No recent activity for this asset.
                        </div>
                    ) : (
                        activity.map((item: any) => (
                            <div key={item.id} className="rounded border bg-background p-3 flex items-center gap-3 text-sm shadow-sm">
                                <Badge variant="outline" className="font-normal flex items-center justify-center">
                                    {item.created_at && (
                                        <span className="text-xs text-muted-foreground">{item.created_at}</span>
                                    )}
                                </Badge>
                                <div className="flex-1 text-left">
                                    <p className="leading-tight">
                                        <span className="font-bold">{item.causer_name ?? 'Someone'}</span>
                                        {' ' + item.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div> */}
            </div >
        </>
    );
}

// Small helper for toolbar buttons
function ToolbarButton({ icon, onClick, active = false }: { icon: React.ReactNode, onClick?: () => void, active?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded hover:bg-muted transition-colors ${active ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
            {icon}
        </button>
    );
}

LocationActivity.layout = (page: ReactNode) => (
    <LocationLayout activeTab="activity" children={page} />
);
