import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { AuthLayout } from "./components/AuthLayout";
import { AuthInput } from "./components/AuthInput";
import { AuthButton } from "./components/AuthButton";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import toast from "react-hot-toast";

export interface FormDataType {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useUserStore();
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    password: "",
    termsAccepted: false,
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(formData);
      navigate("/");

      setFormData({
        name: "",
        email: "",
        password: "",
        termsAccepted: false,
      });
      useUserStore.setState({ error: null });
    } catch (error) {
      // Handle error (if any) not already handled by zustand
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      // Only show the error if it's not already handled by zustand
      if (errorMessage && errorMessage !== error) {
        useUserStore.setState({ error: errorMessage });
        toast.error(errorMessage);
      }
    }
  };

  return (
    <AuthLayout
      title="Join GameVerse"
      subtitle="Begin your epic gaming adventure!"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-500 p-2 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        <AuthInput
          name="name"
          label="name"
          placeholder="Choose your name"
          icon={<User size={18} />}
          value={formData.name}
          onChange={handleChange}
        />

        <AuthInput
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          icon={<Mail size={18} />}
          value={formData.email}
          onChange={handleChange}
        />

        <AuthInput
          name="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          icon={<Lock size={18} />}
          value={formData.password}
          onChange={handleChange}
        />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              name="termsAccepted"
              required
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-800 p-2"
              // aria-invalid={!!errors.termsAccepted}
            />
            <span>
              I agree to the{" "}
              <a
                href="#"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Privacy Policy
              </a>
            </span>
          </div>
          {/* {error.termsAccepted && (
            <p className="text-red-500 text-sm">{error.termsAccepted}</p>
          )} */}
        </div>

        <AuthButton type="submit" isLoading={isLoading}>
          Create Account
        </AuthButton>

        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Login here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;

// import { motion } from "framer-motion";
// import { Gamepad2, Mail, Lock, User, AtSign } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";

// const SignUpPage = () => {
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     // Simulate API call
//     await new Promise((resolve) => setTimeout(resolve, 1500));
//     setIsLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
//       {/* Background Effects */}
//       <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
//       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />

//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="w-full max-w-md relative"
//       >
//         {/* Logo and Title */}
//         <div className="text-center mb-8">
//           <motion.div
//             initial={{ y: -20 }}
//             animate={{ y: 0 }}
//             className="flex justify-center mb-4"
//           >
//             <Gamepad2 className="w-12 h-12 text-cyan-400" />
//           </motion.div>
//           <motion.h1
//             initial={{ y: -20 }}
//             animate={{ y: 0 }}
//             className="text-3xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-purple-600 text-transparent bg-clip-text"
//           >
//             Join the Game
//           </motion.h1>
//           <motion.p
//             initial={{ y: -20 }}
//             animate={{ y: 0 }}
//             className="text-gray-400 mt-2"
//           >
//             Create your account and start playing
//           </motion.p>
//         </div>

//         {/* Signup Form */}
//         <motion.div
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800"
//         >
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-4">
//               {/* Username Input */}
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <Input
//                   type="text"
//                   placeholder="Username"
//                   className="pl-10 bg-gray-800/50 border-gray-700 focus:border-cyan-500 text-white"
//                   required
//                 />
//               </div>

//               {/* Email Input */}
//               <div className="relative">
//                 <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <Input
//                   type="email"
//                   placeholder="Email address"
//                   className="pl-10 bg-gray-800/50 border-gray-700 focus:border-cyan-500 text-white"
//                   required
//                 />
//               </div>

//               {/* Password Input */}
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <Input
//                   type="password"
//                   placeholder="Password"
//                   className="pl-10 bg-gray-800/50 border-gray-700 focus:border-cyan-500 text-white"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Terms Checkbox */}
//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 id="terms"
//                 className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
//                 required
//               />
//               <label htmlFor="terms" className="text-sm text-gray-400">
//                 I agree to the{" "}
//                 <a href="#" className="text-cyan-400 hover:text-cyan-300">
//                   Terms of Service
//                 </a>{" "}
//                 and{" "}
//                 <a href="#" className="text-cyan-400 hover:text-cyan-300">
//                   Privacy Policy
//                 </a>
//               </label>
//             </div>

//             {/* Submit Button */}
//             <Button
//               type="submit"
//               className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <motion.div
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                 >
//                   <Mail className="w-5 h-5 animate-spin" />
//                 </motion.div>
//               ) : (
//                 "Create Account"
//               )}
//             </Button>

//             {/* Login Link */}
//             <div className="text-center text-gray-400 text-sm">
//               Already have an account?{" "}
//               <a href="/login" className="text-cyan-400 hover:text-cyan-300">
//                 Log in
//               </a>
//             </div>
//           </form>
//         </motion.div>

//         {/* Social Proof */}
//         <motion.div
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.4 }}
//           className="mt-8 text-center text-gray-400 text-sm"
//         >
//           <p>Join 1M+ gamers worldwide</p>
//           <div className="flex justify-center items-center gap-2 mt-2">
//             <div className="w-2 h-2 rounded-full bg-cyan-400" />
//             <div className="w-2 h-2 rounded-full bg-purple-400" />
//             <div className="w-2 h-2 rounded-full bg-cyan-400" />
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// };

// export default SignUpPage;
