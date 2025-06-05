
interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
}

export const updatePageSEO = (seoData: SEOData) => {
  // Update title
  document.title = seoData.title;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', seoData.description);
  }
  
  // Update keywords
  if (seoData.keywords) {
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seoData.keywords);
    }
  }
  
  // Update canonical URL
  if (seoData.canonical) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seoData.canonical);
  }
  
  // Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', seoData.title);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', seoData.description);
  }
  
  if (seoData.ogImage) {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', seoData.ogImage);
    }
  }
  
  // Update Twitter Card tags
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', seoData.title);
  }
  
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', seoData.description);
  }
};

export const seoPages = {
  home: {
    title: "MixedWash - Laundry Made Fun, Fast & Friendly | Bangalore Laundry Service",
    description: "Professional laundry and dry cleaning service in Bangalore. Next-day delivery, doorstep pickup & delivery. Reliable, affordable, and eco-friendly laundry solutions.",
    keywords: "laundry service bangalore, dry cleaning bangalore, doorstep laundry pickup, next day delivery laundry, professional laundry service, bangalore laundry, mixedwash",
    canonical: "https://mixedwash.in/"
  },
  auth: {
    title: "Login | Sign Up - MixedWash Bangalore",
    description: "Login or create your MixedWash account to schedule laundry pickup and delivery in Bangalore. Quick registration with mobile number verification.",
    keywords: "mixedwash login, signup laundry service, bangalore laundry account",
    canonical: "https://mixedwash.in/auth"
  },
  schedule: {
    title: "Schedule Laundry Pickup - MixedWash Bangalore",
    description: "Schedule your laundry pickup in Bangalore with MixedWash. Choose from wash & fold, dry cleaning, premium wash, and steam iron services.",
    keywords: "schedule laundry pickup bangalore, book laundry service, mixedwash booking",
    canonical: "https://mixedwash.in/schedule"
  },
  contact: {
    title: "Contact Us - MixedWash Bangalore Laundry Service",
    description: "Get in touch with MixedWash for laundry and dry cleaning services in Bangalore. Call +91-636-229-0686 or email contact@mixedwash.in",
    keywords: "mixedwash contact, bangalore laundry contact, laundry service phone number",
    canonical: "https://mixedwash.in/contact"
  },
  privacy: {
    title: "Privacy Policy - MixedWash",
    description: "Read MixedWash's privacy policy to understand how we collect, use, and protect your personal information.",
    canonical: "https://mixedwash.in/privacy"
  },
  terms: {
    title: "Terms & Conditions - MixedWash",
    description: "Read MixedWash's terms and conditions for our laundry and dry cleaning services in Bangalore.",
    canonical: "https://mixedwash.in/terms"
  },
  services: {
    washFold: {
      title: "Wash & Fold Service - MixedWash Bangalore",
      description: "Professional wash and fold laundry service in Bangalore. Fresh, clean clothes delivered next day at your doorstep. Book online now!",
      keywords: "wash and fold bangalore, laundry washing service, clothes washing bangalore",
      canonical: "https://mixedwash.in/service/wash-fold"
    },
    dryClean: {
      title: "Dry Cleaning Service - MixedWash Bangalore", 
      description: "Premium dry cleaning service in Bangalore. Expert care for delicate fabrics, suits, dresses. Next-day delivery with free pickup.",
      keywords: "dry cleaning bangalore, professional dry cleaning, suit cleaning bangalore",
      canonical: "https://mixedwash.in/service/dry-cleaning"
    },
    premiumWash: {
      title: "Premium Wash Service - MixedWash Bangalore",
      description: "Premium laundry wash service in Bangalore with special fabric care. Gentle cleaning for delicate and expensive garments.",
      keywords: "premium wash bangalore, delicate fabric cleaning, luxury laundry service",
      canonical: "https://mixedwash.in/service/premium-wash"
    },
    steamIron: {
      title: "Steam Iron Service - MixedWash Bangalore",
      description: "Professional steam iron and pressing service in Bangalore. Crisp, wrinkle-free clothes delivered to your doorstep.",
      keywords: "steam iron bangalore, ironing service, clothes pressing bangalore",
      canonical: "https://mixedwash.in/service/steam-iron"
    }
  }
};
