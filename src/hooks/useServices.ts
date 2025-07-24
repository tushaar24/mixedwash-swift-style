import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  icon: string;
  created_at: string;
  updated_at: string;
}

// Global cache to prevent duplicate requests
let servicesCache: Service[] | null = null;
let cachePromise: Promise<Service[]> | null = null;

export const useServices = () => {
  const [services, setServices] = useState<Service[]>(servicesCache || []);
  const [loading, setLoading] = useState(!servicesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have cached data, use it
    if (servicesCache) {
      setServices(servicesCache);
      setLoading(false);
      return;
    }

    // If there's already a request in progress, use it
    if (cachePromise) {
      cachePromise.then((data) => {
        setServices(data);
        setLoading(false);
      }).catch((err) => {
        setError(err.message);
        setLoading(false);
      });
      return;
    }

    // Make the actual request
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Cache the result
        servicesCache = data || [];
        setServices(servicesCache);
        setError(null);
        
        return servicesCache;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch services';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
        cachePromise = null;
      }
    };

    cachePromise = fetchServices();
  }, []);

  return { services, loading, error };
};