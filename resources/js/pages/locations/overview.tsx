import type { ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import LocationLayout, { type LocationPageProps } from '@/layouts/location-layout';

export default function LocationOverview() {
    const { location } = usePage<LocationPageProps>().props;

    return (
        <>
            <Head title={`${location?.name || 'Location'} - Overview`} />
            <div className="p-4">
                <div>
                    <div className="rounded border bg-background">
                        <dl className="divide-y">
                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">ID</dt>
                                <dd className="ml-4 text-sm text-foreground wrap-break-word">{location?.id ?? '-'}</dd>
                            </div>

                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Parent location</dt>
                                <dd className="ml-4 text-sm">
                                    {location?.parent?.name ? (
                                        <Link href={`/locations/${location.parent.id}/overview`} className="text-foreground hover:text-primary">
                                            {location.parent.name}
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </dd>
                            </div>

                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Assets</dt>
                                <dd className="ml-4 text-sm">
                                    <Badge variant="outline">{location?.assets_count ?? 0}</Badge>
                                </dd>
                            </div>

                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Child locations</dt>
                                <dd className="ml-4 text-sm">
                                    <Badge variant="outline">{location?.children_count ?? 0}</Badge>
                                </dd>
                            </div>

                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Address</dt>
                                <dd className="ml-4 text-sm text-foreground">{location?.address || '-'}</dd>
                            </div>

                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Description</dt>
                                <dd className="ml-4 text-sm text-foreground">{location?.description || '-'}</dd>
                            </div>

                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Created</dt>
                                <dd className="ml-4 text-sm text-foreground">{location?.created_at ? new Date(location.created_at).toLocaleString() : '-'}</dd>
                            </div>

                            <div className="flex items-center justify-between px-6 py-4">
                                <dt className="text-sm text-muted-foreground">Updated</dt>
                                <dd className="ml-4 text-sm text-foreground">{location?.updated_at ? new Date(location.updated_at).toLocaleString() : '-'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </>
    );
}

LocationOverview.layout = (page: ReactNode) => (
    <LocationLayout activeTab="overview" children={page} />
);
