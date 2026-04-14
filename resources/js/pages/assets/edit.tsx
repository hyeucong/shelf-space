import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Asset {
    id: number;
    asset_id: string;
    name: string;
    description: string | null;
    value: number | string | null;
    status: string;
}

export default function Edit({ asset }: { asset: Asset }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: asset.name || '',
        asset_id: asset.asset_id || '',
        description: asset.description || '',
        value: asset.value || '',
    });

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        patch(`/assets/${asset.id}`);
    };

    return (
        <div className="w-full">
            <Head title={`Edit ${asset.name}`} />

            <div className="w-full border-b px-6 py-4 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    {data.name || 'Untitled Asset'}
                </h1>
            </div>

            <form onSubmit={submit} className="px-6 space-y-6 max-w-4xl pb-10">
                <Card className="rounded border shadow-none">
                    <div className="flex items-center justify-between pr-6 border-b border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Basic fields</CardTitle>
                            <CardDescription>
                                Update the information for this asset.
                            </CardDescription>
                        </CardHeader>

                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-px">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-l rounded-r-none border-r-0"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button type="button" variant="outline" className="rounded-l-none rounded-r">
                                    Add another
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className={`rounded px-6 bg-[#f0642d] hover:bg-[#d95627] text-white border-none`}
                            >
                                Save changes
                            </Button>
                        </div>
                    </div>

                    <CardContent className="space-y-6 pt-6">
                        {/* Name Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="rounded"
                                placeholder="e.g. MacBook Pro"
                            />
                            {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                        </div>

                        {/* Asset ID Group */}
                        <div className="grid gap-2">
                            <Label htmlFor="asset_id">Asset ID</Label>
                            <div className="flex -space-x-px">
                                <div className="flex items-center rounded-l border border-input bg-muted px-3 text-sm text-muted-foreground">
                                    SAM
                                </div>
                                <Input
                                    id="asset_id"
                                    value={data.asset_id}
                                    onChange={e => setData('asset_id', e.target.value)}
                                    className="rounded-l-none rounded-r focus-visible:z-10"
                                    placeholder="0002"
                                />
                            </div>
                            {errors.asset_id && <span className="text-sm text-red-500">{errors.asset_id}</span>}
                            <p className="text-xs text-muted-foreground">
                                This sequential ID will be assigned when the asset is created.
                            </p>
                        </div>

                        {/* Value Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="value">Value</Label>
                            <div className="flex -space-x-px">
                                <div className="flex items-center rounded-l border border-input bg-muted px-3 text-sm text-muted-foreground">
                                    USD
                                </div>
                                <Input
                                    id="value"
                                    value={data.value}
                                    onChange={e => setData('value', e.target.value)}
                                    className="rounded-l-none rounded-r focus-visible:z-10"
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.value && <span className="text-sm text-red-500">{errors.value}</span>}
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
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Assets', href: '/assets' },
            { title: 'Edit asset', href: '' }
        ]}
    />
);
