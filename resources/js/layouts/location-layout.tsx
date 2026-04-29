import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface LocationResource {
    id: number;
    name: string;
    description?: string | null;
    address?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    created_at?: string | null;
    updated_at?: string | null;
    parent?: { id: number; name: string } | null;
    assets_count?: number;
    children_count?: number;
}

export interface LocationPageProps {
    location: LocationResource;
    [key: string]: unknown;
}

type LocationLayoutProps = {
    children: ReactNode;
    activeTab: 'overview' | 'assets' | 'kits' | 'activity';
    headerAction?: ReactNode;
};

export default function LocationLayout({ children, activeTab, headerAction }: LocationLayoutProps) {
    const { location } = usePage<LocationPageProps>().props;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Locations', href: '/locations' },
                { title: location?.name || 'Location', href: '#' },
            ]}
            headerAction={headerAction}
            children={
                <div className="flex flex-1 flex-col">
                    <div className="flex items-start p-4">
                        <div className="shrink-0">
                            <div className="flex h-13 w-13 items-center justify-center overflow-hidden rounded border bg-background">
                                <MapPin className="text-muted-foreground" size={32} />
                            </div>
                        </div>

                        <div className="ml-4 flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold">{location?.name || 'Location'}</h1>
                                <p className="text-sm text-muted-foreground">{location?.parent?.name ? `Parent: ${location.parent.name}` : 'Top-level location'}</p>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} className="border-y px-4">
                        <TabsList variant="line">
                            <TabsTrigger value="overview" asChild>
                                <Link href={`/locations/${location.id}/overview`} preserveState className="block">
                                    Overview
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="assets" asChild>
                                <Link href={`/locations/${location.id}/assets`} preserveState className="block">
                                    Assets
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="kits" asChild>
                                <Link href={`/locations/${location.id}/kits`} preserveState className="block">
                                    Kits
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="activity" asChild>
                                <Link href={`/locations/${location.id}/activity`} preserveState className="block">
                                    Activity
                                </Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex flex-1 flex-col lg:flex-row">
                        <div className="flex-1 overflow-hidden">
                            {children}
                        </div>
                        {location?.latitude && location?.longitude && (
                            <aside className="w-full lg:w-96 bg-card">
                                <div className="sticky top-0 p-4 pl-0 space-y-4">
                                    {location.address && (
                                        <div className="p-4 rounded border bg-muted/20 flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-muted-foreground uppercase">Address</h4>
                                            <p className="text-sm">{location.address}</p>
                                        </div>
                                    )}
                                    <div className="overflow-hidden rounded border bg-background">
                                        <div className="border-b px-4 py-2 bg-muted/50">
                                            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location Map</h3>
                                        </div>
                                        <iframe
                                            width="100%"
                                            height="400"
                                            style={{ border: 0, overflow: 'hidden' }}
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.longitude) - 0.005},${Number(location.latitude) - 0.005},${Number(location.longitude) + 0.005},${Number(location.latitude) + 0.005}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                                            className="grayscale-[0.1] contrast-[0.95]"
                                        />
                                        <div className="px-4 py-2 border-t text-right bg-muted/30">
                                            <a
                                                href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline font-medium"
                                            >
                                                View on OpenStreetMap
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            }
        />
    );
}
