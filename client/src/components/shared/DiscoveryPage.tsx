import { ReactNode } from "react";
import { ResourceGridWrapper } from "@/components/shared/ResourceGridWrapper";

export interface DiscoveryPageProps<T> {
    title: ReactNode;
    description: string;
    stats: {
        label: string;
        value: number;
    };
    isLoading: boolean;
    isEmpty: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    emptyMessage: string;
    filters: ReactNode;
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    isFetchingMore?: boolean;
    virtualize?: boolean;
    itemHeight?: number;
    columns?: number;
}

export const DiscoveryPage = <T,>({
    title,
    description,
    stats,
    isLoading,
    isEmpty,
    hasMore,
    onLoadMore,
    emptyMessage,
    filters,
    items,
    renderItem,
    isFetchingMore = false,
    virtualize = false,
    itemHeight,
    columns,
}: DiscoveryPageProps<T>) => {
    return (
        <ResourceGridWrapper
            title={title}
            description={description}
            stats={stats}
            isLoading={isLoading}
            isEmpty={isEmpty}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            emptyMessage={emptyMessage}
            filters={filters}
            isFetchingMore={isFetchingMore}
            items={items}
            renderItem={renderItem}
            virtualize={virtualize}
            itemHeight={itemHeight}
            columns={columns}
        >
            {!virtualize && items.map((item, index) => renderItem(item, index))}
        </ResourceGridWrapper>
    );
};
