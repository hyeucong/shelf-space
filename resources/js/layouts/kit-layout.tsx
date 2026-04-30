import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Download, Package, Printer } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { HeaderActions } from '@/components/header-action';

export interface KitResource {
    id: string;
    name: string;
    description?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    qr_code_svg?: string | null;
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
            headerAction={
                <div className="flex items-center gap-2">
                    <HeaderActions editHref={`/kits/${kit.id}/edit`} />
                    {headerAction}
                </div>
            }
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
                            <TabsTrigger value="assets" asChild>
                                <Link href={`/kits/${kit.id}/assets`} preserveState className="block">
                                    Assets
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="overview" asChild>
                                <Link href={`/kits/${kit.id}/overview`} preserveState className="block">
                                    Overview
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
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kit QR Code</h3>
                                    </div>
                                    <div className="p-8 flex flex-col items-center justify-center space-y-6">
                                        <div className="w-full max-w-[280px] overflow-hidden aspect-square border-8 rounded p-6 flex flex-col items-center justify-between bg-white">
                                            <div
                                                className="w-full flex-1 rounded flex items-center justify-center p-14 min-h-0 [&>svg]:max-w-full [&>svg]:h-auto"
                                                dangerouslySetInnerHTML={{ __html: kit.qr_code_svg || '' }}
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
                            </div>
                        </aside>
                    </div>
                </>
            }
        />
    );
}
