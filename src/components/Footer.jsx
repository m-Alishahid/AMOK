import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">FashionHub</h3>
            <p className="text-pink-100 mb-4">Your ultimate destination for trendy fashion and style.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-pink-200 hover:text-white transition duration-300">📘</Link>
              <Link href="#" className="text-pink-200 hover:text-white transition duration-300">🐦</Link>
              <Link href="#" className="text-pink-200 hover:text-white transition duration-300">📷</Link>
              <Link href="#" className="text-pink-200 hover:text-white transition duration-300">💼</Link>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/product?category=women" className="text-pink-100 hover:text-white transition duration-300">Women</Link></li>
              <li><Link href="/product?category=men" className="text-pink-100 hover:text-white transition duration-300">Men</Link></li>
              <li><Link href="/product?category=kids" className="text-pink-100 hover:text-white transition duration-300">Kids</Link></li>
              <li><Link href="/product?category=accessories" className="text-pink-100 hover:text-white transition duration-300">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-pink-100 hover:text-white transition duration-300">Size Guide</Link></li>
              <li><Link href="#" className="text-pink-100 hover:text-white transition duration-300">Shipping Info</Link></li>
              <li><Link href="#" className="text-pink-100 hover:text-white transition duration-300">Returns</Link></li>
              <li><Link href="#" className="text-pink-100 hover:text-white transition duration-300">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-pink-100">
              <li>📧 hello@fashionhub.com</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>📍 123 Fashion St, Style City</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-pink-500 mt-8 pt-8 text-center">
          <p className="text-pink-200">&copy; 2024 FashionHub. All rights reserved. Made with ❤️ for fashion lovers.</p>
        </div>
      </div>
    </footer>
  );
}
