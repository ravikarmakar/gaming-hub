import React, { useEffect, useCallback, useId } from "react";
import { LoaderCircle as Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { useUI } from "@/contexts/UIContext";
import { useWindowVirtualizer } from "@/hooks/useWindowVirtualizer";
import { MemoizedVirtualRow } from "./MemoizedVirtualRow";
import { PremiumSkeleton } from "../feedback/PremiumSkeleton";
import { useGridMeasures } from "./hooks/useGridMeasures";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";

export interface ResourceGridProps<T = any> {
    children?: React.ReactNode;
    isLoading: boolean;
    isError?: boolean;
    isEmpty: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    loadingItemCount?: number;
    emptyStateComponent?: React.ReactNode;
    errorStateComponent?: React.ReactNode;
    isFetchingMore?: boolean;
    virtualize?: boolean;
    items?: T[];
    renderItem?: (item: T, index: number) => React.ReactNode;
    itemHeight?: number;
    columns?: number;
    rowGap?: number;
    columnGap?: string | number;
    autoVirtualizeThreshold?: number;
    scrollThrottlingDelay?: number;
    scrollThreshold?: string;
}

const GridLoadingIndicator = ({ columns }: { columns: number }) => (
    <div className="flex items-center justify-center" style={{ gridColumn: `span ${columns}` }}>
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-violet-500/10 bg-[#050505]">
            <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
            <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                Loading more...
            </span>
        </div>
    </div>
);

const SkeletonGrid = ({ columns, gap, count, itemHeight }: { columns: number; gap: string; count: number; itemHeight: number }) => (
    <div
        className="grid"
        style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap
        }}
    >
        {[...Array(count)].map((_, i) => (
            <PremiumSkeleton key={`skel-${i}`} style={{ height: itemHeight }} className="w-full" />
        ))}
    </div>
);

export const ResourceGrid = <T,>({
    children,
    isLoading,
    isError = false,
    isEmpty,
    hasMore,
    onLoadMore,
    loadingItemCount = 8,
    emptyStateComponent,
    errorStateComponent,
    isFetchingMore = false,
    virtualize = false,
    items = [],
    renderItem,
    itemHeight = 320,
    columns: fixedColumns,
    rowGap = 16,
    columnGap = "1rem",
    autoVirtualizeThreshold = 50,
    scrollThrottlingDelay = 200,
    scrollThreshold = "100px",
}: ResourceGridProps<T>) => {
    const sanitizedColumnGap = typeof columnGap === 'number' ? `${columnGap}px` : columnGap;
    const gridId = useId();
    const { suppressFooter } = useUI();

    useEffect(() => {
        if (hasMore || isLoading || isFetchingMore) {
            suppressFooter(gridId, true);
        } else {
            suppressFooter(gridId, false);
        }
        return () => suppressFooter(gridId, false);
    }, [hasMore, isLoading, isFetchingMore, suppressFooter, gridId]);

    const shouldVirtualize = virtualize || items.length > autoVirtualizeThreshold;
    const { ref: sentinelRef, inView } = useInView({
        threshold: 0,
        rootMargin: scrollThreshold,
    });

    const { widthContainerRef, columns, rowHeight } = useGridMeasures(fixedColumns, itemHeight, rowGap, shouldVirtualize);

    const dataRowCount = Math.ceil(items.length / (columns || 1));
    const totalRowCount = dataRowCount + (hasMore || isFetchingMore ? 1 : 0);

    const { containerRef: virtContainerRef, virtualRows, totalHeight, visibleEndIndex } =
        useWindowVirtualizer({
            rowCount: shouldVirtualize ? totalRowCount : 0,
            rowHeight,
            overscan: 3,
        });

    useInfiniteScroll({
        onLoadMore,
        inView,
        hasMore,
        isLoading,
        isFetchingMore,
        itemsLength: items.length,
        scrollThrottlingDelay,
        shouldVirtualize,
        visibleEndIndex,
        dataRowCount
    });

    const renderRow = useCallback(
        (rowIndex: number) => {
            if (rowIndex >= dataRowCount) {
                return (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${columns}, 1fr)`,
                            gap: sanitizedColumnGap,
                            height: itemHeight,
                            alignItems: "center",
                        }}
                    >
                        {isFetchingMore ? (
                            [...Array(loadingItemCount)].map((_, i) => (
                                <div key={i} className="min-w-0" style={{ height: itemHeight, overflow: "hidden" }}>
                                    <PremiumSkeleton style={{ height: itemHeight }} className="w-full" />
                                </div>
                            ))
                        ) : (
                            <GridLoadingIndicator columns={columns} />
                        )}
                    </div>
                );
            }

            const cells: React.ReactNode[] = [];
            for (let col = 0; col < columns; col++) {
                const itemIdx = rowIndex * columns + col;
                if (itemIdx < items.length) {
                    cells.push(
                        <div key={itemIdx} className="min-w-0" style={{ height: itemHeight, overflow: "hidden" }}>
                            {renderItem ? renderItem(items[itemIdx], itemIdx) : null}
                        </div>
                    );
                } else {
                    cells.push(
                        <div key={`fill-${col}`} className="min-w-0" style={{ height: itemHeight, overflow: "hidden" }} aria-hidden />
                    );
                }
            }
            return (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: sanitizedColumnGap,
                    height: itemHeight,
                }}>
                    {cells}
                </div>
            );
        },
        [columns, sanitizedColumnGap, dataRowCount, isFetchingMore, items, itemHeight, renderItem, loadingItemCount]
    );

    return (
        <div className="w-full relative z-10">
            {!shouldVirtualize ? (
                <div className="w-full">
                    {isError ? (
                        errorStateComponent || null
                    ) : isLoading && !items.length ? (
                        <SkeletonGrid 
                            columns={columns} 
                            gap={sanitizedColumnGap} 
                            count={loadingItemCount} 
                            itemHeight={itemHeight} 
                        />
                    ) : isEmpty ? (
                        emptyStateComponent || null
                    ) : (
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                                gap: sanitizedColumnGap
                            }}
                        >
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <div key={(item as any)?._id || (item as any)?.id || index}>
                                        {renderItem?.(item, index)}
                                    </div>
                                ))
                            ) : (
                                children
                            )}
                            {isFetchingMore && (
                                <>
                                    {[...Array(loadingItemCount)].map((_, i) => (
                                        <PremiumSkeleton key={`more-${i}`} style={{ height: itemHeight }} className="w-full" />
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {hasMore && !isEmpty && (
                        <div ref={sentinelRef} className="mt-20 flex justify-center py-10">
                            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                        </div>
                    )}
                </div>
            ) : (
                <div ref={widthContainerRef} className="w-full">
                    {isError ? (
                        <div className="w-full">
                            {errorStateComponent || null}
                        </div>
                    ) : isEmpty ? (
                        <div className="w-full">
                            {emptyStateComponent || null}
                        </div>
                    ) : (
                        <div className="w-full">
                            {isLoading && items.length === 0 ? (
                                <SkeletonGrid 
                                    columns={columns} 
                                    gap={sanitizedColumnGap} 
                                    count={loadingItemCount} 
                                    itemHeight={itemHeight} 
                                />
                            ) : (
                                <div
                                    ref={virtContainerRef}
                                    style={{
                                        position: "relative",
                                        height: totalHeight,
                                        overflow: "visible",
                                    }}
                                >
                                    {virtualRows.map((row) => (
                                        <MemoizedVirtualRow
                                            key={row.index}
                                            rowIndex={row.index}
                                            top={row.top}
                                            height={row.height}
                                            rowGap={rowGap}
                                            renderRow={renderRow}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
