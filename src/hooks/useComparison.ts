'use client';

import { useState, useEffect, useCallback } from 'react';

const KEY     = 'kayan_compare';
const MAX     = 3;

export interface CompareItem {
  id:       string;
  slug:     string;
  title_ar: string;
  price:    number;
  area_m2:  number;
  rooms?:   number | null;
  district: string;
  type:     string;
  image?:   string;
}

function readStorage(): CompareItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function useComparison() {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    setItems(readStorage());
  }, []);

  const toggle = useCallback((item: CompareItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      let next: CompareItem[];
      if (exists) {
        next = prev.filter(i => i.id !== item.id);
      } else if (prev.length >= MAX) {
        next = prev; // silent max cap
      } else {
        next = [...prev, item];
      }
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setItems([]);
  }, []);

  const isInComparison = useCallback(
    (id: string) => items.some(i => i.id === id),
    [items]
  );

  return { items, toggle, remove, clear, isInComparison, isFull: items.length >= MAX };
}
