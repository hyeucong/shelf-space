import { Link } from '@inertiajs/react';
import { User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const activeTab = isCurrentOrParentUrl(edit()) ? 'profile' : 'appearance';

    return (
        <div className="flex flex-1 flex-col">
            <div className="flex items-start p-4">
                <div className="shrink-0">
                    <div className="flex h-13 w-13 items-center justify-center overflow-hidden rounded border bg-background">
                        <User className="text-muted-foreground" size={32} />
                    </div>
                </div>

                <div className="ml-4 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Settings</h1>
                        <p className="text-sm text-muted-foreground">Manage your profile and account settings</p>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} className="border-y px-4">
                <TabsList variant="line">
                    <TabsTrigger value="profile" asChild>
                        <Link href={edit()} preserveState className="block">
                            Profile
                        </Link>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" asChild>
                        <Link href={editAppearance()} preserveState className="block">
                            Appearance
                        </Link>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex flex-1 flex-col">
                <div className="flex-1 p-6">
                    <div className="max-w-xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
