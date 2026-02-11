import { getErrorMessage } from "./utils";

/**
 * A utility to wrap async store actions and handle loading/error states automatically.
 * 
 * @param set The Zustand set function
 * @param fn The async function to execute
 * @param errorMessage The default error message to use if the async function fails
 * @param loadingKey The key in the state to track loading status (default: 'isLoading')
 * @param errorKey The key in the state to track error status (default: 'error')
 */
export const runAsync = async <T>(
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    fn: () => Promise<any>,
    errorMessage: string,
    loadingKey: keyof T = 'isLoading' as keyof T,
    errorKey: keyof T = 'error' as keyof T
) => {
    set({ [loadingKey]: true, [errorKey]: null } as unknown as Partial<T>);
    try {
        const result = await fn();
        set({ [loadingKey]: false } as unknown as Partial<T>);
        return { success: true, data: result };
    } catch (error) {
        const msg = getErrorMessage(error, errorMessage);
        set({
            [loadingKey]: false,
            [errorKey]: msg
        } as unknown as Partial<T>);
        return { success: false, error, message: msg };
    }
};
