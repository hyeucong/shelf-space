import { Head, Link } from '@inertiajs/react';
import { Camera, Bell } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AssetRecord, formatCurrency } from '@/pages/assets/column-config';
import { dashboard } from '@/routes';

interface ReminderRecord {
    id: number;
    name: string;
    status: string;
}

interface PageProps {
    assets: AssetRecord[];
    reminders: ReminderRecord[];
    stats: {
        total_assets: number;
        total_categories: number;
        total_locations: number;
        total_value: number;
    };
}

export default function Dashboard({ assets, reminders, stats }: PageProps) {
    const emptyAssetsCount = Math.max(0, 5 - assets.length);
    const emptyRemindersCount = Math.max(0, 5 - reminders.length);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <div className='p-6 border rounded bg-card shadow-sm'>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Assets</div>
                        <div className="text-2xl font-bold mt-2">{stats.total_assets}</div>
                    </div>
                    <div className='p-6 border rounded bg-card shadow-sm'>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categories</div>
                        <div className="text-2xl font-bold mt-2">{stats.total_categories}</div>
                    </div>
                    <div className='p-6 border rounded bg-card shadow-sm'>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Locations</div>
                        <div className="text-2xl font-bold mt-2">{stats.total_locations}</div>
                    </div>
                    <div className='p-6 border rounded bg-card shadow-sm'>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset Value</div>
                        <div className="text-2xl font-bold mt-2">{formatCurrency(stats.total_value)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                    {/* Reminders Table */}
                    <div className="rounded border bg-card text-card-foreground shadow overflow-hidden">
                        <div className="flex items-center justify-between border-b p-6">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">Recent Reminders</h2>
                            </div>
                            <Button asChild className="rounded px-4" variant="outline" size="sm">
                                <Link href="/reminders">
                                    View All
                                </Link>
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6 w-full">Name</TableHead>
                                        <TableHead className="pr-6 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reminders.map((reminder, index) => (
                                        <TableRow
                                            key={reminder.id}
                                            className={index === reminders.length - 1 && emptyRemindersCount === 0 ? "group border-b-0" : "group"}
                                        >
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted/10">
                                                        <Bell className="text-muted-foreground" size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block font-semibold line-clamp-1 text-base">
                                                            {reminder.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6 py-4 text-right">
                                                <Badge variant="outline" className="capitalize whitespace-nowrap rounded px-2.5 py-0.5 text-xs font-semibold">
                                                    {reminder.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {Array.from({ length: emptyRemindersCount }).map((_, i) => (
                                        <TableRow key={`empty-rem-${i}`} className="border-none hover:bg-transparent">
                                            <TableCell className="py-4 h-[73px]">
                                                <div className="flex items-center gap-3 invisible">
                                                    <div className="h-10 w-10 rounded border bg-muted/10" />
                                                    <div className="h-4 w-24 bg-muted/20 rounded" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6 py-4 text-right">
                                                <div className="inline-block h-5 w-16 bg-muted/20 rounded invisible" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Assets Table */}
                    <div className="rounded border bg-card text-card-foreground shadow overflow-hidden">
                        <div className="flex items-center justify-between border-b p-6">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">Recent Assets</h2>
                            </div>
                            <Button asChild className="rounded px-4" variant="outline" size="sm">
                                <Link href="/assets">
                                    View All
                                </Link>
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6 w-full">Name</TableHead>
                                        <TableHead className="pr-6 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assets.map((asset, index) => (
                                        <TableRow
                                            key={asset.id}
                                            className={index === assets.length - 1 && emptyAssetsCount === 0 ? "group border-b-0" : "group"}
                                        >
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted/10">
                                                        {asset.image_url ? (
                                                            <img src={asset.image_url} alt={asset.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Camera className="text-muted-foreground" size={18} />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link href={`/assets/${asset.id}/overview`} className="block font-semibold hover:underline line-clamp-1 text-base">
                                                            {asset.name}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6 py-4 text-right">
                                                <Badge variant="outline" className="capitalize whitespace-nowrap rounded px-2.5 py-0.5 text-xs font-semibold">
                                                    {asset.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {Array.from({ length: emptyAssetsCount }).map((_, i) => (
                                        <TableRow key={`empty-ast-${i}`} className="border-none hover:bg-transparent">
                                            <TableCell className="py-4 h-[73px]">
                                                <div className="flex items-center gap-3 invisible">
                                                    <div className="h-10 w-10 rounded border bg-muted/10" />
                                                    <div className="h-4 w-24 bg-muted/20 rounded" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6 py-4 text-right">
                                                <div className="inline-block h-5 w-16 bg-muted/20 rounded invisible" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            {
                title: 'Dashboard',
                href: dashboard(),
            },
        ]}
    />
);
