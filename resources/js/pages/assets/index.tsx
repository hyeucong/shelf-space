import { Head } from '@inertiajs/react';

export default function Assets() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

            </div>
        </>
    );
}

Assets.layout = {
    breadcrumbs: [
        {
            title: 'Assets',
            href: '/assets',
        },
    ],
};
