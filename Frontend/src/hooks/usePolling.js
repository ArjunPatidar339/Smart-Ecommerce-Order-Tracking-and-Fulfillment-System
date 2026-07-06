import { useEffect } from 'react';

/**
 * Custom hook for polling data with automatic cleanup
 * @param {Function} fetchFunction - The async function to call
 * @param {number} interval - Polling interval in milliseconds (default: 5000)
 * @param {Array} dependencies - Dependencies array to control when polling starts/stops
 */
export const usePolling = (fetchFunction, interval = 5000, dependencies = []) => {
    useEffect(() => {
        if (!fetchFunction) return;

        // Call fetch function immediately
        fetchFunction();

        // Set up interval for polling
        const pollingInterval = setInterval(() => {
            fetchFunction();
        }, interval);

        // Cleanup interval on component unmount or dependency change
        return () => clearInterval(pollingInterval);
    }, dependencies);
};

export default usePolling;
