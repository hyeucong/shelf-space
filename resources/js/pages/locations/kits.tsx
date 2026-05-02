import { Head, Link, usePage } from '@inertiajs/react';
import { Package2 } from 'lucide-react';
import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { ResourceIndexTable } from '@/components/resource-index-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LocationLayout from '@/layouts/location-layout';
import type { LocationPageProps } from '@/layouts/location-layout';
import { addKits, kits as locationKits } from '@/routes/locations';
import type { PaginatedData } from '@/types/pagination';

interface KitRecord {
    id: string;
    name: string;
    description?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export default function LocationKits() {
    const { location, kits, filters } = usePage<LocationPageProps & {
        kits: PaginatedData<KitRecord>;
        filters: {
            search?: string;
            per_page?: number | string;
            sort?: string;
            order?: 'asc' | 'desc';
        };
    }>().props;

    const columns = [
        {
            key: 'name',
            header: 'Kit',
            headerClassName: 'min-w-56 pl-4',
            cellClassName: 'min-w-56 pl-4 font-medium text-foreground',
            render: (kit: KitRecord) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted/10">
                        <Package2 className="text-muted-foreground" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <Link href={`/kits/${kit.id}/assets`} className="block truncate transition-colors hover:text-primary">
                            {kit.name}
                        </Link>
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden text-muted-foreground lg:table-cell',
            render: (kit: KitRecord) => kit.description || '—',
        },
        {
            key: 'status',
            header: 'Status',
            headerClassName: 'hidden sm:table-cell',
            cellClassName: 'hidden sm:table-cell',
            render: (kit: KitRecord) => (
                <Badge variant="outline" className="capitalize">{kit.status || 'unknown'}</Badge>
            ),
        },
        {
            key: 'updated_at',
            header: 'Last updated',
            headerClassName: 'hidden sm:table-cell',
            cellClassName: 'hidden sm:table-cell text-muted-foreground',
            render: (kit: KitRecord) => (kit.updated_at ?? kit.created_at) ? new Date((kit.updated_at ?? kit.created_at) as string).toLocaleDateString() : '—',
        },
    ];

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Kits`} />

            <ResourceIndexTable
                resourcePath={location ? locationKits(location.id).url : '/locations'}
                searchPlaceholder="Search kits..."
                pagination={kits}
                filters={filters}
                columns={columns}
                emptyState={{ title: 'No kits available', description: 'No kits match the current search criteria.' }}
            />
        </>
    );
}
LocationKits.layout = (page: ReactNode) => {
    const location = isValidElement<LocationPageProps>(page) ? page.props.location : null;

    return (
        <LocationLayout
            activeTab="kits"
            headerAction={
                <Button asChild>
                    <Link href={location ? addKits(location.id).url : '/locations'}>
                        Add kit
                    </Link>
                </Button>
            }
            children={page}
        />
    );
};
