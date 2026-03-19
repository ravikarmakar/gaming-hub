import { ListOrdered } from "lucide-react";

export function PointsTab() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <ListOrdered size={48} className="text-gray-400 mb-2" />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Points Distribution</h3>
                <p className="text-gray-500 max-w-sm text-sm">Detailed scoring mechanics and point distribution for this tournament will be listed here.</p>
            </div>
        </div>
    );
}
