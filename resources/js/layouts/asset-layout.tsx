import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Camera, Download, Printer } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LocationMap from '@/components/location-map';

export interface AssetResource {
    id: string;
    name: string;
    asset_id: string;
    status: string;
    value: number | null;
    description?: string | null;
    category?: { id: number; name: string } | null;
    location?: { id: string; name: string; latitude?: string | number | null; longitude?: string | number | null } | null;
    tags?: Array<{ id: number; name: string }>;
    created_at?: string | null;
    updated_at?: string | null;
    qr_code_svg?: string | null;
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
    headerAction?: ReactNode;
};

export default function AssetLayout({ children, activeTab, headerAction }: AssetLayoutProps) {
    const { asset } = usePage<AssetPageProps>().props;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Assets', href: '/assets' },
                { title: asset?.name || 'Asset', href: '#' },
            ]}
            headerAction={headerAction}
            children={
                <div className="flex flex-1 flex-col">
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

                    <div className="flex flex-1 flex-col lg:flex-row lg:gap-0">
                        <div className="flex-1 overflow-hidden">
                            {children}
                        </div>
                        <aside className="w-full lg:w-96 bg-card">
                            <div className="sticky top-0 p-4 lg:pl-0 space-y-4">
                                <div className="overflow-hidden rounded border bg-background">
                                    <div className="border-b px-4 py-2 bg-muted/50">
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Asset QR Code</h3>
                                    </div>
                                    <div className="p-8 flex flex-col items-center justify-center space-y-6">
                                        <div className="w-full max-w-[280px] overflow-hidden aspect-square border-8 rounded p-6 flex flex-col items-center justify-between bg-white">
                                            <div
                                                className="w-full flex-1 rounded flex items-center justify-center p-14 min-h-0 [&>svg]:max-w-full [&>svg]:h-auto"
                                                dangerouslySetInnerHTML={{ __html: asset.qr_code_svg || '' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full border-t p-4">
                                        <Button variant="outline" size="sm" className="w-full gap-2">
                                            <Download size={14} />
                                            Download
                                        </Button>
                                        <Button variant="outline" size="sm" className="w-full gap-2">
                                            <Printer size={14} />
                                            Print
                                        </Button>
                                    </div>
                                </div>

                                {asset.location?.latitude && asset.location?.longitude && (
                                    <LocationMap location={asset.location} />
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            }
        />
    );
}

