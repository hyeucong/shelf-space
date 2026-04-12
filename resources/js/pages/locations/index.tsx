import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

export default function Locations() {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 p-4">
            <Head title="Locations" />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        No locations yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Track where your assets are stored (e.g. "Main Office", "Warehouse A").
                    </p>
                </div>
            </div>
        </div>
    );
}

Locations.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Locations', href: '/locations' }
        ]}
    />
);
