import * as React from 'react';
import {
    Home,
    Package,
    ShoppingBag,
    Layers,
    Tags,
    MapPin,
    AlarmClock,
    Plus,
    PlusCircle,
    Search,
    FilePlus2,
    PackagePlus,
    FolderPlus,
    MapPinPlus,
    BellPlus,
    Tag,
    Command as CommandIcon,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import * as AssetActions from '@/actions/App/Http/Controllers/AssetController';
import * as KitActions from '@/actions/App/Http/Controllers/KitController';
import * as LocationActions from '@/actions/App/Http/Controllers/LocationController';
import * as CategoryActions from '@/actions/App/Http/Controllers/CategoryController';
import * as TagActions from '@/actions/App/Http/Controllers/TagController';
import * as ReminderActions from '@/actions/App/Http/Controllers/ReminderController';
import * as DashboardActions from '@/actions/App/Http/Controllers/DashboardController';
import QuickFindController from '@/actions/App/Http/Controllers/QuickFindController';
import InertiaController from '@/actions/Inertia/Controller';

export function QuickFindInput({ className }: { className?: string }) {
    const [open, setOpen] = React.useState(false);
    // ... rest of state ...
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<Record<string, any[]>>({});
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    React.useEffect(() => {
        if (!open) {
            setQuery('');
            setResults({});
            return;
        }
    }, [open]);

    React.useEffect(() => {
        if (query.length < 2) {
            setResults({});
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(QuickFindController.url({ query: { q: query } }));
                const data = await response.json();
                setResults(data.results);
            } catch (error) {
                console.error('Failed to fetch search results:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 150);
        return () => clearTimeout(timer);
    }, [query]);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <div className={cn("flex", className)}>
            <Button
                variant="outline"
                className={cn(
                    "relative h-9 w-full justify-start rounded bg-muted/30 px-4 text-sm font-normal text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground/30 sm:pr-12 md:w-48 lg:w-64 border-muted-foreground/20",
                )}
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <span className="inline-flex">Quick find...</span>
                <div className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-[22px] items-center gap-1 sm:flex">
                    <Badge
                        variant="outline"
                        className="h-full px-2 font-mono text-[10px] font-semibold bg-background/80 text-muted-foreground/80 border-muted-foreground/20 rounded"
                    >
                        Ctrl K
                    </Badge>
                </div>
            </Button>

            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                className="max-w-2xl"
                shouldFilter={false}
            >
                <CommandInput
                    placeholder="Type to search assets, kits..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList className={cn(
                    "max-h-[450px] transition-all duration-200",
                    query.length > 0 ? "min-h-[300px]" : "min-h-auto"
                )}>
                    <CommandEmpty>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
                                <span className="text-muted-foreground">Searching assets...</span>
                            </div>
                        ) : (
                            query.length >= 2 && "No results found."
                        )}
                    </CommandEmpty>

                    {/* Dynamic Search Results */}
                    {Object.entries(results).map(([group, items]) => (
                        <CommandGroup key={group} heading={group}>
                            {items.map((item) => (
                                <CommandItem
                                    key={`${group}-${item.id}`}
                                    onSelect={() => runCommand(() => router.visit(item.url))}
                                >
                                    {group === 'Assets' ? (
                                        <Package className="mr-2 h-4 w-4" />
                                    ) : (
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{item.title}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}

                    {/* Static Navigation - Hidden when searching to prioritize results */}
                    {query.length === 0 && (
                        <>
                            <CommandGroup heading="Navigation">
                                <CommandItem onSelect={() => runCommand(() => router.visit(DashboardActions.index.url()))}>
                                    <Home className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Dashboard</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">View your overview and analytics</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(AssetActions.index.url()))}>
                                    <Package className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Assets</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Manage your equipment and inventory</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(KitActions.index.url()))}>
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Kits</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Group assets into functional kits</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(CategoryActions.index.url()))}>
                                    <Layers className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Categories</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Organize items by type</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(TagActions.index.url()))}>
                                    <Tags className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Tags</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Label assets with custom keywords</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(LocationActions.index.url()))}>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Locations</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Track where your items are stored</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(ReminderActions.index.url()))}>
                                    <AlarmClock className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Reminders</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Manage maintenance and alerts</span>
                                    </div>
                                </CommandItem>
                            </CommandGroup>
                            <CommandGroup heading="Quick Actions" className="border-t border-border mt-2 pt-2">
                                <CommandItem onSelect={() => runCommand(() => router.visit(AssetActions.create.url()))}>
                                    <FilePlus2 className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">New Asset</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Register a new equipment item</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(KitActions.create.url()))}>
                                    <PackagePlus className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">New Kit</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Create a new group of assets</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(CategoryActions.index.url()))}>
                                    <FolderPlus className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">New Category</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Define a new organizational group</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(TagActions.index.url()))}>
                                    <Tag className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">New Tag</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Create a new label for filtering</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(LocationActions.create.url()))}>
                                    <MapPinPlus className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">New Location</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Add a new storage or site location</span>
                                    </div>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.visit(ReminderActions.create.url()))}>
                                    <BellPlus className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">New Reminder</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">Set a new maintenance alert</span>
                                    </div>
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </div>
    );
}
