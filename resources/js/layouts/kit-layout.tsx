import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Package } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface KitResource {
    id: number;
    name: string;
    description?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface KitPageProps {
    kit: KitResource;
    [key: string]: unknown;
}

type KitLayoutProps = {
    children: ReactNode;
    activeTab: 'overview' | 'assets' | 'kits' | 'activity';
    headerAction?: ReactNode;
};

export default function KitLayout({ children, activeTab, headerAction }: KitLayoutProps) {
    const { kit } = usePage<KitPageProps>().props;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Kits', href: '/kits' },
                { title: kit?.name || 'Kit', href: '#' },
            ]}
            headerAction={headerAction}
            children={
                <>
                    <div className="flex items-start p-4">
                        <div className="shrink-0">
                            <div className="flex h-13 w-13 items-center justify-center overflow-hidden rounded border bg-background">
                                <Package className="text-muted-foreground" size={32} />
                            </div>
                        </div>

                        <div className="ml-4 flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold">{kit?.name || 'Kit'}</h1>
                                <p className="text-sm text-muted-foreground">{kit?.status ? kit.status.charAt(0).toUpperCase() + kit.status.slice(1) : ''}</p>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} className="border-y px-4">
                        <TabsList variant="line">
                            <TabsTrigger value="overview" asChild>
                                <Link href={`/kits/${kit.id}/overview`} preserveState className="block">
                                    Overview
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="assets" asChild>
                                <Link href={`/kits/${kit.id}/assets`} preserveState className="block">
                                    Assets
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
