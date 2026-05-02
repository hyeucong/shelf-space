import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

export interface AssetSelectOption {
    id: string | number;
    name: string;
}

interface AssetSelectFieldProps {
    label: string;
    description: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: AssetSelectOption[];
    emptyLabel: string;
    createValue: string;
    createLabel: string;
    clearValue?: string;
    clearLabel?: string;
    showCreate?: boolean;
    hideLabel?: boolean;
}

export function AssetSelectField({
    label,
    description,
    open,
    onOpenChange,
    value,
    onValueChange,
    placeholder,
    options,
    emptyLabel,
    createValue,
    createLabel,
    clearValue,
    clearLabel,
    showCreate = true,
    hideLabel = false,
}: AssetSelectFieldProps) {
    const selectedOption = options.find((option) => String(option.id) === value);

    return (
        <div className={cn("grid gap-4 items-start", hideLabel ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3")}>
            {!hideLabel && (
                <div>
                    <Label>{label}</Label>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
            )}
            <div className={cn(hideLabel ? "" : "md:col-span-2")}>
                <Popover open={open} onOpenChange={onOpenChange}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between rounded font-normal bg-transparent hover:bg-transparent"
                        >
                            <span className="truncate">
                                {selectedOption ? selectedOption.name : placeholder}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) p-0 rounded overflow-hidden" align="start">
                        <Command className="rounded">
                            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
                            <CommandList>
                                <CommandEmpty>{emptyLabel}</CommandEmpty>
                                <CommandGroup>
                                    {clearValue && clearLabel && (
                                        <CommandItem
                                            value={clearValue}
                                            onSelect={() => {
                                                onValueChange('');
                                                onOpenChange(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    !value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {clearLabel}
                                        </CommandItem>
                                    )}
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.id}
                                            value={option.name}
                                            onSelect={() => {
                                                const stringId = String(option.id);
                                                // If same value is selected, clear it (undo)
                                                onValueChange(stringId === value ? '' : stringId);
                                                onOpenChange(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === String(option.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {option.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                {showCreate && (
                                    <>
                                        <CommandSeparator />
                                        <CommandGroup>
                                            <CommandItem
                                                value={createValue}
                                                onSelect={() => {
                                                    onValueChange(createValue);
                                                    onOpenChange(false);
                                                }}
                                                className="text-primary"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                {createLabel}
                                            </CommandItem>
                                        </CommandGroup>
                                    </>
                                )}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
