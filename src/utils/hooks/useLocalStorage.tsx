import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  const setValue = (value: T) => {
    setStoredValue(value);
  };

  return [storedValue, setValue] as const;
}

export default useLocalStorage;

export function readValueFromLocalStorage<T>(key: string, defaultValue: T) {
  const item = window.localStorage.getItem(key);
  if (!item) {
    window.localStorage.setItem(key, JSON.stringify(defaultValue));
  }

  return item ? (JSON.parse(item) as T) : defaultValue;
}
