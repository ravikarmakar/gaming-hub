import { motion } from "framer-motion";
import { Shield, Database, AlertTriangle, Activity } from "lucide-react";
import { AdminLayout } from "./layout/AdminLayout";

const stats = [
  { icon: Shield, label: "Admin Users", value: "24", change: "+2" },
  { icon: Database, label: "System Load", value: "42%", change: "-5%" },
  { icon: AlertTriangle, label: "Security Alerts", value: "3", change: "-2" },
  { icon: Activity, label: "System Uptime", value: "99.9%", change: "+0.1%" },
];

export default function SuperAdminDashboard() {
  return (
    <AdminLayout requiredRole="super-admin">
      <div className="space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Super Admin Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 p-6 rounded-xl border border-purple-800"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <stat.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-purple-400 text-sm">
                <Activity className="w-4 h-4 mr-1" />
                {stat.change} this week
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
