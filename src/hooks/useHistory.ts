import { useState } from "react";

export type UseHistoryReturn<T> = {
    currentItem: T|undefined;
    isLast: boolean;
    addHistory: (item: T, elemsToRemove?: number) => void;
    clearHistory: (firstItem?: T) => void;
    canMoveBackward: boolean;
    canMoveForward: boolean;
    moveBackward: () => void;
    moveForward: () => void;
}

export const useHistory = <T extends any>(): UseHistoryReturn<T> => {
    const [ history, setHistory ] = useState<T[]>([]);
    const [ historyPos, setHistoryPos ] = useState(0);
    
    const addHistory = (item: T, elemsToRemove: number = 0) => {
        setHistory(oldHistory => {
            const newHistory = oldHistory.slice(historyPos).slice(elemsToRemove);
            newHistory.unshift(item);
            return newHistory;
        });
        setHistoryPos(0);
    };
    
    const clearHistory = (firstItem?: T) => {
        setHistory(firstItem 
            ? [firstItem] 
            : []);
        setHistoryPos(0);
    };

    const canMoveBackward = historyPos < history.length - 1;
    const canMoveForward = historyPos > 0;

    const moveBackward = () => {
        if (!canMoveBackward) return;
        setHistoryPos(oldPos => oldPos + 1);
    };

    const moveForward = () => {
        if (!canMoveForward) return;
        setHistoryPos(oldPos => oldPos - 1);
    };

    const isLast = historyPos === 0;
    const currentItem: T|undefined = history[historyPos];
    
    return { 
        currentItem, isLast,
        addHistory, clearHistory,
        canMoveBackward, canMoveForward,
        moveBackward, moveForward,
    };
}