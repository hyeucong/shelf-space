import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Package2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { ResourceIndexColumn } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
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
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const localKits = useMemo(() => kits?.data || [], [kits]);
    const activeSelectedIds = useMemo(
        () => selectedIds.filter((id) => localKits.some((kit) => kit.id === id)),
        [localKits, selectedIds],
    );


    const toggleOne = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) {
                return Array.from(new Set([...prev, id]));
            }

            return prev.filter((currentId) => currentId !== id);
        });
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(localKits.map((kit) => kit.id));

            return;
        }

        setSelectedIds([]);
    };

    const columns: ResourceIndexColumn<Kit>[] = [
        {
            key: 'name',
            header: 'Name',
            headerClassName: 'min-w-56',
            cellClassName: 'min-w-56 font-medium text-foreground',
            render: (kit) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted/10">
                        <Package2 className="text-muted-foreground" size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="block line-clamp-2">{kit.name}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden max-w-120 whitespace-normal text-muted-foreground lg:table-cell',
            render: (kit) => kit.description || '-',
        },
        {
            key: 'status',
            header: 'Status',
            headerClassName: 'hidden sm:table-cell',
            cellClassName: 'hidden whitespace-nowrap capitalize text-muted-foreground sm:table-cell',
            render: (kit) => kit.status,
        },
    ];

    return (
        <>
            <Head title="Kits" />

            <ResourceIndexTable
                resourcePath="/kits"
                searchPlaceholder="Search kits..."
                pagination={{ ...kits, data: localKits }}
                filters={filters}
                columns={columns}
                selection={{
                    selectedIds: activeSelectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (kit, checked) => toggleOne(kit.id, checked),
                    getLabel: (kit) => `Select ${kit.name}`,
                }}
                emptyState={{
                    title: 'No kits yet',
                    description: 'Kits help you group multiple assets together for easier assignment.',
                }}
            // Sorting removed for Kits index
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
                <Link href="/kits/create">New kit</Link>
            </Button>
        }

    />
);
