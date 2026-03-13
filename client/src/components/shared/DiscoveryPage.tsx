import { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
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
        >
            <AnimatePresence mode="popLayout">
                {items.map((item, index) => renderItem(item, index))}
            </AnimatePresence>
        </ResourceGridWrapper>
    );
};
