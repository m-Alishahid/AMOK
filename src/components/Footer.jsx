import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    
          <div>
            <h4 className="text-sm font-serif font-semibold mb-2">Shop</h4>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li><Link href="/product?category=girls"><a>Girls</a></Link></li>
              <li><Link href="/product?category=boys"><a>Boys</a></Link></li>
              <li><Link href="/product?category=new-in"><a>New In</a></Link></li>
              <li><Link href="/product?category=designers"><a>Designers</a></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-serif font-semibold mb-2">Support</h4>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li><Link href="/size-guide"><a>Size Guide</a></Link></li>
              <li><Link href="/shipping"><a>Shipping Info</a></Link></li>
              <li><Link href="/returns"><a>Returns</a></Link></li>
              <li><Link href="/faq"><a>FAQ</a></Link></li>
            </ul>
          </div>
        

        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
          <p className="text-sm">© 2025 Childrensalon Clone. All rights reserved.</p>
=======
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-pink-100">
              <li>📧 hello@tinyfashion.com</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>📍 123 Fashion St, Style City</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-pink-500 mt-8 pt-8 text-center">
          <p className="text-pink-200">&copy; 2024 TinyFashion. All rights reserved. Made with ❤️ for fashion lovers.</p>
        </div>
      </div>
    </footer>
  );
}
