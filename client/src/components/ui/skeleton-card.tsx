/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
    className?: string;
    count?: number;
}

export function SkeletonCard({ className, count = 1 }: SkeletonCardProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={cn("p-6 border border-border/50 rounded-lg space-y-4", className)}>
                    <div className="flex gap-4">
                        <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-3 py-1">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-full" />
                            <div className="flex gap-2 pt-2">
                                <Skeleton className="h-8 w-20 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}
