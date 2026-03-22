import {
    useEffect,
    useRef,
    useCallback,
    useState,
    useMemo,
    memo,
} from "react";
import { motion } from "framer-motion";
import { Loader2, SearchX } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { PremiumSkeleton } from "./PremiumSkeleton";

export interface ResourceGridProps<T = any> {
    children?: React.ReactNode;
    isLoading: boolean;
    isEmpty: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    loadingItemCount?: number;
    emptyMessage?: string;
    emptySubMessage?: string;
    isFetchingMore?: boolean;
    virtualize?: boolean;
    items?: T[];
    renderItem?: (item: T, index: number) => React.ReactNode;
    itemHeight?: number;
    columns?: number;
    rowGap?: number;
    columnGap?: string | number;
    /**
     * When `virtualize` is false, the grid will auto-switch to virtual mode
     * once the item count exceeds this threshold to protect the DOM.
     * Default: 50 items
     */
    autoVirtualizeThreshold?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// useWindowVirtualizer
// ─────────────────────────────────────────────────────────────────────────────

interface VirtualRow {
    index: number;
    top: number;
    height: number;
}

function useWindowVirtualizer({
    rowCount,
    rowHeight,
    overscan = 3,
    extraHeight = 0,
}: {
    rowCount: number;
    rowHeight: number;
    overscan?: number;
    extraHeight?: number;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [range, setRange] = useState({ start: 0, end: Math.min(overscan * 4, rowCount) });

    const computeRange = useCallback(() => {
        if (!containerRef.current || rowCount === 0) return;

        const containerTop =
            containerRef.current.getBoundingClientRect().top + window.scrollY;

        const scrollTop = window.scrollY;
        const viewHeight = window.innerHeight;

        const relScroll = Math.max(0, scrollTop - containerTop);

        const start = Math.max(0, Math.floor(relScroll / rowHeight) - overscan);
        const end = Math.min(
            rowCount,
            Math.ceil((relScroll + viewHeight) / rowHeight) + overscan
        );

        setRange((prev) =>
            prev.start === start && prev.end === end ? prev : { start, end }
        );
    }, [rowCount, rowHeight, overscan]);

    useEffect(() => {
        let rafId: number;
        const onScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(computeRange);
        };

        computeRange();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", computeRange, { passive: true });

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", computeRange);
        };
    }, [computeRange]);

    useEffect(() => {
        computeRange();
    }, [rowCount, rowHeight, computeRange]);

    const virtualRows: VirtualRow[] = useMemo(() => {
        const rows: VirtualRow[] = [];
        for (let i = range.start; i < range.end; i++) {
            rows.push({ index: i, top: i * rowHeight, height: rowHeight });
        }
        return rows;
    }, [range, rowHeight]);

