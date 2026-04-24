import type { ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AssetLayout, { type AssetPageProps } from '@/layouts/asset-layout';
import { create as createReminder } from '@/routes/reminders';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { PaginatedData } from '@/types/pagination';
import { Badge } from '@/components/ui/badge';

interface ReminderRecord {
    id: number;
    name: string;
    description?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export default function AssetReminders() {
    const { asset, reminders } = usePage<AssetPageProps & { reminders?: PaginatedData<ReminderRecord> }>().props;

    const pagination: PaginatedData<ReminderRecord> = reminders ?? {
        data: [],
        links: [],
        current_page: 1,
        last_page: 1,
        per_page: 20,
        first_page_url: '',
        last_page_url: '',
        from: 0,
        to: 0,
        total: 0,
    };

    const columns = [
        {
            key: 'name',
            header: 'Reminder',
            render: (r: ReminderRecord) => r.name,
        },
        {
            key: 'status',
            header: 'Status',
            render: (r: ReminderRecord) => (
                <Badge variant="outline" className="capitalize">{r.status || 'pending'}</Badge>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (r: ReminderRecord) => r.description || '—',
        },
        {
            key: 'updated_at',
            header: 'Last updated',
            headerClassName: 'hidden sm:table-cell',
            cellClassName: 'hidden sm:table-cell text-muted-foreground whitespace-nowrap',
            render: (r: ReminderRecord) => (r.updated_at ?? r.created_at) ? new Date((r.updated_at ?? r.created_at) as string).toLocaleDateString() : '—',
        },
    ];

    return (
        <>
            <Head title={`${asset?.name || 'Asset'} - Reminders`} />

            <ResourceIndexTable
                resourcePath="/reminders"
                searchPlaceholder=""
                pagination={pagination}
                showSearch={false}
                filters={{}}
                columns={columns}
                emptyState={{ title: 'No reminders found', description: 'There are no reminders for this asset.' }}
            />
        </>
    );
}

AssetReminders.layout = (page: ReactNode) => (
    <AssetLayout
        activeTab="reminders"
        headerAction={
            <Button asChild>
                <Link href={createReminder().url}>
                    New reminder
                </Link>
            </Button>
        }
        children={page}
    />
);
