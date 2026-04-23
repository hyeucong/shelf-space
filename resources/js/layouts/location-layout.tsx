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
};

export default function LocationLayout({ children, activeTab }: LocationLayoutProps) {
    const { location } = usePage<LocationPageProps>().props;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Locations', href: '/locations' },
                { title: location?.name || 'Location', href: '#' },
            ]}
            children={
                <>
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

                    {children}
                </>
            }
        />
    );
}
