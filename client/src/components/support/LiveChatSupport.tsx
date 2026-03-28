import { MessageSquare } from "lucide-react";

export const LiveChatSupport = () => {
    return (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/10 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Live Chat Support
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
                Need immediate assistance? Our support team is available Monday to Friday, 9am - 5pm EST.
            </p>
            <button
                disabled
                className="w-full flex items-center justify-center border border-purple-500/20 bg-purple-500/5 text-purple-200/50 rounded-xl h-10 text-sm font-bold opacity-50 cursor-not-allowed select-none"
                aria-label="Live chat support is coming soon"
            >
                Live Chat (Coming Soon)
            </button>
        </div>
    );
};
