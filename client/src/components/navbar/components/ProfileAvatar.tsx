import { memo } from "react";
import { Link } from "react-router-dom";

export const ProfileAvatar = memo(() => (
  <Link to="/profile" className="flex items-center space-x-2 text-white">
    <img
      src="https://plus.unsplash.com/premium_photo-1682089877310-b2308b0dc719?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt="Profile Avatar"
      className="w-10 h-10 rounded-full object-cover"
    />
  </Link>
));
