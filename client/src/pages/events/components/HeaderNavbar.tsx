import BackButtonPage from "@/components/elements/ShowBackButton";
import { ProfileAvatar } from "@/components/navbar/components/ProfileAvatar";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full flex items-center bg-transparent justify-between px-6 py-4 z-50">
      {/* Left Side: Logo */}
      <div>
        <BackButtonPage />
      </div>
      {/* Right Side: Profile and Team */}
      <div className="flex items-center space-x-6 text-white">
        <ProfileAvatar />
      </div>
    </nav>
  );
};

export default Navbar;
