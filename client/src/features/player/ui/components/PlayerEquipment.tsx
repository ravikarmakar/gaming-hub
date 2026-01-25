import React from "react";
import { Mouse, Keyboard, Headphones, Monitor, Cpu, Settings2, Laptop, Tablet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export const PlayerEquipment: React.FC = () => {
  const setup = [
    { label: "Precision Pointer", value: "Logitech G Pro X Superlight 2", sub: "800 DPI | 4K Polling", icon: Mouse, color: "text-blue-500", glow: "shadow-blue-500/10" },
    { label: "Tactical Input", value: "SteelSeries Apex Pro TKL", sub: "OmniPoint 2.0 Switches", icon: Keyboard, color: "text-purple-500", glow: "shadow-purple-500/10" },
    { label: "Acoustic Sensors", value: "HyperX Cloud III Wireless", sub: "DTS Headphone:X v2", icon: Headphones, color: "text-rose-500", glow: "shadow-rose-500/10" },
    { label: "Visual Interface", value: "ASUS ROG Swift 540Hz", sub: "0.03ms Response Time", icon: Monitor, color: "text-emerald-500", glow: "shadow-emerald-500/10" },
    { label: "Combat Throne", value: "Secretlab Titan Evo 2024", sub: "SK-II Leatherette", icon: Settings2, color: "text-amber-500", glow: "shadow-amber-500/10" },
    { label: "Mainframe", value: "RTX 4090 | i9-14900K", sub: "64GB DDR5 XMP 8000", icon: Cpu, color: "text-cyan-500", glow: "shadow-cyan-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {setup.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -5 }}
        >
          <Card className={`group relative bg-[#0d091a]/40 backdrop-blur-3xl border-white/5 rounded-[2rem] p-8 overflow-hidden transition-all duration-500 hover:border-violet-500/40 shadow-2xl ${item.glow}`}>
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
              <item.icon className="w-24 h-24 rotate-12" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className={`p-4 rounded-2xl bg-white/[0.03] border border-white/5 w-fit ${item.color} group-hover:bg-violet-500/10 group-hover:text-violet-400 transition-all shadow-inner`}>
                <item.icon className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic">{item.label}</p>
                <p className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight group-hover:text-violet-300 transition-colors">
                  {item.value}
                </p>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.1em]">{item.sub}</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Verified Setup</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(bit => <div key={bit} className="w-1 h-1 rounded-full bg-violet-500" />)}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
