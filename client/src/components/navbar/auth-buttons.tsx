import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

export function AuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" className="text-gray-300 hover:text-white">
        <LogIn className="w-4 h-4 mr-2" />
        Login
      </Button>
      <Button className="bg-cyan-500 hover:bg-cyan-600">
        <UserPlus className="w-4 h-4 mr-2" />
        Sign Up
      </Button>
    </div>
  );
}
