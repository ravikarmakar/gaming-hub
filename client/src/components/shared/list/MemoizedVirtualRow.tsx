import { memo, ReactNode } from "react";

export interface MemoizedVirtualRowProps {
    rowIndex: number;
    top: number;
    height: number;
    rowGap: number;
    renderRow: (rowIndex: number) => ReactNode;
}

export const MemoizedVirtualRow = memo(
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
