import { Link } from "wouter";
import { Book, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Book className="text-primary text-2xl mr-3" />
              <span className="text-2xl font-bold font-serif">BookBazaar</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted marketplace for buying and selling used books. Give your books a new life while discovering your next favorite read.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">For Buyers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/browse" className="hover:text-white transition-colors">Browse Books</Link></li>
              <li><Link href="/browse?category=fiction" className="hover:text-white transition-colors">Search by Category</Link></li>
              <li><Link href="/browse" className="hover:text-white transition-colors">Advanced Search</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Buyer Protection</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">For Sellers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/seller-dashboard" className="hover:text-white transition-colors">Start Selling</Link></li>
              <li><Link href="/seller-dashboard" className="hover:text-white transition-colors">Seller Dashboard</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Seller Resources</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Forum</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BookBazaar. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}
