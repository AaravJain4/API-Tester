import { useState, useEffect } from 'react';

export const useHistory = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('apiHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const addToHistory = (historyItem) => {
        const newHistory = [historyItem, ...history].slice(0, 50);
        setHistory(newHistory);
        localStorage.setItem('apiHistory', JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('apiHistory');
    };

    return {
        history,
        addToHistory,
        clearHistory,
    };
};
