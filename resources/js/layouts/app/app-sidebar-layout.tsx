import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast, Toaster } from 'sonner';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    headerAction,
}: AppLayoutProps) {
    const { flash } = usePage().props as any;
    const shownRef = useRef<string | null>(null);

    useEffect(() => {
        const key = flash?.success ?? flash?.error ?? null;
        if (!key || key === shownRef.current) return;
        shownRef.current = key;
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppShell variant="sidebar">
            <Toaster position="bottom-right" theme="dark" />
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader
                    breadcrumbs={breadcrumbs}
                    headerAction={headerAction}
                />
                {children}
            </AppContent>
        </AppShell>
    );
}
