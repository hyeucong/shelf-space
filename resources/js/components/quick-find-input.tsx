import { Button } from '@/components/ui/button';

export function QuickFindInput() {
    return (
        <div className="hidden md:flex">
            <Button variant="outline" className="h-9">
                <span className="text-sm">Quick find</span>
            </Button>
        </div>
    );
}
