
import { useState, useEffect } from 'react';

export type HomepageVersion = 'v1' | 'v2';

export const useHomepageVersion = () => {
  const [version, setVersion] = useState<HomepageVersion>(() => {
    const stored = localStorage.getItem('homepage-version');
    return (stored as HomepageVersion) || 'v1';
  });

  const toggleVersion = () => {
    const newVersion: HomepageVersion = version === 'v1' ? 'v2' : 'v1';
    setVersion(newVersion);
    localStorage.setItem('homepage-version', newVersion);
  };

  useEffect(() => {
    localStorage.setItem('homepage-version', version);
  }, [version]);

  return { version, toggleVersion };
};