    return {
        containerRef,
        virtualRows,
        totalHeight: rowCount * rowHeight + extraHeight,
        startIndex: range.start,
        endIndex: range.end,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getColumns(width: number): number {
    if (width > 1200) return 4;
    if (width > 900) return 3;
    if (width > 600) return 2;
    return 1;
}

const EmptyState = ({
    message,
    subMessage,
}: {
    message: string;
    subMessage: string;
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] py-24 px-6 text-center bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden group"
    >
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mb-8 border border-white/10 group-hover:border-violet-500/30 transition-colors duration-500 rotate-12 group-hover:rotate-0">
                <SearchX className="w-10 h-10 text-violet-400/60 group-hover:text-violet-400 transition-colors duration-500" />
            </div>
            <div className="space-y-3">
                <h3 className="text-2xl font-black italic tracking-tighter text-white/90 group-hover:text-white transition-colors">
                    {message}
                </h3>
                <p className="text-white/40 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                    {subMessage}
                </p>
            </div>
        </div>
    </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MemoizedVirtualRow
// ─────────────────────────────────────────────────────────────────────────────

interface MemoizedVirtualRowProps {
    rowIndex: number;
    top: number;
    height: number;
    rowGap: number;
    renderRow: (rowIndex: number) => React.ReactNode;
}

const MemoizedVirtualRow = memo(
    ({ rowIndex, top, height, rowGap, renderRow }: MemoizedVirtualRowProps) => (
        <div
            style={{
                position: "absolute",
                top,
                left: 0,
                right: 0,
                height,
                paddingBottom: rowGap,
                boxSizing: "border-box",
            }}
        >
            {renderRow(rowIndex)}
        </div>
    ),
    (prev, next) =>
        prev.rowIndex === next.rowIndex &&
        prev.top === next.top &&
        prev.height === next.height &&
        prev.rowGap === next.rowGap &&
        prev.renderRow === next.renderRow
);

MemoizedVirtualRow.displayName = "MemoizedVirtualRow";

// ─────────────────────────────────────────────────────────────────────────────
// ResourceGrid Component
// ─────────────────────────────────────────────────────────────────────────────

export const ResourceGrid = <T,>({
    children,
    isLoading,
    isEmpty,
    hasMore,
    onLoadMore,
    loadingItemCount = 8,
    emptyMessage = "No Results Found",
    emptySubMessage = "Try adjusting your filters or search terms.",
    isFetchingMore = false,
    virtualize = false,
    items = [],
    renderItem,
    itemHeight = 320,
    columns: fixedColumns,
    rowGap = 16,
    columnGap = "1rem",
    autoVirtualizeThreshold = 50,
}: ResourceGridProps<T>) => {

    const shouldVirtualize = virtualize || items.length > autoVirtualizeThreshold;


    const { ref: sentinelRef, inView } = useInView({
        threshold: 0,
        rootMargin: "600px",
    });

    useEffect(() => {
        if (shouldVirtualize) return;
        let id: ReturnType<typeof setTimeout>;
        if (inView && hasMore && !isLoading && !isFetchingMore) {
            id = setTimeout(onLoadMore, 300);
        }
        return () => clearTimeout(id);
    }, [inView, hasMore, isLoading, isFetchingMore, onLoadMore, shouldVirtualize]);


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


    const { containerRef: virtContainerRef, virtualRows, totalHeight, endIndex } =
        useWindowVirtualizer({
            rowCount: shouldVirtualize ? totalRowCount : 0,
            rowHeight,
            overscan: 3,
        });


    const lastLoadedCountRef = useRef(-1);

    useEffect(() => {
        if (!shouldVirtualize || !hasMore || isLoading || isFetchingMore) return;
        const nearEnd = endIndex >= Math.max(0, dataRowCount - 5);
        const newBatch = items.length !== lastLoadedCountRef.current;
        if (nearEnd && newBatch) {
            lastLoadedCountRef.current = items.length;
            onLoadMore();
        }
    }, [endIndex, dataRowCount, hasMore, isLoading, isFetchingMore, items.length, onLoadMore, shouldVirtualize]);


    useEffect(() => {
        if (!shouldVirtualize || !hasMore) return;

        let clamping = false;
        let rafId: number;

        const clamp = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (clamping || !virtContainerRef.current) return;

                const containerBottom =
                    virtContainerRef.current.getBoundingClientRect().bottom;

                if (containerBottom < window.innerHeight) {
                    const overshoot = window.innerHeight - containerBottom;
                    clamping = true;
                    window.scrollBy({ top: -Math.ceil(overshoot), behavior: "instant" as ScrollBehavior });
                    requestAnimationFrame(() => { clamping = false; });
                }
            });
        };

        window.addEventListener("scroll", clamp, { passive: true });
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", clamp);
        };
    }, [hasMore, shouldVirtualize]);


    const renderRow = useCallback(
        (rowIndex: number) => {

            if (rowIndex >= dataRowCount) {
                return (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${columns}, 1fr)`,
                            gap: columnGap,
                            height: itemHeight,
                            alignItems: "center",
                        }}
                    >
                        {isFetchingMore ? (
                            [...Array(columns)].map((_, i) => (
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
                    gap: columnGap,
                    height: itemHeight,
                }}>
                    {cells}
                </div>
            );
        },
        [columns, columnGap, dataRowCount, isFetchingMore, items, itemHeight, renderItem]
    );


    return (
        <div className="w-full relative z-10">

            {!shouldVirtualize ? (
                <div className="w-full">
                    {isLoading && !items.length ? (
                        <div className="grid grid-cols-1 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4 gap-6">
                            {[...Array(loadingItemCount)].map((_, i) => (
                                <PremiumSkeleton key={`skel-${i}`} style={{ height: itemHeight }} className="w-full" />
                            ))}
                        </div>
                    ) : isEmpty ? (
                        <EmptyState message={emptyMessage} subMessage={emptySubMessage} />
                    ) : (
                        <div className="grid grid-cols-1 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4 gap-6">
                            {children}
                            {isFetchingMore && (
                                <>
                                    {[...Array(4)].map((_, i) => (
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

                isEmpty ? (
                    <div className="w-full">
                        <EmptyState message={emptyMessage} subMessage={emptySubMessage} />
                    </div>
                ) : (
                    <div
                        ref={widthContainerRef}
                        className="w-full"
                    >
                        {isLoading && items.length === 0 ? (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                                    gap: columnGap,
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
                )
            )}
        </div>
    );
};
