import type { FormEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Ellipsis, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssetLayout, { type AssetPageProps } from '@/layouts/asset-layout';
import { ResourceIndexTable } from '@/components/resource-index-table';
import { ResourceFormDialog, ResourceDeleteDialog } from '@/components/resource-form-dialog';
import type { PaginatedData } from '@/types/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ReminderRecord {
    id: number;
    name: string;
    description: string;
    remind_at: string;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface ReminderFormValues {
    name: string;
    description: string;
    remind_at: string;
}

const initialValues: ReminderFormValues = {
    name: '',
    description: '',
    remind_at: '',
};

export default function AssetReminders() {
    const { asset, reminders } = usePage<AssetPageProps & { reminders?: PaginatedData<ReminderRecord> }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<ReminderRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm(initialValues);
    const selectedReminderDate = data.remind_at ? new Date(data.remind_at) : undefined;

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState('10:30:00');

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

    useEffect(() => {
        if (isCreateOpen) {
            return;
        }

        reset();
        clearErrors();
    }, [clearErrors, isCreateOpen, reset]);

    useEffect(() => {
        const openDialog = () => setIsCreateOpen(true);

        window.addEventListener('asset-reminders:create', openDialog);

        return () => {
            window.removeEventListener('asset-reminders:create', openDialog);
        };
    }, []);

    const submitReminder = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(`/assets/${asset.id}/reminders`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
            },
        });
    };

    const handleDelete = () => {
        if (!reminderToDelete || isDeleting) {
            return;
        }

        router.delete(`/assets/${asset.id}/reminders/${reminderToDelete.id}`, {
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
            render: (r: ReminderRecord) => r.name,
        },
        {
            key: 'description',
            header: 'Message',
            render: (r: ReminderRecord) => r.description,
        },
        {
            key: 'remind_at',
            header: 'Date',
            cellClassName: 'whitespace-nowrap',
            render: (r: ReminderRecord) => new Date(r.remind_at).toLocaleDateString(),
        },
        {
            key: 'status',
            header: 'Status',
            render: (r: ReminderRecord) => (
                <Badge variant="outline" className="capitalize">{r.status || 'pending'}</Badge>
            ),
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

            <ResourceFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSubmit={submitReminder}
                title="New reminder"
                description="Add a reminder for this asset."
                processing={processing}
                submitLabel="Save"
                submitPendingLabel="Saving..."
                contentClassName="sm:max-w-2xl rounded"
            >
                <div className="grid gap-2">
                    <Label htmlFor="reminder_name">Name <span className="text-red-500">*</span></Label>
                    <Input
                        id="reminder_name"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        className="rounded"
                        placeholder="e.g. Renew warranty"
                    />
                    {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="reminder_description">Message <span className="text-red-500">*</span></Label>
                    <textarea
                        id="reminder_description"
                        value={data.description}
                        onChange={(event) => setData('description', event.target.value)}
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-28 rounded border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        placeholder="What should happen on this date?"
                    />
                    {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                </div>

                <div className="grid gap-2">
                    <Label>Date & Time <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="reminder_date"
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start rounded text-left font-normal',
                                        !selectedReminderDate && 'text-muted-foreground',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedReminderDate ? format(selectedReminderDate, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedReminderDate}
                                    captionLayout="dropdown"
                                    defaultMonth={selectedReminderDate}
                                    classNames={{ outside: 'text-muted-foreground opacity-60' }}
                                    onSelect={(date) => {
                                        if (date) {
                                            // Combines date and time into the state
                                            setData('remind_at', `${format(date, 'yyyy-MM-dd')}T${selectedTime}`);
                                        } else {
                                            setData('remind_at', '');
                                        }
                                        setIsCalendarOpen(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        <Input
                            type="time"
                            id="reminder_time"
                            step="1"
                            value={selectedTime}
                            onChange={(e) => {
                                const newTime = e.target.value;
                                setSelectedTime(newTime);
                                if (selectedReminderDate) {
                                    setData('remind_at', `${format(selectedReminderDate, 'yyyy-MM-dd')}T${newTime}`);
                                }
                            }}
                            className="w-34 rounded border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                    </div>
                    {errors.remind_at && <span className="text-sm text-red-500">{errors.remind_at}</span>}
                </div>
            </ResourceFormDialog>

            <ResourceIndexTable
                resourcePath="/reminders"
                searchPlaceholder=""
                pagination={pagination}
                showSearch={false}
                filters={{}}
                columns={columns}
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
                emptyState={{ title: 'No reminders found', description: 'There are no reminders for this asset.' }}
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

AssetReminders.layout = (page: ReactNode) => (
    <AssetLayout
        activeTab="reminders"
        headerAction={
            <Button variant="outline" className="rounded" onClick={() => window.dispatchEvent(new Event('asset-reminders:create'))}>
                New reminder
            </Button>
        }
        children={page}
    />
);
