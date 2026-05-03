import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Copy, Download, Package, Printer, Trash2 } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { HeaderActions } from '@/components/header-action';
import { ResourceDeleteDialog, ResourceDuplicateDialog } from '@/components/resource-form-dialog';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { downloadQrAsPng, printQr } from '@/lib/qr-utils';

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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(`/kits/${kit.id}`, {
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
        router.post(`/kits/${kit.id}/duplicate`, { count }, {
            onSuccess: () => {
                setIsDuplicateDialogOpen(false);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
            onFinish: () => setProcessing(false),
        });
    };

    const handleStatusUpdate = (status: string) => {
        setProcessing(true);
        router.patch(`/kits/${kit.id}/status`, { status }, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: () => setProcessing(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Kits', href: '/kits' },
                { title: kit?.name || 'Kit', href: '#' },
            ]}
            headerAction={
                <div className="flex items-center gap-2">
                    <HeaderActions 
                        editHref={`/kits/${kit.id}/edit`} 
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
                <aside className="w-full lg:w-96">
                    <div className="sticky top-0 p-4 lg:pl-0 space-y-4">
                        <div className="overflow-hidden rounded border bg-background flex items-center justify-between px-4 h-[52px]">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 gap-2 p-2 font-normal hover:bg-muted/50 border" disabled={processing}>
                                        <Badge variant="outline" className="capitalize border-none p-0 px-2 text-sm font-medium">
                                            {kit.status || 'Available'}
                                        </Badge>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={() => handleStatusUpdate('available')}>Available</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate('assigned')}>Assigned</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate('maintenance')}>In Maintenance</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate('retired')}>Retired</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full gap-2 cursor-pointer"
                                    onClick={() => downloadQrAsPng(kit.qr_code_svg || '', kit.name)}
                                >
                                    <Download size={14} />
                                    Download
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full gap-2 cursor-pointer"
                                    onClick={() => printQr(kit.qr_code_svg || '', kit.name)}
                                >
                                    <Printer size={14} />
                                    Print
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            <ResourceDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Kit"
                itemName={kit.name}
                onConfirm={handleDelete}
                processing={processing}
                confirmLabel="Delete Kit"
            />

            <ResourceDuplicateDialog
                open={isDuplicateDialogOpen}
                onOpenChange={setIsDuplicateDialogOpen}
                itemName={kit.name}
                onConfirm={handleDuplicate}
                processing={processing}
            />
        </AppSidebarLayout>
    );
}
