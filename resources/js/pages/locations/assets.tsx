import { Head, Link, usePage } from '@inertiajs/react';
import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { ResourceIndexTable } from '@/components/resource-index-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LocationLayout from '@/layouts/location-layout';
import type { LocationPageProps } from '@/layouts/location-layout';
import { addAssets } from '@/routes/locations';
import type { PaginatedData } from '@/types/pagination';

interface AssetRecord {
    id: string;
    name: string;
    asset_id?: string | null;
    description?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export default function LocationAssets() {
    const { location, assets } = usePage<LocationPageProps & { assets?: PaginatedData<AssetRecord> }>().props;

    const pagination: PaginatedData<AssetRecord> = assets ?? {
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
            header: 'Asset',
            render: (a: AssetRecord) => (
                <Link href={`/assets/${a.id}/overview`} className="block line-clamp-1">
                    {a.name}
                </Link>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (a: AssetRecord) => (
                <Badge variant="outline" className="capitalize">{a.status || 'unknown'}</Badge>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (a: AssetRecord) => a.description || '—',
        },
        {
            key: 'updated_at',
            header: 'Last updated',
            headerClassName: 'hidden sm:table-cell',
            cellClassName: 'hidden sm:table-cell text-muted-foreground whitespace-nowrap',
            render: (a: AssetRecord) => (a.updated_at ?? a.created_at) ? new Date((a.updated_at ?? a.created_at) as string).toLocaleDateString() : '—',
        },
    ];

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Assets`} />

            <ResourceIndexTable
                resourcePath={location ? `/locations/${location.id}/assets` : '/locations/assets'}
                searchPlaceholder="Search assets..."
                pagination={pagination}
                showSearch={true}
                filters={{}}
                columns={columns}
                emptyState={{ title: 'No assets in this location', description: 'There are no assets assigned to this location.' }}
            />
        </>
    );
}

LocationAssets.layout = (page: ReactNode) => {
    const location = isValidElement<LocationPageProps>(page) ? page.props.location : null;

    return (
        <LocationLayout
            activeTab="assets"
            headerAction={
                <Button asChild>
                    <Link href={location ? addAssets(location.id).url : '#'}>
                        Add asset
                    </Link>
                </Button>
            }
            children={page}
        />
    );
};
