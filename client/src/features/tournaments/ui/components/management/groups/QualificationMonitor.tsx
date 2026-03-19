interface QualificationMonitorProps {
    qualifiedCount: number;
    targetCount: number;
    label?: string;
}

export const QualificationMonitor = ({ qualifiedCount, targetCount, label = 'Qualified' }: QualificationMonitorProps) => {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/40 border border-white/5 rounded-xl backdrop-blur-sm shadow-sm ring-1 ring-white/5">
            <div className="flex flex-col justify-center">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1.5">
                    {label}
                </span>
                <div className="flex items-center gap-1.5">
                    <span className={`text-xl font-black tracking-tight leading-none ${qualifiedCount >= targetCount ? 'text-green-400' : 'text-white'}`}>
                        {qualifiedCount}
                    </span>
                    <span className="text-gray-700 font-bold text-sm">/</span>
                    <span className="text-xl font-black text-gray-400 leading-none">
                        {targetCount}
                    </span>
                </div>
            </div>
        </div>
    );
};
