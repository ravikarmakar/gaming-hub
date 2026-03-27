import React, { useEffect, useRef, useCallback, useState, useId } from "react";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { useUIStore } from "@/store/useUIStore";
import { useWindowVirtualizer } from "@/hooks/useWindowVirtualizer";
import { MemoizedVirtualRow } from "./MemoizedVirtualRow";
import { PremiumSkeleton } from "./PremiumSkeleton";

export interface ResourceGridProps<T = any> {
    children?: React.ReactNode;
    isLoading: boolean;
    isEmpty: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    loadingItemCount?: number;
    emptyStateComponent?: React.ReactNode;
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

function getColumns(width: number): number {
    if (width > 1200) return 4;
    if (width > 900) return 3;
    if (width > 600) return 2;
    return 1;
}

export const ResourceGrid = <T,>({
    children,
    isLoading,
    isEmpty,
    hasMore,
    onLoadMore,
    loadingItemCount = 8,
    emptyStateComponent,
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
    const { suppressFooter } = useUIStore();

    useEffect(() => {
        // Suppress footer if we are loading or there is more data to come (infinite scroll)
        if (hasMore || isLoading || isFetchingMore) {
            suppressFooter(gridId, true);
        } else {
            suppressFooter(gridId, false);
        }

        // Cleanup: always show footer when the grid unmounts
        return () => suppressFooter(gridId, false);
    }, [hasMore, isLoading, isFetchingMore, suppressFooter, gridId]);

    const shouldVirtualize = virtualize || items.length > autoVirtualizeThreshold;
    const { ref: sentinelRef, inView } = useInView({
        threshold: 0,
        rootMargin: scrollThreshold,
    });

    const loadMoreRef = useRef(onLoadMore);
    useEffect(() => {
        loadMoreRef.current = onLoadMore;
    }, [onLoadMore]);

    useEffect(() => {
        if (shouldVirtualize) return;
        let id: ReturnType<typeof setTimeout>;
        if (inView && hasMore && !isLoading && !isFetchingMore) {
            const delay = items.length === 0 ? 0 : scrollThrottlingDelay;
            id = setTimeout(() => loadMoreRef.current(), delay);
        }
        return () => clearTimeout(id);
    }, [inView, hasMore, isLoading, isFetchingMore, scrollThrottlingDelay, shouldVirtualize, items.length]);
    const widthContainerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(960);

    useEffect(() => {
        if (!shouldVirtualize) return;
        const measure = () => {
            if (widthContainerRef.current) {
                setContainerWidth(widthContainerRef.current.offsetWidth);
            }
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (widthContainerRef.current) ro.observe(widthContainerRef.current);
        return () => ro.disconnect();
    }, [shouldVirtualize]);
    const columns = fixedColumns || getColumns(containerWidth);
    const rowHeight = itemHeight + rowGap;

    const dataRowCount = Math.ceil(items.length / columns);
    const totalRowCount = dataRowCount + (hasMore || isFetchingMore ? 1 : 0);
    const { containerRef: virtContainerRef, virtualRows, totalHeight, visibleEndIndex } =
        useWindowVirtualizer({
            rowCount: shouldVirtualize ? totalRowCount : 0,
            rowHeight,
            overscan: 3,
        });

    const lastLoadedCountRef = useRef(-1);

    useEffect(() => {
        if (!shouldVirtualize || !hasMore || isLoading || isFetchingMore) return;
        const nearEnd = visibleEndIndex >= dataRowCount;
        const newBatch = items.length !== lastLoadedCountRef.current;
        if (nearEnd && newBatch) {
            const delay = items.length === 0 ? 0 : scrollThrottlingDelay;
            const id = setTimeout(() => {
                lastLoadedCountRef.current = items.length;
                loadMoreRef.current();
            }, delay);
            return () => clearTimeout(id);
        }
    }, [visibleEndIndex, dataRowCount, hasMore, isLoading, isFetchingMore, items.length, shouldVirtualize, scrollThrottlingDelay]);

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
                            <div className="flex items-center justify-center" style={{ gridColumn: `span ${columns}` }}>
                                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-violet-500/10 bg-[#050505]">
                                    <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                                        Loading more...
                                    </span>
                                </div>
                            </div>
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
        [columns, sanitizedColumnGap, dataRowCount, isFetchingMore, items, itemHeight, renderItem]
    );

    return (
        <div className="w-full relative z-10">
            {!shouldVirtualize ? (
                <div className="w-full">
                    {isLoading && !items.length ? (
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                                gap: sanitizedColumnGap
                            }}
                        >
                            {[...Array(loadingItemCount)].map((_, i) => (
                                <PremiumSkeleton key={`skel-${i}`} style={{ height: itemHeight }} className="w-full" />
                            ))}
                        </div>
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
                                items.map((item, index) => renderItem?.(item, index))
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
                    {isEmpty ? (
                        <div className="w-full">
                            {emptyStateComponent || null}
                        </div>
                    ) : (
                        <div className="w-full">
                            {isLoading && items.length === 0 ? (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                                        gap: sanitizedColumnGap,
                                    }}
                                >
                                    {[...Array(loadingItemCount)].map((_, i) => (
                                        <PremiumSkeleton
                                            key={`init-skel-${i}`}
                                            style={{ height: itemHeight }}
                                            className="w-full"
                                        />
                                    ))}
                                </div>
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
