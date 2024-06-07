import { useEffect, useState } from "react";

type KeyFunction = () => string | undefined | null;

function useLocalStorage<T>(key: string | KeyFunction, initialValue: T) {
  let cacheKey: string | undefined = undefined;
  if (typeof key === "function") {
    const keyFnResult = key();
    if (keyFnResult) {
      cacheKey = keyFnResult;
    }
  } else {
    cacheKey = key;
  }
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (!cacheKey) {
        return initialValue;
      }
      const item = window.localStorage.getItem(cacheKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (cacheKey) {
        window.localStorage.setItem(cacheKey, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(error);
    }
  }, [storedValue, cacheKey]);

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
