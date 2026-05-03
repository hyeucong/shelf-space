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
import { Ellipsis, Trash2 } from 'lucide-react';
import { ResourceDeleteDialog } from '@/components/resource-form-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
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
    const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!reminderToDelete || isDeleting) {
            return;
        }

        router.delete(`/reminders/${reminderToDelete.id}`, {
            preserveScroll: true,
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setReminderToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

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
                rowActions={{
                    render: (reminder) => (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Open actions for ${reminder.name}`}
                                    className="h-8 w-8 rounded"
                                >
                                    <Ellipsis className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={() => setReminderToDelete(reminder)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ),
                }}
            />

            <ResourceDeleteDialog
                open={!!reminderToDelete}
                onOpenChange={(open) => !open && setReminderToDelete(null)}
                title="Delete Reminder"
                itemName={reminderToDelete?.name}
                processing={isDeleting}
                onConfirm={handleDelete}
                confirmLabel="Delete reminder"
                confirmPendingLabel="Deleting..."
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
