import { useState, useEffect } from "react";

export const useUrlParams = () => {
  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setParams(urlParams);
  }, []);

  const getParam = (key: string): string | null => {
    return params?.get(key) || null;
  };

  const hasParam = (key: string): boolean => {
    return params?.has(key) || false;
  };

  return { getParam, hasParam, params };
};