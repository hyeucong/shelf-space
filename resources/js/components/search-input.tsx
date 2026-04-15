import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
    url: string;
    placeholder?: string;
    initialValue?: string;
    query?: Record<string, string | number | undefined>;
}

export function SearchInput({
    url,
    placeholder = "Search...",
    initialValue = "",
    query,
}: SearchInputProps) {
    const normalizedInitialValue = initialValue ?? '';
    const serializedQuery = JSON.stringify(
        Object.fromEntries(
            Object.entries(query || {}).filter(([, queryValue]) => queryValue !== undefined && queryValue !== ''),
        ),
    );
    const [value, setValue] = useState(normalizedInitialValue);

    // Debounce search
    useEffect(() => {
        // Skip if the value is the same as initial to avoid circular loops on load
        if (value === normalizedInitialValue) return;

        const baseQuery = JSON.parse(serializedQuery) as Record<string, string | number | undefined>;

        const timer = setTimeout(() => {
            router.get(url, {
                ...baseQuery,
                search: value || undefined,
                page: 1,
            }, {
                preserveState: true,
                replace: true
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [value, url, normalizedInitialValue, serializedQuery]);

    // Sync state when initialValue changes (e.g. browser back button)
    useEffect(() => {
        setValue(normalizedInitialValue);
    }, [normalizedInitialValue]);

    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-9 h-9 text-sm w-full lg:w-75 shadow-none"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    );
}

