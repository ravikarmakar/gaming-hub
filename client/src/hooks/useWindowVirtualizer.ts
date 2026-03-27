import { useEffect, useRef, useCallback, useState, useMemo } from "react";

export interface VirtualRow {
    index: number;
    top: number;
    height: number;
}

export function useWindowVirtualizer({
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

    const [range, setRange] = useState(() => ({
        start: 0,
        end: Math.min(overscan * 4, rowCount),
        visibleEnd: rowCount > 0 ? Math.min(10, rowCount) : 0
    }));

    const computeRange = useCallback(() => {
        if (!containerRef.current || rowCount === 0 || rowHeight <= 0) return;

        const containerTop =
            containerRef.current.getBoundingClientRect().top + window.scrollY;

        const scrollTop = window.scrollY;
        const viewHeight = window.innerHeight;

        const relScroll = Math.max(0, scrollTop - containerTop);

        const visibleEnd = Math.min(
            rowCount,
            Math.ceil((relScroll + viewHeight) / rowHeight)
        );

        const start = Math.max(0, Math.floor(relScroll / rowHeight) - overscan);
        const end = Math.min(
            rowCount,
            visibleEnd + overscan
        );

        setRange((prev) =>
            prev.start === start && prev.end === end && prev.visibleEnd === visibleEnd
                ? prev
                : { start, end, visibleEnd }
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
    }, [range.start, range.end, rowHeight]);

    return {
        containerRef,
        virtualRows,
        totalHeight: rowCount * rowHeight + extraHeight,
        startIndex: range.start,
        endIndex: range.end,
        visibleEndIndex: range.visibleEnd
    };
}
