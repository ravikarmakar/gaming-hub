import { motion } from "framer-motion";
import { Shield, Edit, Trash2, Plus } from "lucide-react";

const adminUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "super-admin",
    lastActive: "5 mins ago",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "admin",
    lastActive: "1 day ago",
  },
];

export function AdminManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold">Admin Management</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center gap-2 hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </motion.button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Role
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Last Active
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((admin, index) => (
              <motion.tr
                key={admin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-800 last:border-0"
              >
                <td className="px-6 py-4">{admin.name}</td>
                <td className="px-6 py-4 text-gray-400">{admin.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      admin.role === "super-admin"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-cyan-500/10 text-cyan-400"
                    }`}
                  >
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{admin.lastActive}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
