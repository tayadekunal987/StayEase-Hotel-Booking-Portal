import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();

const STORAGE_KEY = 'stayease_compare_hotels';
const MAX_COMPARE_LIMIT = 3;

export function CompareProvider({ children }) {
  // Initialize from localStorage if available
  const [compareIds, setCompareIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync with localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
    } catch (e) {
      console.warn('Failed to save comparison to localStorage:', e);
    }
  }, [compareIds]);

  const addToCompare = (hotelId) => {
    const numericId = Number(hotelId);
    if (compareIds.includes(numericId)) {
      removeFromCompare(numericId);
      return;
    }

    if (compareIds.length >= MAX_COMPARE_LIMIT) {
      toast.error(`You can compare up to ${MAX_COMPARE_LIMIT} hotels at a time. Please remove one first.`);
      return;
    }

    setCompareIds((prev) => [...prev, numericId]);
    toast.success('Hotel added to comparison!');
  };

  const removeFromCompare = (hotelId) => {
    const numericId = Number(hotelId);
    setCompareIds((prev) => prev.filter((id) => id !== numericId));
    toast.success('Hotel removed from comparison.');
  };

  const clearCompare = () => {
    setCompareIds([]);
    toast.success('Comparison list cleared.');
  };

  const isInCompare = (hotelId) => compareIds.includes(Number(hotelId));

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        maxLimit: MAX_COMPARE_LIMIT,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

