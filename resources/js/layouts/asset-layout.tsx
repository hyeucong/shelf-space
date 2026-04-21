import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface AssetResource {
    id: number;
    name: string;
    asset_id: string;
    status: string;
    value: number | null;
    description?: string | null;
    category?: { id: number; name: string } | null;
    location?: { id: number; name: string } | null;
    tags?: Array<{ id: number; name: string }>;
    created_at?: string | null;
    updated_at?: string | null;
    shelf_qr_id?: string | null;
    qr_id?: string | null;
    shelf_qr?: string | null;
}

export interface AssetPageProps {
    asset: AssetResource;
    [key: string]: unknown;
}

type AssetLayoutProps = {
    children: ReactNode;
    activeTab: 'overview' | 'activity' | 'reminders';
};

export default function AssetLayout({ children, activeTab }: AssetLayoutProps) {
    const { asset } = usePage<AssetPageProps>().props;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Assets', href: '/assets' },
                { title: asset?.name || 'Asset', href: '#' },
            ]}
            children={
                <>
                    <div className="flex items-start p-4">
                        <div className="shrink-0">
                            <div className="flex h-13 w-13 items-center justify-center overflow-hidden rounded border bg-background">
                                <Camera className="text-muted-foreground" size={32} />
                            </div>
                        </div>

                        <div className="ml-4 flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold">{asset?.name || 'Asset'}</h1>
                                <p className="text-sm text-muted-foreground">{asset?.asset_id || ''}</p>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} className="border-y px-4">
                        <TabsList variant="line">
                            <TabsTrigger value="overview" asChild>
                                <Link href={`/assets/${asset.id}/overview`} preserveState className="block">
                                    Overview
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="activity" asChild>
                                <Link href={`/assets/${asset.id}/activity`} preserveState className="block">
                                    Activity
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="reminders" asChild>
                                <Link href={`/assets/${asset.id}/reminders`} preserveState className="block">
                                    Reminders
                                </Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {children}
                </>
            }
        />
    );
}
