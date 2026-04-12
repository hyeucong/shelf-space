import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import AssetForm from '@/components/asset-form';

interface Asset {
    id: number;
    asset_id: string;
    name: string;
    description: string | null;
    value: number | string | null;
    status: string;
}

export default function Edit({ asset }: { asset: Asset }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: asset.name || '',
        asset_id: asset.asset_id || '',
        description: asset.description || '',
        value: asset.value || '',
    });

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        patch(`/assets/${asset.id}`);
    };

    return (
        <div className="w-full">
            <Head title={`Edit ${asset.name}`} />

            <div className="w-full border-b px-6 py-4 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    {data.name || 'Untitled Asset'}
                </h1>
            </div>

            <AssetForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                submit={submit}
                isEditing={true}
            />
        </div>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Assets', href: '/assets' },
            { title: 'Edit asset', href: '' }
        ]}
    />
);
