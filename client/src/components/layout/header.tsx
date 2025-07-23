import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/auth";
import { Book, Menu, Search, ShoppingCart, User } from "lucide-react";

export function Header() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const user = auth.getCurrentUser();
  const isAuthenticated = auth.isAuthenticated();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Book className="text-primary text-2xl mr-3" />
            <span className="text-2xl font-bold text-gray-900 font-serif">BoOKNOW</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search books by title, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-full"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/browse" className="text-gray-700 hover:text-primary transition-colors">
              Browse
            </Link>
            
            {isAuthenticated ? (
              <>
                {auth.isSeller() && (
                  <Link href="/seller-dashboard" className="text-gray-700 hover:text-primary transition-colors">
                    Sell
                  </Link>
                )}
                <Link href="/messages" className="text-gray-700 hover:text-primary transition-colors">
                  Messages
                </Link>
                <Link href="/cart" className="relative text-gray-700 hover:text-primary transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartItems.length}
                    </Badge>
                  )}
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Hi, {user?.name}</span>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={() => navigate("/login")} className="bg-primary text-white hover:bg-blue-700">
                Sign In
              </Button>
            )}
          </nav>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-6 mt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </form>

                <div className="flex flex-col space-y-4">
                  <Link href="/browse" className="text-gray-700 hover:text-primary transition-colors">
                    Browse
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      {auth.isSeller() && (
                        <Link href="/seller-dashboard" className="text-gray-700 hover:text-primary transition-colors">
                          Sell
                        </Link>
                      )}
                      <Link href="/messages" className="text-gray-700 hover:text-primary transition-colors">
                        Messages
                      </Link>
                      <Link href="/cart" className="text-gray-700 hover:text-primary transition-colors">
                        Cart ({cartItems.length})
                      </Link>
                      <Link href="/orders" className="text-gray-700 hover:text-primary transition-colors">
                        Orders
                      </Link>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">Hi, {user?.name}</p>
                        <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button onClick={() => navigate("/login")} className="bg-primary text-white hover:bg-blue-700">
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
