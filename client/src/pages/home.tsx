import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookCard } from "@/components/book-card";
import { Book, GraduationCap, Lightbulb, Baby, Clock, FlaskConical } from "lucide-react";
import type { Book as BookType } from "@/lib/types";

const categories = [
  { id: 'fiction', name: 'Fiction', icon: Book },
  { id: 'academic', name: 'Academic', icon: GraduationCap },
  { id: 'self_help', name: 'Self-Help', icon: Lightbulb },
  { id: 'children', name: 'Children', icon: Baby },
  { id: 'history', name: 'History', icon: Clock },
  { id: 'science', name: 'Science', icon: FlaskConical },
];

export default function Home() {
  const { data: books = [], isLoading } = useQuery<BookType[]>({
    queryKey: ['/api/books'],
  });

  const featuredBooks = books.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
              Find Your Next <span className="text-yellow-300">Great Read</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover thousands of used books at unbeatable prices. Buy from trusted sellers or start selling your own collection today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Browse Books
                </Button>
              </Link>
              <Link href="/seller-dashboard">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 font-serif">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.id} href={`/browse?category=${category.id}`}>
                  <div className="text-center group cursor-pointer">
                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-700 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold font-serif">Featured Books</h2>
            <Link href="/browse">
              <Button variant="link" className="text-primary font-semibold">
                View All
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seller CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 font-serif">Start Selling Today</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of sellers who have found new homes for their books while earning extra income.
            </p>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">List Your Books</h4>
                    <p className="text-gray-600">Upload photos and descriptions of your books. Our smart pricing tool helps you set competitive prices.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Connect with Buyers</h4>
                    <p className="text-gray-600">Our messaging system makes it easy to answer questions and negotiate with potential buyers.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Get Paid</h4>
                    <p className="text-gray-600">Secure payment processing ensures you get paid quickly once your book is sold.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Link href="/seller-dashboard">
                  <Button size="lg" className="bg-primary text-white hover:bg-blue-700">
                    Get Started Selling
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
