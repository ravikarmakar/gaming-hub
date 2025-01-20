import { motion } from "framer-motion";
import { AdminLayout } from "./layout/AdminLayout";
import {
  Users,
  TowerControl as GameController,
  Trophy,
  TrendingUp,
} from "lucide-react";

const stats = [
  { icon: Users, label: "Total Users", value: "125,430", change: "+12.5%" },
  {
    icon: GameController,
    label: "Active Games",
    value: "1,240",
    change: "+8.2%",
  },
  { icon: Trophy, label: "Tournaments", value: "156", change: "+15.3%" },
  { icon: TrendingUp, label: "Revenue", value: "$1.2M", change: "+22.4%" },
];

export default function AdminDashboard() {
  return (
    <AdminLayout requiredRole="admin">
      <div className="space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 p-6 rounded-xl border border-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <stat.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-green-400 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                {stat.change} this month
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
