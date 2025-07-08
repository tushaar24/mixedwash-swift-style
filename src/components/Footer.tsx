
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t py-12" itemScope itemType="https://schema.org/Organization">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xl font-bold" itemProp="name">MixedWash</span>
          <p className="mt-2 text-sm text-gray-600" itemProp="description">
            Laundry Made Fun, Fast & Friendly.
          </p>
          <div className="mt-4 text-sm text-gray-600">
            <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <span itemProp="addressLocality">Bangalore</span>, 
              <span itemProp="addressRegion"> Karnataka</span>
            </span>
            <br />
            <span itemProp="telephone">+91-636-229-0686</span> | 
            <span itemProp="email"> contact@mixedwash.in</span>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-12 pt-6 text-center text-sm text-gray-600">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
            <a href="/privacy" className="hover:underline" rel="nofollow">Privacy Policy</a>
            <a href="/terms" className="hover:underline" rel="nofollow">Terms & Conditions</a>
            <a href="/contact" className="hover:underline">Contact Us</a>
          </div>
          <p>&copy; {currentYear} MixedWash. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Professional laundry and dry cleaning service in Bangalore | Next-day delivery guaranteed
          </p>
        </div>
      </div>
    </footer>
  );
};
