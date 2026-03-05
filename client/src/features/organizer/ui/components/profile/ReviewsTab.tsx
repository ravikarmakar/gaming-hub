import { Star } from "lucide-react";

export const ReviewsTab = () => {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="p-8 border border-gray-800 bg-gray-900/50 backdrop-blur-sm rounded-2xl">
                <h3 className="mb-6 text-2xl font-bold">Reviews & Ratings</h3>
                <div className="flex items-center gap-8 mb-8">
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-yellow-400">
                            4.9
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className="w-5 h-5 text-yellow-400 fill-current"
                                />
                            ))}
                        </div>
                        <div className="text-sm text-gray-400">
                            234 reviews
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="w-4 text-sm text-gray-400">{rating}</span>
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <div className="flex-1 h-2 bg-gray-800 rounded-full">
                                    <div
                                        className="h-2 bg-yellow-400 rounded-full"
                                        style={{
                                            width: `${rating === 5 ? 80 : rating === 4 ? 15 : 5}%`,
                                        }}
                                    />
                                </div>
                                <span className="w-8 text-sm text-gray-400">
                                    {rating === 5 ? "80%" : rating === 4 ? "15%" : "5%"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="p-6 border border-gray-800 bg-gray-900/50 backdrop-blur-sm rounded-2xl"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=40&h=40&fit=crop&crop=face`}
                                alt="Reviewer"
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <div className="font-medium">Player{i}</div>
                                <div className="flex items-center gap-2">
                                    {[...Array(5)].map((_, j) => (
                                        <Star
                                            key={j}
                                            className="w-4 h-4 text-yellow-400 fill-current"
                                        />
                                    ))}
                                    <span className="text-sm text-gray-400">2 days ago</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-300">
                            Amazing tournament organization! Everything ran smoothly and the
                            prizes were distributed quickly. Definitely participating in
                            future events.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
