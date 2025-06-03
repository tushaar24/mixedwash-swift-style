export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-bold">MixedWash</span>
            <p className="mt-2 text-sm text-gray-600">
              Laundry Made Fun, Fast & Friendly.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">Wash & Fold</a></li>
              <li><a href="#" className="hover:underline">Wash & Iron</a></li>
              <li><a href="#" className="hover:underline">Heavy Wash</a></li>
              <li><a href="#" className="hover:underline">Dry Cleaning</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-3">About</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">Our Story</a></li>
              <li><a href="#" className="hover:underline">How It Works</a></li>
              <li><a href="#" className="hover:underline">FAQ</a></li>
              <li><a href="#" className="hover:underline">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-3">Connect</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">Instagram</a></li>
              <li><a href="#" className="hover:underline">Twitter</a></li>
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-12 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {currentYear} MixedWash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
