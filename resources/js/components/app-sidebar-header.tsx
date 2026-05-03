import { Breadcrumbs } from '@/components/breadcrumbs';
import { QuickFindInput } from '@/components/quick-find-input';
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
        <header className="flex h-16 shrink-0 items-center border-b border-border bg-background px-4 transition-[padding] duration-200 ease-linear ">
            <div className="flex w-full items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <div className="flex-1" />

                <QuickFindInput className="hidden md:flex" />

                {headerAction && (
                    <div className="flex items-center gap-2">
                        {headerAction}
                    </div>
                )}
            </div>
        </header>
    );
}
