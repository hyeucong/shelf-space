import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}: AssetSelectFieldProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
                <Label>{label}</Label>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <div className="md:col-span-2">
                <Select open={open} onOpenChange={onOpenChange} value={value} onValueChange={onValueChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {clearValue && clearLabel ? (
                            <>
                                <SelectItem value={clearValue}>{clearLabel}</SelectItem>
                                <SelectSeparator />
                            </>
                        ) : null}

                        {options.length ? (
                            options.map((option) => (
                                <SelectItem key={option.id} value={String(option.id)}>
                                    {option.name}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                {emptyLabel}
                            </div>
                        )}

                        <SelectSeparator />
                        <SelectItem value={createValue}>{createLabel}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
