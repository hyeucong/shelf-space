import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    headerAction, // Receive the prop
}: {
    breadcrumbs?: BreadcrumbItemType[];
    headerAction?: React.ReactNode; // Type it
}) {
    return (
        <header className="flex h-16 shrink-0 items-center border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* This empty div eats all the middle space */}
                <div className="flex-1" />

                {/* This renders your "New Asset" button on the far right */}
                {headerAction && (
                    <div className="flex items-center gap-2">
                        {headerAction}
                    </div>
                )}
            </div>
        </header>
    );
}
