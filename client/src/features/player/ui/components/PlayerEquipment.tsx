import React from "react";
import { Mouse, Keyboard, Headphones, Monitor, Cpu, Settings2, ShieldOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User } from "@/features/auth/lib/types";

interface PlayerEquipmentProps {
  player: User;
}

export const PlayerEquipment: React.FC<PlayerEquipmentProps> = ({ player }) => {
  const equipment = player.equipment || [];

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("mouse") || l.includes("pointer")) return Mouse;
    if (l.includes("keyboard") || l.includes("input")) return Keyboard;
    if (l.includes("headset") || l.includes("acoustic") || l.includes("phone")) return Headphones;
    if (l.includes("monitor") || l.includes("visual")) return Monitor;
    if (l.includes("cpu") || l.includes("mainframe") || l.includes("gpu")) return Cpu;
    return Settings2;
  };

  const getColor = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("mouse")) return { color: "text-blue-500", glow: "shadow-blue-500/10" };
    if (l.includes("keyboard")) return { color: "text-purple-500", glow: "shadow-purple-500/10" };
    if (l.includes("headset")) return { color: "text-rose-500", glow: "shadow-rose-500/10" };
    if (l.includes("monitor")) return { color: "text-emerald-500", glow: "shadow-emerald-500/10" };
    if (l.includes("cpu")) return { color: "text-cyan-500", glow: "shadow-cyan-500/10" };
    return { color: "text-amber-500", glow: "shadow-amber-500/10" };
  };

  if (equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#0d091a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl text-center">
        <div className="p-6 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
          <ShieldOff className="w-12 h-12 text-rose-400 opacity-50" />
        </div>
        <h3 className="text-2xl font-black tracking-tighter text-white mb-2">Setup Unavailable</h3>
        <p className="text-sm text-white/40 max-w-sm">Tactical equipment data for this operative is classified or not yet configured.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {equipment.map((item, index) => {
        const Icon = getIcon(item.label);
        const style = getColor(item.label);
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
          >
            <Card className={`group relative bg-[#0d091a]/40 backdrop-blur-3xl border-white/5 rounded-[2rem] p-8 overflow-hidden transition-all duration-500 hover:border-violet-500/40 shadow-2xl ${style.glow}`}>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
                <Icon className="w-24 h-24 rotate-12" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className={`p-4 rounded-2xl bg-white/[0.03] border border-white/5 w-fit ${style.color} group-hover:bg-violet-500/10 group-hover:text-violet-400 transition-all shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/30 tracking-[0.3em]">{item.label}</p>
                  <p className="text-xl font-black text-white tracking-tighter leading-tight group-hover:text-violet-300 transition-colors">
                    {item.value}
                  </p>
                  <p className="text-[10px] font-bold text-white/20 tracking-[0.1em]">{item.sub}</p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black tracking-widest text-white/40">Verified Setup</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(bit => <div key={bit} className="w-1 h-1 rounded-full bg-violet-500" />)}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
