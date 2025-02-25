import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { memo } from "react";

export const Logo = memo(() => (
  <Link to="/" className="flex items-center space-x-2">
    <Gamepad2 className="hidden md:block w-8 h-8 text-purple-500" />
    <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
      GmareX
    </span>
  </Link>
));
