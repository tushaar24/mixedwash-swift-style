import { useState, useRef, useEffect, ReactNode } from "react";

interface LazyLoadOnScrollProps {
  children: ReactNode;
  placeholder: ReactNode;
  rootMargin?: string;
}

const LazyLoadOnScroll = ({ children, placeholder, rootMargin = "200px" }: LazyLoadOnScrollProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin]);

  return <div ref={ref}>{isVisible ? children : placeholder}</div>;
};

export default LazyLoadOnScroll; 