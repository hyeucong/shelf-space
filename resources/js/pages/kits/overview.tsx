import type { ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import KitLayout, { type KitPageProps } from '@/layouts/kit-layout';

export default function KitOverview() {
    const { kit } = usePage<KitPageProps>().props;

    return (
        <>
            <Head title={`${kit?.name || 'Kit'} - Overview`} />
            <div className="p-4">
                <div className="rounded border bg-background">
                    <dl className="divide-y">
                        <div className="flex items-center justify-between px-6 py-4">
                            <dt className="text-sm text-muted-foreground">ID</dt>
                            <dd className="ml-4 text-sm text-foreground wrap-break-word">{kit?.id ?? '-'}</dd>
                        </div>

                        <div className="flex items-center justify-between px-6 py-4">
                            <dt className="text-sm text-muted-foreground">Status</dt>
                            <dd className="ml-4 text-sm text-foreground">{kit?.status ?? '-'}</dd>
                        </div>

                        <div className="flex items-center justify-between px-6 py-4">
                            <dt className="text-sm text-muted-foreground">Description</dt>
                            <dd className="ml-4 text-sm text-foreground">{kit?.description || '-'}</dd>
                        </div>

                        <div className="flex items-center justify-between px-6 py-4">
                            <dt className="text-sm text-muted-foreground">Created</dt>
                            <dd className="ml-4 text-sm text-foreground">{kit?.created_at ? new Date(kit.created_at).toLocaleString() : '-'}</dd>
                        </div>

                        <div className="flex items-center justify-between px-6 py-4">
                            <dt className="text-sm text-muted-foreground">Updated</dt>
                            <dd className="ml-4 text-sm text-foreground">{kit?.updated_at ? new Date(kit.updated_at).toLocaleString() : '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </>
    );
}

KitOverview.layout = (page: ReactNode) => (
    <KitLayout activeTab="overview" children={page} />
);
