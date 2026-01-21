import toast from "react-hot-toast";

const TOAST_STYLE = {
    borderRadius: "10px",
    background: "#24132aff",
    color: "#fff",
};

export const showSuccessToast = (message: string, icon = "🎮") => {
    toast.success(message, {
        icon,
        style: TOAST_STYLE,
    });
};

export const showErrorToast = (message: string, icon = "❌") => {
    toast.error(message, {
        icon,
        style: TOAST_STYLE,
    });
};

export const showWarningToast = (message: string, icon = "⚠️") => {
    toast.error(message, {
        icon,
        style: TOAST_STYLE,
    });
};
