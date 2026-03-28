import { useEffect, useRef } from "react";

interface InfiniteScrollProps {
    onLoadMore: () => void;
    inView: boolean;
    hasMore: boolean;
    isLoading: boolean;
    isFetchingMore: boolean;
    itemsLength: number;
    scrollThrottlingDelay: number;
    shouldVirtualize: boolean;
    visibleEndIndex: number;
    dataRowCount: number;
}

/**
 * Hook to handle infinite scroll triggers for both virtualized and non-virtualized grids.
 */
export const useInfiniteScroll = ({
    onLoadMore,
    inView,
    hasMore,
    isLoading,
    isFetchingMore,
    itemsLength,
    scrollThrottlingDelay,
    shouldVirtualize,
    visibleEndIndex,
    dataRowCount
}: InfiniteScrollProps) => {
    const loadMoreRef = useRef(onLoadMore);
    useEffect(() => {
        loadMoreRef.current = onLoadMore;
    }, [onLoadMore]);

    const lastLoadedCountRef = useRef(-1);

    // Non-virtualized scroll (sentinel based)
    useEffect(() => {
        if (shouldVirtualize) return;
        let id: ReturnType<typeof setTimeout>;
        if (inView && hasMore && !isLoading && !isFetchingMore) {
            const delay = itemsLength === 0 ? 0 : scrollThrottlingDelay;
            id = setTimeout(() => loadMoreRef.current(), delay);
        }
        return () => clearTimeout(id);
    }, [inView, hasMore, isLoading, isFetchingMore, scrollThrottlingDelay, shouldVirtualize, itemsLength]);

    // Virtualized scroll (index based)
    useEffect(() => {
        if (!shouldVirtualize || !hasMore || isLoading || isFetchingMore) return;
        // Trigger when the user sees the last data row (or one row before it)
        const nearEnd = dataRowCount > 0 && visibleEndIndex >= dataRowCount - 1;
        const newBatch = itemsLength !== lastLoadedCountRef.current;
        if (nearEnd && newBatch) {
            const delay = itemsLength === 0 ? 0 : scrollThrottlingDelay;
            const id = setTimeout(() => {
                lastLoadedCountRef.current = itemsLength;
                loadMoreRef.current();
            }, delay);
            return () => clearTimeout(id);
        }
    }, [visibleEndIndex, dataRowCount, hasMore, isLoading, isFetchingMore, itemsLength, shouldVirtualize, scrollThrottlingDelay]);
};
