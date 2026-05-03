import { isValidElement, type ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import KitLayout, { type KitPageProps } from '@/layouts/kit-layout';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { PaginatedData } from '@/types/pagination';
import { addAssets } from '@/routes/kits';

import { createAssetTableColumns } from '@/pages/assets/column-config';
import type { AssetRecord } from '@/pages/assets/column-config';

export default function KitAssets() {
    const { kit, assets, filters } = usePage<KitPageProps & { assets?: PaginatedData<AssetRecord>, filters: any }>().props;

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
    }).filter(col => col.key !== 'actions');

    return (
        <>
            <Head title={`${kit?.name || 'Kit'} - Assets`} />

            <ResourceIndexTable
                resourcePath={kit ? `/kits/${kit.id}/assets` : '/kits/assets'}
                searchPlaceholder="Search assets..."
                pagination={pagination}
                showSearch={true}
                filters={filters ?? {}}
                columns={columns}
                addPaddingLeft={true}
                emptyState={{ title: 'No assets in this kit', description: 'There are no assets assigned to this kit.' }}
            />
        </>
    );
}

KitAssets.layout = (page: ReactNode) => {
    const kit = isValidElement<KitPageProps>(page) ? page.props.kit : null;

    return (
        <KitLayout
            activeTab="assets"
            headerAction={
                <Button className="rounded bg-white text-black hover:bg-zinc-200 border border-border" asChild>
                    <Link href={kit ? addAssets((kit.id)) : '/kits'}>
                        Add asset
                    </Link>
                </Button>
            }
            children={page}
        />
    );
};
