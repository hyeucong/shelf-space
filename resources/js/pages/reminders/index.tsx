import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ResourceIndexTable } from '@/components/resource-index-table';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { PaginatedData } from '@/types/pagination';

interface Reminder {
    id: number;
    name: string;
    description: string;
    asset?: {
        id: number;
        name: string;
    } | null;
    remind_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface PageProps {
    reminders: PaginatedData<Reminder>;
    filters: {
        search?: string;
        per_page?: string | number;
        sort?: string;
        order?: 'asc' | 'desc';
    };
}

export default function Reminders({ reminders, filters }: PageProps) {
    const [selectedSort, setSelectedSort] = useState('date-created-desc');

    const columns = [
        {
            key: 'name',
            header: 'Name',
            headerClassName: 'pl-4',
            cellClassName: 'pl-4',
            render: (reminder: Reminder) => reminder.name,
        },
        {
            key: 'description',
            header: 'Message',
            render: (reminder: Reminder) => reminder.description,
        },
        {
            key: 'asset',
            header: 'Asset',
            render: (reminder: Reminder) => reminder.asset?.name || '—',
        },
        {
            key: 'remind_at',
            header: 'Alert date',
            render: (reminder: Reminder) => reminder.remind_at ? new Date(reminder.remind_at).toLocaleDateString() : '—',
        },
    ];

    return (
        <>
            <Head title="Reminders" />

            <ResourceIndexTable
                resourcePath="/reminders"
                searchPlaceholder="Search reminders..."
                pagination={reminders}
                filters={filters}
                columns={columns}
                toolbarStart={
                    <Select value={selectedSort} onValueChange={setSelectedSort}>
                        <SelectTrigger className="w-full max-w-48 border bg-transparent dark:bg-transparent">
                            <SelectValue placeholder="Sort reminders" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="ascending">Ascending</SelectItem>
                                <SelectItem value="descending">Descending</SelectItem>
                                <SelectItem value="date-created-desc">Date created</SelectItem>
                                <SelectItem value="date-updated-desc">Date updated</SelectItem>
                                <SelectItem value="alert-time-asc">Alert time</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                }
                emptyState={{
                    title: 'No reminders yet',
                    description: 'Reminders will appear here when assets are due for return or maintenance.',
                }}
            />
        </>
    );
}

Reminders.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Reminders', href: '/reminders' }
        ]}
    />
);
