import { useState, useEffect, useCallback } from "react";

interface UseCountdownReturn {
    timeLeft: number;
    formattedTime: string;
    isExpired: boolean;
    isActive: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
    set: (seconds: number) => void;
}

export const useCountdown = (initialSeconds: number = 60, autoStart: boolean = true): UseCountdownReturn => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(autoStart);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const start = useCallback(() => setIsActive(true), []);
    const pause = useCallback(() => setIsActive(false), []);
    const reset = useCallback(() => {
        setTimeLeft(initialSeconds);
        setIsActive(true);
    }, [initialSeconds]);

    const set = useCallback((seconds: number) => {
        setTimeLeft(seconds);
        setIsActive(true);
    }, []);

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formattedTime = `${mins}:${secs.toString().padStart(2, "0")}`;

    return {
        timeLeft,
        formattedTime,
        isExpired: timeLeft === 0,
        isActive,
        start,
        pause,
        reset,
        set
    };
};
