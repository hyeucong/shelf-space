import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

export default function Index({ title }: { title: string }) {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 p-4">
            <Head title={title} />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        No {title.toLowerCase()} yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        This section is currently being scaffolded.
                    </p>
                </div>
            </div>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Placeholder', href: '' }
        ]}
    />
);
