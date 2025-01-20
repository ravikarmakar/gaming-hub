import { motion } from "framer-motion";
import { Database, Server, Globe, Shield, Save } from "lucide-react";

const settingsSections = [
  {
    icon: Server,
    title: "Server Configuration",
    settings: [
      { label: "Max Concurrent Users", type: "number", value: "10000" },
      { label: "Request Timeout (ms)", type: "number", value: "5000" },
    ],
  },
  {
    icon: Shield,
    title: "Security Settings",
    settings: [
      { label: "Two-Factor Authentication", type: "toggle", value: true },
      { label: "Session Timeout (mins)", type: "number", value: "30" },
    ],
  },
  {
    icon: Globe,
    title: "API Configuration",
    settings: [
      { label: "API Rate Limit", type: "number", value: "100" },
      { label: "API Key Expiry (days)", type: "number", value: "90" },
    ],
  },
];

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold">System Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-gray-900 p-6 rounded-xl border border-gray-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <section.icon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">{section.title}</h3>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting, index) => (
                <motion.div
                  key={setting.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.1 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <label className="text-gray-400">{setting.label}</label>
                  {setting.type === "toggle" ? (
                    <div
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                        setting.value ? "bg-purple-500" : "bg-gray-700"
                      }`}
                    >
                      <motion.div
                        initial={false}
                        animate={{ x: setting.value ? "24px" : "0" }}
                        className="w-4 h-4 bg-white rounded-full"
                      />
                    </div>
                  ) : (
                    <input
                      type={setting.type}
                      value={setting.value}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-right w-32"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 px-6 py-3 bg-purple-500 text-white rounded-lg flex items-center gap-2 hover:bg-purple-600 transition-colors shadow-lg"
      >
        <Save className="w-4 h-4" />
        Save Changes
      </motion.button>
    </div>
  );
}
