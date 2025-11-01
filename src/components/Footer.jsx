import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 py-10 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Shop Section */}
          <div>
            <h4 className="text-base font-semibold mb-3 text-blue-700 uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/product?category=girls" className="hover:text-blue-600 transition-colors">Girls</Link></li>
              <li><Link href="/product?category=boys" className="hover:text-blue-600 transition-colors">Boys</Link></li>
              <li><Link href="/product?category=new-in" className="hover:text-blue-600 transition-colors">New In</Link></li>
              <li><Link href="/product?category=designers" className="hover:text-blue-600 transition-colors">Designers</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="text-base font-semibold mb-3 text-blue-700 uppercase tracking-wide">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/size-guide" className="hover:text-blue-600 transition-colors">Size Guide</Link></li>
              <li><Link href="/shipping" className="hover:text-blue-600 transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-blue-600 transition-colors">Returns</Link></li>
              <li><Link href="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="text-base font-semibold mb-3 text-blue-700 uppercase tracking-wide">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-base font-semibold mb-3 text-blue-700 uppercase tracking-wide">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: <span className="text-blue-600">hello@tinyfashion.com</span></li>
              <li>Phone: <span className="text-blue-600">+1 (555) 123-4567</span></li>
              <li>Address: <span className="text-blue-600">123 Fashion St, Style City</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 TinyFashion. All rights reserved. Designed with care for fashion-forward families.
          </p>
        </div>
      </div>
    </footer>
  );
}
