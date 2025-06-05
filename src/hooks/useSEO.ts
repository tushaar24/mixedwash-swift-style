
import { useEffect } from 'react';
import { updatePageSEO } from '@/utils/seo';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
}

export const useSEO = (seoData: SEOData) => {
  useEffect(() => {
    updatePageSEO(seoData);
    
    // Cleanup function to reset to default values when component unmounts
    return () => {
      // You could reset to default values here if needed
    };
  }, [seoData]);
};
