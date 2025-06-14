import { Trophy, Target, TrendingUp, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const PlayerActivity = () => {
  const recentActivity = [
    {
      id: "1",
      type: "achievement",
      title: "New Achievement Unlocked!",
      description: 'Earned "Sharpshooter" achievement',
      timestamp: "2 hours ago",
      icon: <Trophy className="w-4 h-4 text-yellow-500" />,
    },
    {
      id: "2",
      type: "rank_up",
      title: "Rank Up!",
      description: "Promoted to Diamond II in Valorant",
      timestamp: "1 day ago",
      icon: <TrendingUp className="w-4 h-4 text-green-500" />,
    },
    {
      id: "3",
      type: "match",
      title: "Victory!",
      description: "Won a competitive match in CS2",
      timestamp: "2 days ago",
      icon: <Target className="w-4 h-4 text-blue-500" />,
    },
    {
      id: "4",
      type: "friend",
      title: "New Friend",
      description: "Connected with ProGamer123",
      timestamp: "3 days ago",
      icon: <Users className="w-4 h-4 text-purple-500" />,
    },
  ];

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Activity Feed</CardTitle>
        <CardDescription>Your complete gaming activity history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentActivity.map((activity, index) => (
            <div key={activity.id}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">{activity.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{activity.title}</h4>
                  <p className="mt-1 text-sm text-gray-400">
                    {activity.description}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
              {index < recentActivity.length - 1 && (
                <Separator className="mt-6 bg-gray-800" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
