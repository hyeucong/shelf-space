import { Head, Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Pencil, Trash2 } from 'lucide-react'; // Import icons

interface Asset {
    id: number;
    asset_id: string;
    name: string;
    status: string;
    value: number | null;
}

interface PageProps {
    assets: Asset[];
}

export default function Assets({ assets }: PageProps) {
    return (
        <>
            <Head title="Assets" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="rounded border shadow-none bg-background">

                    <div className="flex items-center justify-between p-4 border-b border-border/50">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Assets</h2>
                            <p className="text-sm text-muted-foreground">
                                {assets?.length || 0} asset{assets?.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="rounded shadow-none">
                                Export selection
                            </Button>
                            <Button variant="outline" className="rounded shadow-none">
                                Actions
                            </Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Asset ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets && assets.length > 0 ? (
                                assets.map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-semibold">{asset.name}</TableCell>
                                        <TableCell className="font-medium text-muted-foreground">{asset.asset_id}</TableCell>
                                        <TableCell>
                                            <span className="capitalize">{asset.status}</span>
                                        </TableCell>
                                        <TableCell>
                                            {asset.value ? `$${Number(asset.value).toFixed(2)}` : '-'}
                                        </TableCell>
                                        {/* Row Actions */}
                                        <TableCell>
                                            <div className='flex gap-2'>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 border" asChild>
                                                    <Link href={`/assets/${asset.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 border">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    {/* colSpan increased to 5 to account for the new column */}
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No assets found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

Assets.layout = (page: React.ReactNode) => (
    <AppSidebarLayout
        children={page}
        breadcrumbs={[
            { title: 'Assets', href: '/assets' }
        ]}
        headerAction={
            <Button className="rounded border-none" asChild>
                <Link href="/assets/create">
                    New asset
                </Link>
            </Button>
        }
    />
);
