import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        event: '',
        description: '',
    });

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        post('/audits');
    };

    return (
        <div className="w-full">
            <Head title="New audit" />

            <div className="w-full border-b px-6 py-4 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    {data.event || 'Untitled Audit'}
                </h1>
            </div>

            <form onSubmit={submit} className="px-6 space-y-6 max-w-4xl pb-10">
                <Card className="rounded border shadow-none">
                    <div className="flex items-center justify-between pr-6 border-b border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Basic fields</CardTitle>
                            <CardDescription>
                                Create a manual audit log entry.
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
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className={`rounded bg-[#f0642d] hover:bg-[#d95627] text-white border-none`}
                            >
                                Save
                            </Button>
                        </div>
                    </div>

                    <CardContent className="space-y-6 pt-6">
                        {/* Event Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="event">Event <span className="text-red-500">*</span></Label>
                            <Input
                                id="event"
                                value={data.event}
                                onChange={e => setData('event', e.target.value)}
                                className="rounded"
                                placeholder="e.g. Asset Relocation"
                            />
                            {errors.event && <span className="text-sm text-red-500">{errors.event}</span>}
                        </div>

                        {/* Description Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="rounded"
                                placeholder="Details about this audit event"
                            />
                            {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Audits', href: '/audits' },
            { title: 'New Audit', href: '' }
        ]}
    />
);
