import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ResourceIndexTable, type ResourceIndexColumn, type ResourceIndexSortOption } from '@/components/resource-index-table';
import type { PaginatedData } from '@/types/pagination';

interface Kit {
    id: number;
    name: string;
    description: string | null;
    status: string;
}

interface PageProps {
    kits: PaginatedData<Kit>;
    filters: {
        search?: string;
        per_page?: string | number;
        sort?: string;
        order?: 'asc' | 'desc';
    };
}

export default function Kits({ kits, filters }: PageProps) {
    const sortOptions: ResourceIndexSortOption[] = [
        { value: 'created_at:desc', label: 'Newest' },
        { value: 'created_at:asc', label: 'Oldest' },
        { value: 'name:asc', label: 'Name (A-Z)' },
        { value: 'name:desc', label: 'Name (Z-A)' },
    ];

    const columns: ResourceIndexColumn<Kit>[] = [
        {
            key: 'name',
            header: 'Name',
            cellClassName: 'font-medium text-foreground',
            render: (kit) => kit.name,
        },
        {
            key: 'description',
            header: 'Description',
            cellClassName: 'max-w-120 whitespace-normal text-muted-foreground',
            render: (kit) => kit.description || '-',
        },
        {
            key: 'status',
            header: 'Status',
            cellClassName: 'capitalize text-muted-foreground',
            render: (kit) => kit.status,
        },
    ];

    return (
        <>
            <Head title="Kits" />

            <ResourceIndexTable
                resourcePath="/kits"
                searchPlaceholder="Search kits..."
                pagination={kits}
                filters={filters}
                columns={columns}
                emptyMessage="No kits found."
                sort={{
                    value: `${filters?.sort || 'created_at'}:${filters?.order || 'desc'}`,
                    options: sortOptions,
                }}
            />
        </>
    );
}

Kits.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Kits', href: '/kits' }
        ]}
        headerAction={
            <Button className="rounded border-none" asChild>
                <Link href="/kits/create">
                    New kit
                </Link>
            </Button>
        }
    />
);
