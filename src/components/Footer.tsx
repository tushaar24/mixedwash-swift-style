
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <span className="text-xl font-bold">MixedWash</span>
          <p className="mt-2 text-sm text-gray-600">
            Laundry Made Fun, Fast & Friendly.
          </p>
        </div>
        
        <div className="border-t border-gray-100 mt-12 pt-6 text-center text-sm text-gray-600">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <a href="/terms-conditions" className="hover:underline">Terms & Conditions</a>
          </div>
          <p>&copy; {currentYear} MixedWash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
