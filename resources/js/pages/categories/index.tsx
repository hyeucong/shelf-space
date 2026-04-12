import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

export default function Categories() {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 p-4">
            <Head title="Categories" />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        No categories yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Organize your assets into categories like Electronics, Furniture, etc.
                    </p>
                </div>
            </div>
        </div>
    );
}

Categories.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Categories', href: '/categories' }
        ]}
    />
);
