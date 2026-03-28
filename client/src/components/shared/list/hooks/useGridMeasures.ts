import { useState, useEffect, useRef } from "react";

function getColumns(width: number): number {
    if (width > 1200) return 4;
    if (width > 900) return 3;
    if (width > 600) return 2;
    return 1;
}

/**
 * Hook to manage grid measurements and column calculation.
 */
export const useGridMeasures = (fixedColumns?: number, itemHeight = 320, rowGap = 16, shouldVirtualize = false) => {
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

    return { widthContainerRef, containerWidth, columns, rowHeight };
};
