import { cn } from "../../utils/cn";
import { Button } from "./button";

interface PaginationProps {
    page: number;
    totalPages: number;
    onChange?: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onChange?.(Math.max(1, page - 1))}
                disabled={page <= 1}
            >
                Prev
            </Button>
            <span className={cn("text-xs text-mutedForeground")}>Page {page} of {totalPages}</span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onChange?.(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
            >
                Next
            </Button>
        </div>
    );
}
