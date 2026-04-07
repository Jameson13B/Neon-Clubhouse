import { useEffect, useState } from 'react';
import type { Product } from '../types/product';
import { subscribeProducts } from '../services/products';
import { isFirebaseConfigured } from '../lib/firebase';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setProducts([]);
      return;
    }
    setLoading(true);
    const unsub = subscribeProducts(
      (list) => {
        setProducts(list);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    return () => unsub?.();
  }, []);

  return { products, loading, error, configured: isFirebaseConfigured() };
}
