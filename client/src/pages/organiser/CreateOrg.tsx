import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ZodError } from "zod";
import { Building2, Tag, Mail, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import Input from "@/components/ui/input";
import { orgSchema } from "@/schemas/org/createOrg";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useOrganizerStore } from "@/store/useOrganizer";
import FileUpload from "@/components/FileUplaod";

// Interface for organization data
interface OrgFormData {
  name: string;
  tag: string;
  email: string;
  image: File | null;
  description: string;
}

// Interface for validation errors
interface OrgFormErrors {
  name?: string[];
  tag?: string[];
  email?: string[];
  image?: string[];
  description?: string[];
}

const CreateOrgForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OrgFormData>({
    name: "",
    tag: "",
    email: "",
    image: null,
    description: "",
  });

  const [errors, setErrors] = useState<OrgFormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuthStore();
  const { createOrg, isLoading, error } = useOrganizerStore();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tag" ? value.toUpperCase() : value,
    }));

    // Clear errors when field is edited
    if (errors[name as keyof OrgFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  // Handle file upload
  const handleFileUpload = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }));
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  // Validate form usning Zod schema
  const validateForm = (): boolean => {
    try {
      orgSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: OrgFormErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof OrgFormErrors;
          formattedErrors[field] = [err.message];
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const orgData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && value) {
        orgData.append(key, value); // File object
      } else if (value !== null && value !== undefined) {
        orgData.append(key, value.toString());
      }
    });

    for (const pair of orgData.entries()) {
      console.log(pair[0], pair[1]);
    }

    if (!orgData) throw new Error("Form data is empty");

    const result = await createOrg(orgData);
    if (result) {
      setIsSuccess(true);
      navigate("/organizer");
      toast.success("Organization created successfully!");
      setFormData({
        name: "",
        tag: "",
        email: "",
        image: null,
        description: "",
      });
    } else {
      setIsSuccess(false);
      toast.error(error);
    }
  };

  if (user?.orgId || !user?.canCreateOrg) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 pt-32 pb-20 bg-gradient-to-br from-purple-900/40 via-black to-purple-80/40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl p-6 mx-auto bg-gray-900 border border-gray-800 shadow-xl rounded-xl"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text">
            Create New Organization
          </h1>
          <p className="mt-2 text-gray-400">
            Fill in the details below to set up your organization
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Organization Name */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Input
                name="name"
                label="Organization Name"
                value={formData.name}
                onChange={handleInputChange}
                icon={<Building2 size={18} />}
                placeholder="Acme Corporation"
                error={errors.name}
                required
              />
            </motion.div>

            {/* Organization Tag */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Input
                name="tag"
                label="Organization Tag"
                value={formData.tag}
                onChange={handleInputChange}
                icon={<Tag size={18} />}
                placeholder="ACM"
                hint="2-5 uppercase letters"
                error={errors.tag}
                required
                maxLength={5}
                autoCapitalize="characters"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.toUpperCase();
                }}
              />
            </motion.div>
          </div>

          {/* Organization Email */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Input
              name="email"
              label="Contact Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              icon={<Mail size={18} />}
              placeholder="contact@organization.com"
              error={errors.email}
              required
            />
          </motion.div>

          {/* Logo Upload */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FileUpload
              label="Organization Logo"
              name="image"
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              error={
                Array.isArray(errors.image)
                  ? errors.image.join(", ")
                  : errors.image ?? ""
              }
              onChange={handleFileUpload}
              hint="SVG, PNG, JPG or GIF (max 5MB)"
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-1.5"
          >
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-200"
            >
              Description
            </label>

            <div className="relative group">
              <div
                className={`
                absolute -inset-0.5 rounded-lg blur-sm opacity-20 group-hover:opacity-30
                bg-gradient-to-r from-purple-600 to-blue-600 transition-opacity duration-300
              `}
              ></div>

              <div className="relative transition-all duration-300 border border-gray-700 rounded-lg bg-gray-900/80 group-hover:border-gray-600">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none text-gray-500 group-hover:text-gray-400">
                  <FileText size={18} />
                </div>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full pl-10 pr-3 py-2.5 text-base bg-transparent rounded-lg 
                  outline-none transition-all duration-300
                  text-white placeholder-gray-500 focus:placeholder-gray-400"
                  placeholder="Tell us about your organization..."
                  aria-invalid={!!errors.description}
                  aria-describedby={
                    errors.description ? `description-error` : undefined
                  }
                />
              </div>
            </div>

            <AnimatePresence>
              {errors.description && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1"
                >
                  {errors.description.map((errMsg, index) => (
                    <p
                      key={index}
                      className="flex items-center gap-1.5 text-xs text-red-400"
                      role="alert"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      <span>{errMsg}</span>
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="pt-4"
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-center px-4 py-3 font-medium text-green-400 rounded-lg bg-green-500/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Organization created successfully!
                </motion.div>
              ) : (
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`
                  w-full py-3 px-4 rounded-lg font-medium
                  transition-all duration-300 relative overflow-hidden
                  ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}
                  bg-gradient-to-r from-purple-600 to-blue-700
                  hover:from-purple-700 hover:to-blue-800
                  active:from-purple-800 active:to-blue-900
                  disabled:opacity-70
                `}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Organization...
                    </div>
                  ) : (
                    "Create Organization"
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateOrgForm;
