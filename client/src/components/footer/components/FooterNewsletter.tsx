import React, { useState } from "react";
import { Send } from "lucide-react";

export const FooterNewsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail("");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold font-orbitron text-white">
        Join Our Newsletter
      </h3>
      <p className="text-gray-400">
        Stay updated with the latest tournaments and gaming news.
      </p>

      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
          required
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-cyan-500 text-white hover:bg-cyan-600 transition-all duration-300 group-hover:scale-105"
        >
          <Send size={16} className="group-hover:animate-pulse" />
        </button>
      </form>
    </div>
  );
};
