import { Head, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Eye, Package2, Trash2, Pencil, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AssetSelectionActions } from '@/components/asset-selection-actions';
import { ResourceDeleteDialog, ResourceDuplicateDialog } from '@/components/resource-form-dialog';
import { ResourceIndexTable } from '@/components/resource-index-table';
import type { ResourceIndexColumn } from '@/components/resource-index-table';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { PaginatedData } from '@/types/pagination';

interface Kit {
    id: string;
    name: string;
    description: string | null;
    status: string;
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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const localKits = useMemo(() => kits?.data || [], [kits]);
    const activeSelectedIds = useMemo(
        () => selectedIds.filter((id) => localKits.some((kit) => kit.id === id)),
        [localKits, selectedIds],
    );
    const selectedKits = useMemo(
        () => localKits.filter((kit) => activeSelectedIds.includes(kit.id)),
        [activeSelectedIds, localKits],
    );
    const [kitToDelete, setKitToDelete] = useState<Kit | null>(null);
    const [kitToDuplicate, setKitToDuplicate] = useState<Kit | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);

    const primarySelectedKit = activeSelectedIds.length === 1
        ? selectedKits[0] ?? null
        : null;

    const handleDelete = () => {
        if (!kitToDelete || isDeleting) {
            return;
        }

        const id = kitToDelete.id;

        router.delete(`/kits/${id}`, {
            preserveScroll: true,
            onBefore: () => setIsDeleting(true),
            onSuccess: () => {
                setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
                setKitToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleDuplicate = (count: number) => {
        if (!kitToDuplicate || isDuplicating) {
            return;
        }

        router.post(`/kits/${kitToDuplicate.id}/duplicate`, { count }, {
            preserveScroll: true,
            onBefore: () => setIsDuplicating(true),
            onSuccess: () => {
                setKitToDuplicate(null);
            },
            onFinish: () => setIsDuplicating(false),
        });
    };


    const toggleOne = (id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) {
                return Array.from(new Set([...prev, id]));
            }

            return prev.filter((currentId) => currentId !== id);
        });
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(localKits.map((kit) => kit.id));

            return;
        }

        setSelectedIds([]);
    };

    const columns: ResourceIndexColumn<Kit>[] = [
        {
            key: 'name',
            header: 'Name',
            headerClassName: 'min-w-56',
            cellClassName: 'min-w-56 font-medium text-foreground',
            render: (kit) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted/10">
                        <Package2 className="text-muted-foreground" size={18} />
                    </div>
                    <div className="min-w-0">
                        <Link href={`/kits/${kit.id}/assets`} className="block line-clamp-2 transition-colors hover:text-primary">
                            {kit.name}
                        </Link>
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden max-w-120 whitespace-normal text-muted-foreground lg:table-cell',
            render: (kit) => kit.description || '-',
        },
        {
            key: 'status',
            header: 'Status',
            headerClassName: 'hidden sm:table-cell',
            cellClassName: 'hidden whitespace-nowrap capitalize text-muted-foreground sm:table-cell',
            render: (kit) => kit.status,
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'w-24 text-right',
            cellClassName: 'w-24 text-right',
            render: (kit) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 border" asChild>
                        <Link href={`/kits/${kit.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border"
                        onClick={() => setKitToDuplicate(kit)}
                    >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Duplicate</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setKitToDelete(kit)}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Kits" />

            <ResourceIndexTable
                resourcePath="/kits"
                searchPlaceholder="Search kits..."
                pagination={{ ...kits, data: localKits }}
                filters={filters}
                columns={columns}
                selection={{
                    selectedIds: activeSelectedIds,
                    onToggleAll: toggleAll,
                    onToggleOne: (kit, checked) => toggleOne(kit.id, checked),
                    getLabel: (kit) => `Select ${kit.name}`,
                }}
                emptyState={{
                    title: 'No kits yet',
                    description: 'Kits help you group multiple assets together for easier assignment.',
                }}
                toolbarEnd={(
                    <AssetSelectionActions
                        actions={[
                            {
                                key: 'view',
                                label: 'View kit',
                                icon: <Eye className="h-4 w-4" />,
                                href: primarySelectedKit ? `/kits/${primarySelectedKit.id}/assets` : undefined,
                                disabled: !primarySelectedKit,
                            },
                            {
                                key: 'delete',
                                label: 'Delete',
                                icon: <Trash2 className="h-4 w-4" />,
                                disabled: true,
                                destructive: true,
                            },
                        ]}
                    />
                )}
            // Sorting removed for Kits index
            />

            <ResourceDeleteDialog
                open={!!kitToDelete}
                onOpenChange={(open) => !open && setKitToDelete(null)}
                title="Delete Kit"
                itemName={kitToDelete?.name}
                processing={isDeleting}
                onConfirm={handleDelete}
                confirmLabel="Delete kit"
            />

            <ResourceDuplicateDialog
                open={!!kitToDuplicate}
                onOpenChange={(open) => !open && setKitToDuplicate(null)}
                itemName={kitToDuplicate?.name}
                processing={isDuplicating}
                onConfirm={handleDuplicate}
            />
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
                <Link href="/kits/create">New kit</Link>
            </Button>
        }

    />
);
