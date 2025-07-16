import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequestWithAuth, auth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingCart, MessageSquare, Star, User } from "lucide-react";
import type { Book } from "@/lib/types";

export default function BookDetail() {
  const [location, navigate] = useLocation();
  const bookId = location.split('/').pop();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = auth.getCurrentUser();

  const { data: book, isLoading } = useQuery<Book>({
    queryKey: [`/api/books/${bookId}`],
    enabled: !!bookId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequestWithAuth('POST', '/api/cart', { bookId: book?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: `${book?.title} has been added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'like_new':
        return 'bg-green-100 text-green-800';
      case 'very_good':
        return 'bg-blue-100 text-blue-800';
      case 'good':
        return 'bg-yellow-100 text-yellow-800';
      case 'acceptable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCondition = (condition: string) => {
    return condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h1>
            <Button onClick={() => navigate("/browse")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === book.sellerId;
  const canPurchase = auth.isAuthenticated() && !isOwner && book.isAvailable;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          onClick={() => navigate("/browse")}
          variant="outline"
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Image */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src={book.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=faces"}
              alt={book.title}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge className={getConditionColor(book.condition)}>
                  {formatCondition(book.condition)}
                </Badge>
                <span className="text-3xl font-bold text-primary">${book.price}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
              
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600">4.5 (89 reviews)</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Book Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{book.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{formatCondition(book.condition)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-medium ${book.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {book.isAvailable ? 'Available' : 'Sold'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {canPurchase && (
                <Button
                  onClick={() => addToCartMutation.mutate()}
                  disabled={addToCartMutation.isPending}
                  className="w-full bg-primary text-white hover:bg-blue-700"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              )}

              {auth.isAuthenticated() && !isOwner && (
                <Button
                  onClick={() => navigate(`/messages?seller=${book.sellerId}&book=${book.id}`)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Message Seller
                </Button>
              )}

              {!auth.isAuthenticated() && (
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full bg-primary text-white hover:bg-blue-700"
                  size="lg"
                >
                  Sign In to Purchase
                </Button>
              )}

              {isOwner && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => navigate(`/seller-dashboard?edit=${book.id}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    Edit Listing
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                  >
                    Delete Listing
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
