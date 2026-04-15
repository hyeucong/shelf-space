import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        hex_color: '#ab339f',
    });

    const [open, setOpen] = useState(true);

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        post('/categories');
    };

    return (
        <>
            <Head title="New category" />

            <Dialog open={open} onOpenChange={(o) => { if (!o) window.history.back(); setOpen(o); }}>
                <DialogContent className="sm:max-w-180 rounded-lg">
                    <DialogHeader>
                        <DialogTitle>{data.name || 'New category'}</DialogTitle>
                        <DialogDescription>Basic information about your category.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="px-0 space-y-6">
                        <Card className="rounded border shadow-none">
                            <CardContent className="space-y-6 pt-2">
                                {/* Name Input */}
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="rounded"
                                        placeholder="e.g. Electronics"
                                    />
                                    {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                                </div>

                                {/* Description Input */}
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="rounded"
                                        placeholder="Add a short description"
                                    />
                                    {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                                </div>

                                {/* Hex Color Input (plain text) */}
                                <div className="grid gap-2">
                                    <Label htmlFor="hex_color">Hex Color</Label>
                                    <Input
                                        id="hex_color"
                                        type="text"
                                        value={data.hex_color}
                                        onChange={e => setData('hex_color', e.target.value)}
                                        className="rounded"
                                        placeholder="#ab339f"
                                    />
                                    {errors.hex_color && <span className="text-sm text-red-500">{errors.hex_color}</span>}
                                </div>
                            </CardContent>

                            <DialogFooter>
                                <div className="flex items-center gap-2 w-full justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className={`rounded bg-[#f0642d] hover:bg-[#d95627] text-white border-none`}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </DialogFooter>
                        </Card>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Categories', href: '/categories' },
            { title: 'New Category', href: '' }
        ]}
    />
);
