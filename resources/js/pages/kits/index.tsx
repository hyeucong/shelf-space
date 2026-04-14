import { Head, Link, router } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ArrowUpDown } from 'lucide-react';
import { SearchInput } from '@/components/search-input';

interface Kit {
    id: number;
    name: string;
    description: string;
    status: string;
}

interface PaginationLinkType {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLinkType[];
    current_page: number;
    last_page: number;
    per_page: number;
    first_page_url: string;
    last_page_url: string;
    from: number;
    to: number;
    total: number;
}

interface PageProps {
    kits: PaginatedData<Kit>;
    filters: {
        search?: string;
        per_page?: string | number;
        sort?: string;
        order?: 'asc' | 'desc';
    };
}

export default function Kits({ kits, filters }: PageProps) {
    const handleSortChange = (value: string) => {
        const [sort, order] = value.split(':');
        router.get('/kits', {
            ...filters,
            sort,
            order,
            page: 1
        }, {
            preserveState: true,
            replace: true
        });
    };

    return (
        <>
            <Head title="Kits" />

            <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Toolbar */}
                    <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded border bg-background p-2 shadow-sm min-h-12">
                        <div className="flex flex-1 flex-row flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-9 gap-2 shadow-none font-normal text-muted-foreground shrink-0">
                                        <ArrowUpDown size={16} /> Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup
                                        value={`${filters?.sort || 'created_at'}:${filters?.order || 'desc'}`}
                                        onValueChange={handleSortChange}
                                    >
                                        <DropdownMenuRadioItem value="created_at:desc">Newest</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="created_at:asc">Oldest</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="name:asc">Name (A-Z)</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="name:desc">Name (Z-A)</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex">
                                <SearchInput
                                    url="/kits"
                                    placeholder="Search kits..."
                                    initialValue={filters?.search}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-1 items-center justify-center rounded border border-dashed bg-background h-[300px]">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                No kit yet
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Kits help you group multiple assets together for easier assignment.
                            </p>
                            <Button className="mt-4 rounded" asChild>
                                <Link href="/kits/create">New kit</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Kits.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Kits', href: '/kits' }
        ]}
        headerAction={
            <Button className="rounded border-none" asChild>
                <Link href="/kits/create">
                    New kit
                </Link>
            </Button>
        }
    />
);
