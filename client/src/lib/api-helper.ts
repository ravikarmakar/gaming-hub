import axios from "axios";
import { toast } from "react-hot-toast";

export const handleApiError = (error: unknown, fallbackMessage = "Something went wrong") => {
    let message = fallbackMessage;

    if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || fallbackMessage;
    } else if (error instanceof Error) {
        message = error.message;
    }

    toast.error(message);
    console.error("API Error:", error);
    return message;
};
