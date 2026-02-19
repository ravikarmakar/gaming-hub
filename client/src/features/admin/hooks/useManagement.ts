import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useManagement = (type: "User" | "Team" | "Organizer") => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/admin/entities/${type}`, {
                params: { page, limit: 10, search },
                withCredentials: true
            });
            setData(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            console.error(`Error fetching ${type}s:`, error);
            toast.error(`Failed to fetch ${type}s`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [type, page, search]);

    const updateStatus = async (id: string, updates: any) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/admin/entities/${type}/${id}/status`, updates, {
                withCredentials: true
            });
            toast.success("Status updated successfully");
            fetchData();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    return { data, loading, total, page, setPage, setSearch, updateStatus };
};
