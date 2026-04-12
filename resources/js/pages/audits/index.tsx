import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

export default function Audit() {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 p-4">
            <Head title="Audit" />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Audit</h1>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        No audits yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Keep track of changes and verify your inventory.
                    </p>
                </div>
            </div>
        </div>
    );
}

Audit.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Audit', href: '/audits' }
        ]}
    />
);
