import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function QuickFindInput() {
    return (
        <div className="relative hidden w-full max-w-72 items-center md:flex">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Quick find"
                aria-label="Quick find"
                className="h-9 w-full border-sidebar-border/70 bg-background pl-9 shadow-none"
            />
        </div>
    );
}
