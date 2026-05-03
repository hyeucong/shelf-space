import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Copy, Download, MapPin, Printer, Trash2 } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { HeaderActions } from '@/components/header-action';
import { ResourceDeleteDialog, ResourceDuplicateDialog } from '@/components/resource-form-dialog';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import LocationMap from '@/components/location-map';

export interface LocationResource {
    id: string;
    name: string;
    description?: string | null;
    address?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    created_at?: string | null;
    updated_at?: string | null;
    parent?: { id: string; name: string } | null;
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(`/locations/${location.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
            onFinish: () => setProcessing(false),
        });
    };

    const handleDuplicate = (count: number) => {
        setProcessing(true);
        router.post(`/locations/${location.id}/duplicate`, { count }, {
            onSuccess: () => {
                setIsDuplicateDialogOpen(false);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Locations', href: '/locations' },
                { title: location?.name || 'Location', href: '#' },
            ]}
            headerAction={
                <div className="flex items-center gap-2">
                    <HeaderActions 
                        editHref={`/locations/${location.id}/edit`} 
                        actions={[
                            {
                                key: 'duplicate',
                                label: 'Duplicate',
                                icon: <Copy size={16} />,
                                onClick: () => setIsDuplicateDialogOpen(true),
                            },
                            {
                                key: 'delete',
                                label: 'Delete',
                                icon: <Trash2 size={16} />,
                                destructive: true,
                                onClick: () => setIsDeleteDialogOpen(true),
                            },
                        ]}
                    />
                    {headerAction}
                </div>
            }
        >
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

                <div className="flex flex-1 flex-col lg:flex-row lg:gap-0">
                    <div className="flex-1 overflow-hidden">
                        {children}
                    </div>
                    <aside className="w-full lg:w-96">
                        <div className="sticky top-0 p-4 lg:pl-0 space-y-4">


                            {location?.latitude && location?.longitude && (
                                <LocationMap location={location} />
                            )}
                        </div>
                    </aside>
                </div>
            </div>
            <ResourceDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Location"
                itemName={location.name}
                onConfirm={handleDelete}
                processing={processing}
                confirmLabel="Delete Location"
            />

            <ResourceDuplicateDialog
                open={isDuplicateDialogOpen}
                onOpenChange={setIsDuplicateDialogOpen}
                itemName={location.name}
                onConfirm={handleDuplicate}
                processing={processing}
            />
        </AppSidebarLayout>
    );
}
