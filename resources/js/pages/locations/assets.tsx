import { Head, Link, usePage } from '@inertiajs/react';
import { isValidElement, type ReactNode } from 'react';
import { ResourceIndexTable } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import LocationLayout, { type LocationPageProps } from '@/layouts/location-layout';
import { addAssets } from '@/routes/locations';
import type { PaginatedData } from '@/types/pagination';

import { createAssetTableColumns } from '@/pages/assets/column-config';
import type { AssetRecord } from '@/pages/assets/column-config';

export default function LocationAssets() {
    const { location, assets, filters } = usePage<LocationPageProps & { assets?: PaginatedData<AssetRecord>, filters: any }>().props;

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

    const columns = createAssetTableColumns({
        onDelete: () => { },
        onDuplicate: () => { },
    }).filter(col => col.key !== 'actions' && col.key !== 'location');

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Assets`} />

            <ResourceIndexTable
                resourcePath={location ? `/locations/${location.id}/assets` : '/locations/assets'}
                searchPlaceholder="Search assets..."
                pagination={pagination}
                showSearch={true}
                filters={filters ?? {}}
                columns={columns}
                addPaddingLeft={true}
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
                <Button variant="outline" className="rounded" asChild>
                    <Link href={location ? addAssets(location.id).url : '#'}>
                        Add asset
                    </Link>
                </Button>
            }
            children={page}
        />
    );
};
